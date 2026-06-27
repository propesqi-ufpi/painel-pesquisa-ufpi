from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, distinct, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/incubadas", tags=["Empresas Incubadas"])

_E = models.EmpresaIncubada


def _filtrar_incubadas(q, incubadoras=None, situacoes=None):
    if incubadoras: q = q.filter(or_(*[_E.incubadora.ilike(f"%{v}%") for v in incubadoras]))
    if situacoes:   q = q.filter(or_(*[_E.tipo_empresa.ilike(f"%{v}%") for v in situacoes]))
    return q


@router.get("/kpis")
def incubadas_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total_incubadas = (
        db.query(func.count(_E.nome_projeto))
        .filter(_E.nome_projeto != None)
        .scalar() or 0
    )
    graduadas = (
        db.query(func.count(_E.id))
        .filter(_E.tipo_empresa.ilike("%graduada%"))
        .scalar() or 0
    )
    total_incubadoras = (
        db.query(func.count(distinct(_E.incubadora)))
        .filter(_E.incubadora != None)
        .scalar() or 0
    )
    return {
        "total_incubadas":   total_incubadas,
        "total_graduadas":   graduadas,
        "total_incubadoras": total_incubadoras,
    }


@router.get("/filtros")
def incubadas_filtros(
    incubadora: list[str] = Query(default=[]),
    situacao:   list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _q(exc=None):
        return _filtrar_incubadas(
            db.query(_E),
            incubadoras= incubadora if exc != 'incubadora' else None,
            situacoes=   situacao   if exc != 'situacao'   else None,
        )

    def _vals(col, campo):
        return sorted(
            r[0] for r in _q(campo).with_entities(col)
            .filter(col != None).distinct().all()
        )

    return {
        "incubadoras": _vals(_E.incubadora,   'incubadora'),
        "situacoes":   _vals(_E.tipo_empresa, 'situacao'),
    }


@router.get("/por-incubadora")
def incubadas_por_incubadora(
    incubadora: list[str] = Query(default=[]),
    situacao:   list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_E.incubadora, func.count(_E.id).label("total"))
    q = q.filter(_E.incubadora != None)
    q = _filtrar_incubadas(q, incubadora, situacao)
    rows = q.group_by(_E.incubadora).order_by(func.count(_E.id).desc()).all()
    return [{"incubadora": r.incubadora, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.EmpresaIncubadaOut])
def listar_incubadas(
    incubadora: list[str] = Query(default=[]),
    situacao:   list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_incubadas(db.query(_E), incubadora, situacao)
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.EmpresaIncubadaOut)
def detalhe_incubada(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    empresa = db.query(_E).filter(_E.id == id).first()
    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada")
    return empresa
