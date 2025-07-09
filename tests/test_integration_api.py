def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}

def test_ask_endpoint(client):
    payload = {"question": "什么是重入？", "top_k": 3}
    resp = client.post("/ask", json=payload)
    assert resp.status_code == 200
    assert resp.json()["answer"] == "mock answer"