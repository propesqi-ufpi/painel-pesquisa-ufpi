from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/laboratorios", tags=["Laboratórios"])

_L = models.Laboratorio


def _filtrar_laboratorios(q, nomes=None, centros=None):
    if nomes:   q = q.filter(or_(*[_L.nome.ilike(f"%{v}%") for v in nomes]))
    if centros: q = q.filter(or_(*[_L.centro_campi.ilike(f"%{v}%") for v in centros]))
    return q


@router.get("/kpis")
def laboratorios_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    total = (
        db.query(func.count(_L.nome))
        .filter(_L.nome != None)
        .scalar() or 0
    )
    return {"total_laboratorios": total}


@router.get("/filtros")
def laboratorios_filtros(
    nome:        list[str] = Query(default=[]),
    centro_campi: list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _q(exc=None):
        return _filtrar_laboratorios(
            db.query(_L),
            nomes=   nome        if exc != 'nome'        else None,
            centros= centro_campi if exc != 'centro_campi' else None,
        )

    def _vals(col, campo):
        return sorted(
            r[0] for r in _q(campo).with_entities(col)
            .filter(col != None).distinct().all()
        )

    return {
        "nomes":   _vals(_L.nome,        'nome'),
        "centros": _vals(_L.centro_campi, 'centro_campi'),
    }


@router.get("/por-centro")
def laboratorios_por_centro(
    nome:        list[str] = Query(default=[]),
    centro_campi: list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    label = func.coalesce(func.nullif(_L.centro_campi, ""), "Em branco")
    q = db.query(label.label("centro"), func.count(_L.id).label("total"))
    q = _filtrar_laboratorios(q, nome, centro_campi)
    rows = q.group_by(label).order_by(func.count(_L.id).desc()).all()
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.LaboratorioOut])
def listar_laboratorios(
    nome:        list[str] = Query(default=[]),
    centro_campi: list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_laboratorios(db.query(_L), nome, centro_campi)
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.LaboratorioOut)
def detalhe_laboratorio(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    lab = db.query(_L).filter(_L.id == id).first()
    if not lab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laboratório não encontrado")
    return lab
