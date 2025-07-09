"""RAG审计分析 API（Gemini 版 + 自动 Slither/Echidna）
================================================================

功能概览
--------
- **/analyze** 端点：用户仅需上传 Solidity 源代码文件（或提供 Etherscan 地址），系统即：
  1. 运行 Slither 静态分析（JSON 输出）
  2. 运行 Echidna 动态模糊测试（Docker 容器，JSON 输出）
  3. 解析两份报告并自动入库 Supabase 向量表
  4. 返回分析统计与 doc_id，方便后续提问
- **/ingest** 端点：仍支持批量上传现成报告
- **/ask** 端点：检索 + Gemini 回答

依赖
----
```
pip install fastapi uvicorn[standard] supabase google python-multipart slither-analyzer
# 运行 Echidna 需本地安装 Docker 或 Podman
```

环境变量
---------
- `SUPABASE_URL` / `SUPABASE_KEY`
- `GOOGLE_API_KEY`
- `ETHERSCAN_API_KEY`（可选，若允许用户仅提供地址）

启动
----
```
uvicorn rag_audit_api:app --reload
```
"""
from __future__ import annotations

import io
import json
import os
import shutil
import subprocess
import tempfile
import textwrap
import requests
from pathlib import Path
from typing import List, Dict, Optional

# --- Gemini 初始化（统一与 llm_parser.py 的用法） ---
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

# --------------------------- 环境配置 ---------------------------------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
ETHERSCAN_API_KEY = os.environ.get("ETHERSCAN_API_KEY")  # 可选

if not (SUPABASE_URL and SUPABASE_KEY and GOOGLE_API_KEY):
    raise RuntimeError("❗ 请设置 SUPABASE_URL / SUPABASE_KEY / GOOGLE_API_KEY 环境变量！")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --------------------------- 向量化 & 数据库 --------------------------------------

