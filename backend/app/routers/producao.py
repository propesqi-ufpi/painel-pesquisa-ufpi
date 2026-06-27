from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/producao", tags=["Produção Intelectual"])

_ANU = models.ProducaoAnual
_VIT = models.VitrineProducao

_TIPOS = ["PATENTE", "SOFTWARE", "MARCA", "DESENHO INDUSTRIAL"]


# ── Métricas anuais ───────────────────────────────────────────────────────────

@router.get("/kpis")
def producao_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _soma(tipo: str) -> int:
        return db.query(func.sum(_ANU.depositadas)).filter(_ANU.tipo == tipo).scalar() or 0

    return {tipo: _soma(tipo) for tipo in _TIPOS}


@router.get("/anual/tipos")
def anual_tipos(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    return sorted(
        r[0] for r in db.query(_ANU.tipo).filter(_ANU.tipo != None).distinct().all()
    )


@router.get("/anual/anos")
def anual_anos(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    return sorted(
        r[0] for r in db.query(_ANU.ano).filter(_ANU.ano != None).distinct().all()
    )


@router.get("/anual", response_model=list[schemas.ProducaoAnualOut])
def listar_anual(
    tipo: list[str] = Query(default=[]),
    ano:  list[int] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_ANU)
    if tipo: q = q.filter(or_(*[_ANU.tipo == t.upper() for t in tipo]))
    if ano:  q = q.filter(_ANU.ano.in_(ano))
    return q.order_by(_ANU.ano.asc()).all()


# ── Vitrine do MEC ────────────────────────────────────────────────────────────

# /vitrine/inventores antes de /vitrine/{id} para não ser capturado pelo path param
@router.get("/vitrine/inventores")
def vitrine_inventores(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    rows = (
        db.query(_VIT.inventores)
        .filter(_VIT.inventores != None, _VIT.inventores != "")
        .distinct()
        .all()
    )
    return sorted(r[0] for r in rows)


@router.get("/vitrine", response_model=list[schemas.VitrineProducaoOut])
def listar_vitrine(
    tipo:     list[str] = Query(default=[]),
    ano:      list[int] = Query(default=[]),
    inventor: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_VIT)
    if tipo:     q = q.filter(or_(*[_VIT.tipo == t.upper() for t in tipo]))
    if ano:      q = q.filter(_VIT.ano.in_(ano))
    if inventor: q = q.filter(_VIT.inventores.ilike(f"%{inventor}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/vitrine/{id}", response_model=schemas.VitrineProducaoOut)
def detalhe_vitrine(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    item = db.query(_VIT).filter(_VIT.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado")
    return item
