from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/pos-graduacao", tags=["Pós-Graduação"])

_P = models.PosGraduacao


def _filtrar_pos(q, programas=None, conceitos=None, centros=None, niveis=None, tipos=None):
    if programas:  q = q.filter(or_(*[_P.programa.ilike(f"%{v}%") for v in programas]))
    if conceitos:  q = q.filter(_P.conceito_capes.in_(conceitos))
    if centros:    q = q.filter(or_(*[_P.centro.ilike(f"%{v}%") for v in centros]))
    if niveis:     q = q.filter(or_(*[_P.nivel.ilike(f"%{v}%") for v in niveis]))
    if tipos:      q = q.filter(or_(*[_P.tipo.ilike(f"%{v}%") for v in tipos]))
    return q


@router.get("/kpis")
def pos_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_P.programa))
        .filter(_P.programa != None)
        .scalar() or 0
    )
    return {"total_pos_graduacao": total}


@router.get("/filtros")
def pos_filtros(
    programa:       list[str] = Query(default=[]),
    conceito_capes: list[int] = Query(default=[]),
    centro:         list[str] = Query(default=[]),
    nivel:          list[str] = Query(default=[]),
    tipo:           list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _apply(q, exc=None):
        if exc != 'programa'       and programa:       q = q.filter(or_(*[_P.programa.ilike(f"%{v}%") for v in programa]))
        if exc != 'conceito_capes' and conceito_capes: q = q.filter(_P.conceito_capes.in_(conceito_capes))
        if exc != 'centro'         and centro:         q = q.filter(or_(*[_P.centro.ilike(f"%{v}%") for v in centro]))
        if exc != 'nivel'          and nivel:          q = q.filter(or_(*[_P.nivel.ilike(f"%{v}%") for v in nivel]))
        if exc != 'tipo'           and tipo:           q = q.filter(or_(*[_P.tipo.ilike(f"%{v}%") for v in tipo]))
        return q

    def _str_vals(col, campo):
        return sorted(r[0] for r in _apply(db.query(col), campo).filter(col != None).distinct().all())

    return {
        "programas":       _str_vals(_P.programa, 'programa'),
        "conceitos_capes": sorted(r[0] for r in _apply(db.query(_P.conceito_capes), 'conceito_capes').filter(_P.conceito_capes != None).distinct().all()),
        "centros": _str_vals(_P.centro, 'centro'),
        "niveis":  _str_vals(_P.nivel,  'nivel'),
        "tipos":   _str_vals(_P.tipo,   'tipo'),
    }


@router.get("/por-centro")
def pos_por_centro(
    programa:       list[str] = Query(default=[]),
    conceito_capes: list[int] = Query(default=[]),
    centro:         list[str] = Query(default=[]),
    nivel:          list[str] = Query(default=[]),
    tipo:           list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_P.centro, func.count(_P.id).label("total"))
    q = q.filter(_P.centro != None)
    q = _filtrar_pos(q, programa, conceito_capes, centro, nivel, tipo)
    rows = q.group_by(_P.centro).order_by(func.count(_P.id).desc()).all()
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.PosGraduacaoOut])
def listar_pos(
    programa:       list[str] = Query(default=[]),
    conceito_capes: list[int] = Query(default=[]),
    centro:         list[str] = Query(default=[]),
    nivel:          list[str] = Query(default=[]),
    tipo:           list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_pos(db.query(_P), programa, conceito_capes, centro, nivel, tipo)
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.PosGraduacaoOut)
def detalhe_pos(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    programa = db.query(_P).filter(_P.id == id).first()
    if not programa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programa não encontrado")
    return programa