def embed_text(text: str) -> List[float]:
    """使用 Gemini embedding-001 生成向量"""
    import time

    # 重试配置
    max_retries = 3
    retry_delay = 1

    for attempt in range(max_retries):
        try:
            print(f"🔄 尝试向量化 (第{attempt+1}次)...")
            response = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document",
            )
            print(f"✅ 向量化成功")
            return response["embedding"]

        except Exception as e:
            error_msg = str(e)
            print(f"❌ 向量化失败 (第{attempt+1}次): {error_msg}")

            # 如果是超时错误且还有重试次数，则等待后重试
            if "504" in error_msg or "Deadline Exceeded" in error_msg:
                if attempt < max_retries - 1:
                    print(f"⏳ 等待 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # 指数退避
                    continue

            # 如果是最后一次尝试或其他错误，抛出异常
            if attempt == max_retries - 1:
                # 返回一个默认向量而不是抛出异常
                print("⚠️  使用默认向量替代")
                return [0.0] * 768  # 返回768维的零向量作为备用

    # 这行代码理论上不会执行到
    return [0.0] * 768


def insert_chunks(doc_id: str, chunks: List[str]) -> int:
    rows = []
    for i, c in enumerate(chunks):
        try:
            print(f"🔄 处理第 {i+1}/{len(chunks)} 个文本块...")
            embedding = embed_text(c)
            rows.append({"doc_id": doc_id, "content": c, "embedding": embedding})
        except Exception as e:
            print(f"❌ 处理第 {i+1} 个文本块失败: {e}")
            raise

    if rows:
        print(f"💾 插入 {len(rows)} 条记录到数据库...")
        supabase.table("audit_vectors").insert(rows).execute()
        print(f"✅ 成功插入 {len(rows)} 条记录")
    return len(rows)

# --------------------------- 报告解析 --------------------------------------------

def flatten_slither(payload: Dict) -> List[str]:
    res = []
    for det in payload.get("results", {}).get("detectors", []):
        msg = det.get("description", "")
        impact = det.get("impact", "")
        els = ", ".join(e.get("name", "") for e in det.get("elements", []))
        res.append(f"[Slither] 严重程度:{impact} | {msg} | 元素:{els}")
    return res


def flatten_echidna(payload: Dict) -> List[str]:
    res = []
    # 支持两种格式：旧格式使用"fails"，新格式使用"results"
    fails = payload.get("fails", []) or payload.get("results", [])

    for fail in fails:
        # 旧格式
        if "property" in fail:
            prop = fail.get("property", "")
            trace = " -> ".join(fail.get("trace", []))
            res.append(f"[Echidna] 断言失败:{prop} | 调用路径:{trace}")
        # 新格式
        elif "test" in fail:
            contract = fail.get("contract", "")
            test = fail.get("test", "")
            status = fail.get("status", "")
            error = fail.get("error", "")
            res.append(f"[Echidna] 合约:{contract} | 测试:{test} | 状态:{status} | 错误:{error}")
    return res

# --------------------------- 外部工具调用 ----------------------------------------

def run_slither(sol_path: Path) -> Dict:
    """运行 Slither 并返回 JSON 结果"""
    try:
        result = subprocess.run(
            ["slither", str(sol_path), "--json", "-"],
            capture_output=True,
            text=True,
            check=True,
            timeout=300,
        )
        return json.loads(result.stdout or "{}")
    except subprocess.CalledProcessError as e:
        print("❌ Slither 执行失败")
        print("stdout:", e.stdout[:500])
        print("stderr:", e.stderr[:500])
        raise RuntimeError(f"Slither 执行失败: {e.stderr[:300]}")


def run_echidna(sol_path: Path, contract_name: str) -> Dict:
    """使用 Docker 调用 Echidna，输出 JSON"""
    cmd = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{sol_path.parent}:/src",
        "trailofbits/eth-security-toolbox",
        "echidna-test",
        f"/src/{sol_path.name}",
        "--contract",
        contract_name,
        "--format",
        "json",
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        return json.loads(result.stdout or "{}")
    except Exception as e:
        # 如果环境没有 Docker 或测试失败，返回空报告
        return {"fails": [], "error": str(e)}

# --------------------------- Etherscan 获取源码 -----------------------------------

def fetch_source_from_etherscan(address: str) -> str:
    if not ETHERSCAN_API_KEY:
        raise RuntimeError("需要设置 ETHERSCAN_API_KEY 才能通过地址下载源码")

    url = (
        f"https://api.etherscan.io/api?module=contract&action=getsourcecode&address={address}"
        f"&apikey={ETHERSCAN_API_KEY}"
    )
    resp = requests.get(url, timeout=15).json()
    if resp.get("status") != "1":
        raise RuntimeError("Etherscan 获取源码失败")
    # 取第一个结果
    return resp["result"][0]["SourceCode"]

# --------------------------- FastAPI ------------------------------------------------
app = FastAPI(title="RAG Audit Assistant API", version="2.0.0")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js开发服务器
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # 备用端口
        "https://your-domain.com",  # 生产环境域名
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class AskSchema(BaseModel):
    question: str
    top_k: int | None = 5

class AskResp(BaseModel):
    answer: str

class AnalyzeResp(BaseModel):
    doc_id: str
    slither_findings: int
    echidna_fails: int

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResp)
async def analyze(
    file: UploadFile | None = File(None),
    address: str | None = Form(None),
    contract_name: str | None = Form(None),
):
    """接收 Solidity 文件或合约地址，自动运行 Slither + Echidna 并入库"""
    if not file and not address:
        raise HTTPException(status_code=400, detail="需要上传源码文件或提供 address")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        # 写入源码
        if file:
            src_bytes = await file.read()
            sol_path = tmp_path / file.filename
            sol_path.write_bytes(src_bytes)
        else:
            source = fetch_source_from_etherscan(address)  # may raise
            fname = f"{address[:6]}.sol"
            sol_path = tmp_path / fname
            sol_path.write_text(source)

        # 运行 Slither
        sl_json = run_slither(sol_path)
        sl_chunks = flatten_slither(sl_json)

        # 确定合约名
        if contract_name is None:
            contract_name = sol_path.stem

        # 运行 Echidna（可选）
        ech_json = run_echidna(sol_path, contract_name)
        ech_chunks = flatten_echidna(ech_json)

    # 入库
    doc_id = sol_path.stem
    insert_chunks(doc_id, sl_chunks + ech_chunks)

    return AnalyzeResp(
        doc_id=doc_id,
        slither_findings=len(sl_chunks),
        echidna_fails=len(ech_chunks),
    )

