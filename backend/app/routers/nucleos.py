from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/nucleos", tags=["Núcleos de Pesquisa"])

_N = models.NucleoPesquisa


def _filtrar_nucleos(q, centros=None, vinculacoes=None, anos=None, denominacoes=None):
    if centros:      q = q.filter(or_(*[_N.centro_campus.ilike(f"%{v}%") for v in centros]))
    if vinculacoes:  q = q.filter(or_(*[_N.vinculacao.ilike(f"%{v}%") for v in vinculacoes]))
    if anos:         q = q.filter(_N.ano_resolucao.in_(anos))
    if denominacoes: q = q.filter(or_(*[_N.denominacao.ilike(f"%{v}%") for v in denominacoes]))
    return q


@router.get("/kpis")
def nucleos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_N.denominacao))
        .filter(_N.denominacao != None)
        .scalar() or 0
    )
    ativos = (
        db.query(func.count(_N.id))
        .filter(_N.situacao.ilike("ativo"))
        .scalar() or 0
    )
    inativos = (
        db.query(func.count(_N.id))
        .filter(_N.situacao.ilike("inativo"))
        .scalar() or 0
    )
    return {"total_nucleos": total, "total_ativos": ativos, "total_inativos": inativos}


@router.get("/filtros")
def nucleos_filtros(
    centro_campus: list[str] = Query(default=[]),
    vinculacao:    list[str] = Query(default=[]),
    ano_resolucao: list[int] = Query(default=[]),
    denominacao:   list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _q(exc=None):
        return _filtrar_nucleos(
            db.query(_N),
            centros=      centro_campus if exc != 'centro_campus' else None,
            vinculacoes=  vinculacao    if exc != 'vinculacao'    else None,
            anos=         ano_resolucao if exc != 'ano_resolucao' else None,
            denominacoes= denominacao   if exc != 'denominacao'   else None,
        )

    def _str_vals(col, campo):
        return sorted(
            r[0] for r in _q(campo).with_entities(col)
            .filter(col != None).distinct().all()
        )

    def _str_vals_sem_dash(col, campo):
        return sorted(
            r[0] for r in _q(campo).with_entities(col)
            .filter(col != None, col != "--").distinct().all()
        )

    return {
        "centros":     _str_vals_sem_dash(_N.centro_campus,  'centro_campus'),
        "vinculacoes": _str_vals(_N.vinculacao,    'vinculacao'),
        "anos":        sorted(
            r[0] for r in _q('ano_resolucao').with_entities(_N.ano_resolucao)
            .filter(_N.ano_resolucao != None).distinct().all()
        ),
        "nucleos":     _str_vals(_N.denominacao, 'denominacao'),
    }


@router.get("/por-centro")
def nucleos_por_centro(
    centro_campus: list[str] = Query(default=[]),
    vinculacao:    list[str] = Query(default=[]),
    ano_resolucao: list[int] = Query(default=[]),
    denominacao:   list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_N.centro_campus, func.count(_N.id).label("total"))
    q = q.filter(_N.centro_campus != None, _N.centro_campus != "--")
    q = _filtrar_nucleos(q, centro_campus, vinculacao, ano_resolucao, denominacao)
    rows = q.group_by(_N.centro_campus).order_by(func.count(_N.id).desc()).all()
    return [{"centro": r.centro_campus, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.NucleoPesquisaOut])
def listar_nucleos(
    centro_campus: list[str] = Query(default=[]),
    vinculacao:    list[str] = Query(default=[]),
    ano_resolucao: list[int] = Query(default=[]),
    denominacao:   list[str] = Query(default=[]),
    situacao:      list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_nucleos(db.query(_N), centro_campus, vinculacao, ano_resolucao, denominacao)
    if situacao:
        q = q.filter(or_(*[_N.situacao.ilike(f"%{s}%") for s in situacao]))
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.NucleoPesquisaOut)
def detalhe_nucleo(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    nucleo = db.query(_N).filter(_N.id == id).first()
    if not nucleo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Núcleo não encontrado")
    return nucleo
