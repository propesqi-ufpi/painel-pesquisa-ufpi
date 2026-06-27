from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/bolsistas", tags=["Bolsistas"])

_B = models.Bolsista


def _filtrar_bolsistas(q, modalidades=None, orgaos=None, campi=None, nomes=None):
    if modalidades: q = q.filter(or_(*[_B.modalidade.ilike(f"%{v}%") for v in modalidades]))
    if orgaos:      q = q.filter(or_(*[_B.orgao.ilike(f"%{v}%") for v in orgaos]))
    if campi:       q = q.filter(or_(*[_B.campus_centro.ilike(f"%{v}%") for v in campi]))
    if nomes:       q = q.filter(or_(*[_B.nome.ilike(f"%{v}%") for v in nomes]))
    return q


@router.get("/kpis")
def bolsistas_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    cnpq = (
        db.query(func.count(_B.id))
        .filter(_B.orgao.ilike("%CNPq%") | _B.orgao.ilike("%CNPQ%"))
        .scalar() or 0
    )
    ufpi = (
        db.query(func.count(_B.id))
        .filter(_B.orgao.ilike("%UFPI%"))
        .scalar() or 0
    )
    total = db.query(func.count(_B.id)).scalar() or 0
    return {"total_cnpq": cnpq, "total_ufpi": ufpi, "total": total}


@router.get("/filtros")
def bolsistas_filtros(
    modalidade:    list[str] = Query(default=[]),
    orgao:         list[str] = Query(default=[]),
    campus_centro: list[str] = Query(default=[]),
    nome:          list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _apply(q, exc=None):
        if exc != 'modalidade'    and modalidade:    q = q.filter(or_(*[_B.modalidade.ilike(f"%{v}%") for v in modalidade]))
        if exc != 'orgao'         and orgao:         q = q.filter(or_(*[_B.orgao.ilike(f"%{v}%") for v in orgao]))
        if exc != 'campus_centro' and campus_centro: q = q.filter(or_(*[_B.campus_centro.ilike(f"%{v}%") for v in campus_centro]))
        if exc != 'nome'          and nome:          q = q.filter(or_(*[_B.nome.ilike(f"%{v}%") for v in nome]))
        return q

    def _vals(col, campo):
        return sorted(r[0] for r in _apply(db.query(col), campo).filter(col != None).distinct().all())

    return {
        "modalidades": _vals(_B.modalidade,    'modalidade'),
        "orgaos":      _vals(_B.orgao,         'orgao'),
        "campi":       _vals(_B.campus_centro, 'campus_centro'),
        "nomes":       _vals(_B.nome,          'nome'),
    }


@router.get("/por-campus")
def bolsistas_por_campus(
    modalidade:    list[str] = Query(default=[]),
    orgao:         list[str] = Query(default=[]),
    campus_centro: list[str] = Query(default=[]),
    nome:          list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_B.campus_centro, func.count(_B.nome).label("total"))
    q = q.filter(_B.campus_centro != None)
    q = _filtrar_bolsistas(q, modalidade, orgao, campus_centro, nome)
    rows = q.group_by(_B.campus_centro).order_by(func.count(_B.nome).desc()).all()
    return [{"campus": r.campus_centro, "total": r.total} for r in rows]


@router.get("", response_model=list[schemas.BolsistaOut])
def listar_bolsistas(
    modalidade:    list[str] = Query(default=[]),
    orgao:         list[str] = Query(default=[]),
    campus_centro: list[str] = Query(default=[]),
    nome:          list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_bolsistas(db.query(_B), modalidade, orgao, campus_centro, nome)
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.BolsistaOut)
def detalhe_bolsista(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    bolsista = db.query(_B).filter(_B.id == id).first()
    if not bolsista:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bolsista não encontrado")
    return bolsista
