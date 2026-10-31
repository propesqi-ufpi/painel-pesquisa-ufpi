"""Regressão do DAD-01: filtros de seleção múltipla casam o valor inteiro, não trechos."""
import pytest

from app import models
from tests.conftest import TestingSessionLocal


@pytest.fixture(scope="module", autouse=True)
def dados(client):
    db = TestingSessionLocal()
    db.add_all([
        models.ProjetoPDI(titulo="Projeto CT 1", centro="CT", area="Engenharias", situacao="Em andamento"),
        models.ProjetoPDI(titulo="Projeto CT 2", centro=" ct ", area="Engenharias", situacao="Concluído"),
        models.ProjetoPDI(titulo="Projeto CTT", centro="CTT", area="Engenharias", situacao="Concluído"),
        models.ProjetoPDI(titulo="Projeto CCA", centro="CCA", area="Ciências Agrárias", situacao="Concluído"),
        models.NucleoPesquisa(denominacao="Núcleo A", situacao="Ativo", centro_campus="CCN"),
        models.NucleoPesquisa(denominacao="Núcleo B", situacao="Inativo", centro_campus="CCN"),
        models.Bolsista(nome="Pessoa 1", campus_centro="CT", orgao="CNPq"),
        models.Bolsista(nome="Pessoa 2", campus_centro="CTT", orgao="CNPq"),
    ])
    db.commit()
    yield
    for modelo in (models.ProjetoPDI, models.NucleoPesquisa, models.Bolsista):
        db.query(modelo).delete()
    db.commit()
    db.close()


def _titulos(resp):
    return sorted(p["titulo"] for p in resp.json())


def test_centro_ct_nao_traz_ctt(client):
    r = client.get("/projetos/pdi", params={"centro": ["CT"]})
    assert r.status_code == 200
    assert _titulos(r) == ["Projeto CT 1", "Projeto CT 2"]


def test_centro_ignora_caixa_e_espacos(client):
    r = client.get("/projetos/pdi", params={"centro": ["ct"]})
    assert _titulos(r) == ["Projeto CT 1", "Projeto CT 2"]


def test_selecao_multipla_soma_valores(client):
    r = client.get("/projetos/pdi", params={"centro": ["CT", "CCA"]})
    assert _titulos(r) == ["Projeto CCA", "Projeto CT 1", "Projeto CT 2"]


def test_grafico_por_centro_respeita_filtro_exato(client):
    r = client.get("/projetos/pdi/por-centro", params={"centro": ["CTT"]})
    assert r.json() == [{"centro": "CTT", "total": 1}]


def test_opcoes_de_filtro_cruzadas_sem_vazamento(client):
    r = client.get("/projetos/pdi/filtros", params={"centro": ["CTT"]})
    assert r.json()["situacoes"] == ["Concluído"]


def test_nucleo_ativo_nao_traz_inativo(client):
    r = client.get("/nucleos", params={"situacao": ["ativo"]})
    assert r.status_code == 200
    assert [n["denominacao"] for n in r.json()] == ["Núcleo A"]


def test_bolsista_campus_ct_nao_traz_ctt(client):
    r = client.get("/bolsistas", params={"campus_centro": ["CT"]})
    assert r.status_code == 200
    assert [b["nome"] for b in r.json()] == ["Pessoa 1"]
