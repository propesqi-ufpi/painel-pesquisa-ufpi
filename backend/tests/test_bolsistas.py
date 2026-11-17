def test_bolsistas_kpis_retorna_200(client):
    r = client.get("/bolsistas/kpis")
    assert r.status_code == 200


def test_bolsistas_kpis_campos(client):
    data = client.get("/bolsistas/kpis").json()
    assert "total_cnpq" in data
    assert "total_ufpi" in data
    assert "total" in data


def test_bolsistas_filtros_retorna_200(client):
    r = client.get("/bolsistas/filtros")
    assert r.status_code == 200


def test_bolsistas_filtros_campos(client):
    data = client.get("/bolsistas/filtros").json()
    for chave in ("modalidades", "orgaos", "campi", "nomes"):
        assert chave in data
        assert isinstance(data[chave], list)


def test_bolsistas_por_campus_retorna_200(client):
    r = client.get("/bolsistas/por-campus")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_bolsistas_lista_retorna_200(client):
    r = client.get("/bolsistas/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_bolsistas_lista_respeita_limit(client):
    r = client.get("/bolsistas/?limit=5")
    assert r.status_code == 200
    assert len(r.json()) <= 5


def test_bolsistas_filtro_nome_aceita_parametro(client):
    r = client.get("/bolsistas/?nome=Silva")
    assert r.status_code == 200


def test_bolsistas_filtro_modalidade_aceita_parametro(client):
    r = client.get("/bolsistas/?modalidade=PQ")
    assert r.status_code == 200


def test_bolsistas_detalhe_inexistente_retorna_404(client):
    r = client.get("/bolsistas/999999")
    assert r.status_code == 404


def test_bolsistas_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/bolsistas/")
    assert r.status_code == 401


def test_bolsistas_kpis_sem_auth_retorna_401(client_sem_auth):
    r = client_sem_auth.get("/bolsistas/kpis")
    assert r.status_code == 401


def test_bolsistas_lista_em_ordem_alfabetica(client):
    from app import models
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    db.add_all([models.Bolsista(nome=n, campus_centro="CCN") for n in ("Zuleide", "Ana", "Mário")])
    db.commit()
    try:
        nomes = [b["nome"] for b in client.get("/bolsistas/?campus_centro=CCN").json()]
        assert nomes == ["Ana", "Mário", "Zuleide"]
    finally:
        db.query(models.Bolsista).filter(models.Bolsista.campus_centro == "CCN").delete()
        db.commit()
        db.close()
