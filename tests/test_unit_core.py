"""
Shared pytest fixtures for FastAPI app testing
----------------------------------------------
* Adds project root & app/ to PYTHONPATH
* Mocks Supabase, Gemini, and embed_text to avoid external calls
"""

import sys
import types
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# ------------------------------------------------------------------#
# 1️⃣  确保 import rag_audit_api 可用
# ------------------------------------------------------------------#
ROOT = Path(__file__).resolve().parents[1]      # 项目根目录
APP_DIR = ROOT / "app"                          # 应用目录
for p in (ROOT, APP_DIR):
    sys.path.insert(0, str(p))

import rag_audit_api  # noqa: E402

# ------------------------------------------------------------------#
# 2️⃣  公共 TestClient，mock 外部依赖
# ------------------------------------------------------------------#
@pytest.fixture(scope="session")
def client(monkeypatch):
    """FastAPI TestClient，屏蔽真实 Supabase/Gemini 调用"""
    # ------- mock Supabase（最小 insert/select） -------------------
    fake_supabase = types.SimpleNamespace(
        table=lambda *_: types.SimpleNamespace(
            insert=lambda *__: None,
            select=lambda *__: types.SimpleNamespace(
                order=lambda *__: types.SimpleNamespace(
                    limit=lambda *__: types.SimpleNamespace(
                        execute=lambda: types.SimpleNamespace(data=[])
                    )
                )
            ),
        ),
        rpc=lambda *_: types.SimpleNamespace(
            execute=lambda: types.SimpleNamespace(data=[])
        ),
    )
    monkeypatch.setattr(rag_audit_api, "supabase", fake_supabase, raising=False)

    # ------- mock embed_text -> 返回零向量 --------------------------
    monkeypatch.setattr(
        rag_audit_api, "embed_text", lambda *_: [0.0] * 768, raising=False
    )

    # ------- mock Gemini generate_content --------------------------
    def fake_generate_content(*args, **kwargs):
        return types.SimpleNamespace(text="mock answer")

    monkeypatch.setattr(
        rag_audit_api.genai, "generate_content", fake_generate_content, raising=False
    )

    return TestClient(rag_audit_api.app)