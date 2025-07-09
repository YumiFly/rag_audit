# 📦 部署模板：AI 链上审计 API

以下内容提供 **完整的项目目录结构**、`Dockerfile`、示例环境变量文件、以及一键启动脚本，方便你在任何支持 Docker 的环境中快速运行。

---

## 1. 目录结构

```text
rag-audit-api/
├── app/
│   └── rag_audit_api.py          # FastAPI 主应用（已包含 Slither/Echidna 调用）
├── requirements.txt              # Python 依赖
├── Dockerfile                    # 镜像构建文件
├── .env.example                  # 环境变量示例
└── start.sh                      # 一键启动脚本
```

> 建议将 `rag_audit_api.py` 放入 `app/` 子目录，保持镜像层整洁。

---

## 2. requirements.txt

```txt
fastapi
uvicorn[standard]
supabase
python-multipart
google-generativeai
slither-analyzer
```

> **注意**：Echidna 运行通过容器内再调用 Docker（trailofbits/eth-security-toolbox）。因此宿主机需运行 Docker Daemon，并在 `docker run` 时挂载 `-v /var/run/docker.sock:/var/run/docker.sock`。

---

## 3. Dockerfile

```dockerfile
FROM python:3.11-slim AS base

# ========= 1. 系统依赖 =========
RUN apt-get update && apt-get install -y \
    build-essential \
    curl git jq solc \
    docker.io          # 用于在容器内再次调用 docker（echidna）\
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ========= 2. Python 依赖 =========
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# ========= 3. 复制应用代码 =========
WORKDIR /app
COPY app/ /app/app/

# ========= 4. 暴露端口 =========
EXPOSE 8000

# ========= 5. 启动命令 =========
CMD ["bash", "start.sh"]
```

---

## 4. .env.example

```env
# Supabase 项目
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Gemini (Google Generative AI) API
GOOGLE_API_KEY=your-gemini-pro-key

# （可选）Etherscan – 允许仅用地址检索源码
ETHERSCAN_API_KEY=etherscan-api-key
```

> 复制为 `.env` 并填入真实凭据。

---

## 5. start.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

# 读取环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 默认使用多进程 workers=2，可按需调整
exec uvicorn app.rag_audit_api:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers ${UVICORN_WORKERS:-2}
```

> 别忘了给脚本执行权限：`chmod +x start.sh`。

---

## 6. 构建与运行

```bash
# 1) 构建镜像
docker build -t rag-audit-api .

# 2) 运行容器（挂载 docker.sock 以便 Echidna 调用）
docker run -it \
  --env-file .env \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  rag-audit-api
```

> 访问 `http://localhost:8000/docs` 查看 Swagger UI。

---

## 7. 进阶优化

| 方向    | 提示                                              |
| ----- | ----------------------------------------------- |
| 缓存    | 将 Slither/Echidna 输出缓存到卷，避免重复分析同源码              |
| 安全    | 使用 rootless Docker / Podman，减少容器内对宿主 Docker 的依赖 |
| CI/CD | 用 GitHub Actions 构建并推送镜像，自动部署到 Kubernetes / ECS |

如需更多自动化脚本（Compose、K8s Helm）、或想拆分前后端镜像，随时告诉我！

