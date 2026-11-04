"""Filtro por modalidade no FINEP: é o filtro acionado pelo clique no gráfico de tipo."""
import pytest

from app import models
from tests.conftest import TestingSessionLocal


@pytest.fixture(scope="module", autouse=True)
def dados(client):
    db = TestingSessionLocal()
    db.add_all([
        models.ProjetoPDI(titulo="F1", agencia_fomento="FINEP", modalidade="Projeto interno", centro="CCN", valor_total=1_000_000),
        models.ProjetoPDI(titulo="F2", agencia_fomento="FINEP", modalidade=" PROJETO INTERNO ", centro="CCE", valor_total=2_000_000),
        models.ProjetoPDI(titulo="F3", agencia_fomento="FINEP", modalidade="Projeto externo", centro="CCN", valor_total=4_000_000),
        models.ProjetoPDI(titulo="Outro", agencia_fomento="CNPq", modalidade="Projeto interno", centro="CCN", valor_total=8_000_000),
    ])
    db.commit()
    yield
    db.query(models.ProjetoPDI).delete()
    db.commit()
    db.close()


def test_opcoes_de_modalidade_batem_com_as_fatias(client):
    filtros = client.get("/finep/filtros").json()
    fatias = [d["tipo"] for d in client.get("/finep/relacao-tipo").json()]
    assert filtros["modalidades"] == ["Projeto Externo", "Projeto Interno"]
    assert sorted(fatias) == filtros["modalidades"]


def test_rotulo_da_fatia_filtra_todas_as_grafias(client):
    r = client.get("/finep/por-centro", params={"modalidade": ["Projeto Interno"]})
    assert sorted(r.json(), key=lambda d: d["centro"]) == [
        {"centro": "CCE", "valor_mi": 2.0},
        {"centro": "CCN", "valor_mi": 1.0},
    ]


def test_filtro_de_modalidade_nao_restringe_as_proprias_opcoes(client):
    filtros = client.get("/finep/filtros", params={"modalidade": ["Projeto Externo"]}).json()
    assert filtros["modalidades"] == ["Projeto Externo", "Projeto Interno"]
    assert filtros["centros"] == ["CCN"]
