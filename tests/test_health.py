def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    body = response.text
    assert "http_requests_total" in body or "python_gc" in body
