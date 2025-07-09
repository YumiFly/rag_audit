# -- Ensure PYTHONPATH includes project root and app/ --
import sys, os, pathlib
BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
APP_DIR = BASE_DIR / "app"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(APP_DIR))

import types, builtins, pytest
from fastapi.testclient import TestClient
from rag_audit_api import app

@pytest.fixture
def client(monkeypatch):
    # 1. mock Supabase
    fake_supabase = types.SimpleNamespace(
        table=lambda *_: types.SimpleNamespace(insert=lambda *__: None),
        rpc=lambda *_: types.SimpleNamespace(execute=lambda: types.SimpleNamespace(data=[]))
    )
    monkeypatch.setitem(builtins.__dict__, "supabase", fake_supabase)

    # 2. mock embed_text 返回零向量
    from app import rag_audit_api as api
    monkeypatch.setattr(api, "embed_text", lambda *_: [0.0]*768, create=True)

    # 3. mock Gemini.generate_content
    def fake_generate_content(*args, **kw):
        return types.SimpleNamespace(text="mock answer")
    monkeypatch.setattr(api, "genai", types.SimpleNamespace(
        GenerativeModel=lambda *_: types.SimpleNamespace(generate_content=fake_generate_content)
    ), create=True)

    return TestClient(app)