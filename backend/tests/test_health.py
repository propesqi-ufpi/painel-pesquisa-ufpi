def test_health_retorna_200(client):
    r = client.get("/health")
    assert r.status_code == 200


def test_health_retorna_status_ok(client):
    r = client.get("/health")
    assert r.json()["status"] == "ok"


def test_health_retorna_versao(client):
    r = client.get("/health")
    assert "versao" in r.json()


def test_health_aceita_head(client):
    r = client.head("/health")
    assert r.status_code == 200
