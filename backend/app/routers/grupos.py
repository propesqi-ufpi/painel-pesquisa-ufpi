from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/grupos", tags=["Grupos de Pesquisa"])

_G = models.GrupoPesquisa


def _filtrar_grupos(q, nomes=None, areas=None, anos_envio=None):
    if nomes:      q = q.filter(or_(*[_G.nome_grupo.ilike(f"%{v}%") for v in nomes]))
    if areas:      q = q.filter(or_(*[_G.area_predominante.ilike(f"%{v}%") for v in areas]))
    if anos_envio: q = q.filter(or_(*[_G.ultimo_envio.ilike(f"%/{y}") for y in anos_envio]))
    return q


@router.get("/kpis")
def grupos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(func.distinct(func.lower(func.trim(_G.nome_grupo)))))
        .filter(_G.status.ilike("certificado"))
        .scalar() or 0
    )
    return {"total_grupos": total}


@router.get("/filtros")
def grupos_filtros(
    nome_grupo:        list[str] = Query(default=[]),
    area_predominante: list[str] = Query(default=[]),
    ultimo_envio:      list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _q(exc=None):
        return _filtrar_grupos(
            db.query(_G),
            nomes=      nome_grupo        if exc != 'nome_grupo'        else None,
            areas=      area_predominante if exc != 'area_predominante' else None,
            anos_envio= ultimo_envio      if exc != 'ultimo_envio'      else None,
        )

    def _str_vals(col, campo):
        return sorted(
            r[0] for r in _q(campo).with_entities(col)
            .filter(col != None).distinct().all()
        )

    datas = [
        r[0] for r in _q('ultimo_envio').with_entities(_G.ultimo_envio)
        .filter(_G.ultimo_envio != None).distinct().all()
    ]
    anos_envio = sorted(
        {v[-4:] for v in datas if v and len(v) >= 4 and v[-4:].isdigit()},
        reverse=True,
    )

    return {
        "nomes":      _str_vals(_G.nome_grupo,        'nome_grupo'),
        "areas":      _str_vals(_G.area_predominante, 'area_predominante'),
        "anos_envio": anos_envio,
    }


@router.get("/por-area")
def grupos_por_area(
    nome_grupo:        list[str] = Query(default=[]),
    area_predominante: list[str] = Query(default=[]),
    ultimo_envio:      list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_G.area_predominante, func.count(_G.id).label("total"))
    q = q.filter(_G.area_predominante != None)
    q = _filtrar_grupos(q, nome_grupo, area_predominante, ultimo_envio)
    rows = (
        q.group_by(_G.area_predominante)
        .order_by(func.count(_G.id).desc())
        .all()
    )
    return [{"area": r.area_predominante, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.GrupoPesquisaOut])
def listar_grupos(
    nome_grupo:        list[str] = Query(default=[]),
    area_predominante: list[str] = Query(default=[]),
    ultimo_envio:      list[str] = Query(default=[]),
    situacao:          list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_grupos(db.query(_G), nome_grupo, area_predominante, ultimo_envio)
    if situacao:
        q = q.filter(or_(*[_G.status.ilike(f"%{s}%") for s in situacao]))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.GrupoPesquisaOut)
def detalhe_grupo(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    grupo = db.query(_G).filter(_G.id == id).first()
    if not grupo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grupo não encontrado")
    return grupo