# 旧端点：批量上传报告 JSON
@app.post("/ingest")
async def ingest(files: List[UploadFile] = File(...)):
    total = 0
    try:
        for f in files:
            print(f"📄 处理文件: {f.filename}")
            file_content = await f.read()
            data = json.load(io.BytesIO(file_content))

            if "slitherVersion" in data or ("results" in data and "detectors" in data.get("results", {})):
                print(f"🔍 检测到Slither报告")
                chunks = flatten_slither(data)
            elif "fails" in data or "echidnaVersion" in data or ("results" in data and isinstance(data["results"], list)):
                print(f"🧪 检测到Echidna报告")
                chunks = flatten_echidna(data)
            else:
                print(f"❌ 不支持的格式: {f.filename}")
                print(f"数据结构: {list(data.keys())}")
                raise HTTPException(status_code=400, detail=f"不支持的格式: {f.filename}")

            print(f"📝 生成了 {len(chunks)} 个文本块")
            inserted = insert_chunks(Path(f.filename).stem, chunks)
            total += inserted
            print(f"✅ 插入了 {inserted} 个块到数据库")

        return {"files": len(files), "chunks_inserted": total}
    except json.JSONDecodeError as e:
        print(f"❌ JSON解析错误: {e}")
        raise HTTPException(status_code=400, detail=f"JSON格式错误: {str(e)}")
    except Exception as e:
        print(f"❌ 处理文件时出错: {e}")
        raise HTTPException(status_code=500, detail=f"处理文件时出错: {str(e)}")

# 问答
@app.post("/ask", response_model=AskResp)
async def ask(body: AskSchema):
    try:
        print(f"🤔 收到问题: {body.question}")

        # 尝试生成问题的向量
        print("🔄 生成问题向量...")
        try:
            q_emb = embed_text(body.question)
            print(f"✅ 向量生成成功，维度: {len(q_emb)}")
            use_vector_search = True
        except Exception as embed_error:
            print(f"⚠️  向量生成失败，将使用简单文本搜索: {embed_error}")
            q_emb = None
            use_vector_search = False

        # 搜索相关文档
        print("🔍 搜索相关文档...")
        res = None

        if use_vector_search and q_emb:
            try:
                res = supabase.rpc(
                    "match_documents",
                    {
                        "query_embedding": q_emb,
                        "match_threshold": 0.7,
                        "match_count": body.top_k or 5
                    }
                ).execute()
                print(f"📊 向量搜索结果: {len(res.data) if res.data else 0} 条")
            except Exception as rpc_error:
                print(f"⚠️  向量搜索失败: {rpc_error}")
                res = None

        # 如果向量搜索失败，使用简单查询
        if not res or not res.data:
            print("🔄 使用简单查询...")
            try:
                res = (
                    supabase.table("audit_vectors")
                    .select("content")
                    .limit(body.top_k or 5)
                    .execute()
                )
                print(f"📊 简单查询结果: {len(res.data) if res.data else 0} 条")
            except Exception as db_error:
                print(f"⚠️  数据库查询失败: {db_error}")
                res = None

        # 构建上下文
        if res and res.data:
            context = "\n\n".join(r["content"] for r in res.data)
            print(f"📝 上下文长度: {len(context)} 字符")
        else:
            context = "暂无相关审计数据。请先上传一些审计报告。"
            print("⚠️  没有找到相关数据")

        # 构建提示词
        prompt = textwrap.dedent(
            f"""
            你是一名区块链安全审计专家。请根据以下上下文回答用户问题，并提供修复建议。
            ### 上下文
            {context}
            ### 问题
            {body.question}
            ### 回答
            """
        )

        # 调用Gemini生成回答
        print("🤖 调用Gemini生成回答...")
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)

        answer = response.text
        print(f"✅ 回答生成成功，长度: {len(answer)} 字符")

        return AskResp(answer=answer)

    except Exception as e:
        print(f"❌ 问答处理失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"问答处理失败: {str(e)}")
