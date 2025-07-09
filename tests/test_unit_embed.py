import builtins, types, pytest
from app.rag_audit_api import embed_text

class DummyResp(dict):
    @property
    def text(self):
        return "ok"
dummy_vec = [0.1] * 768

@pytest.fixture(autouse=True)
def patch_genai(monkeypatch):
    fake_genai = types.SimpleNamespace()
    def fake_embed_content(**kw):
        return {"embedding": dummy_vec}
    fake_genai.embed_content = fake_embed_content
    monkeypatch.setitem(builtins.__dict__, "genai", fake_genai)
    yield

def test_embed_text_returns_vector():
    vec = embed_text("hello")
    assert vec == dummy_vec
    assert len(vec) == 768