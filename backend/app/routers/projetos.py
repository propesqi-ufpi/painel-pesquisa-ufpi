from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/projetos", tags=["Projetos"])

_PDI = models.ProjetoPDI


def _filtrar_pdi(q, anos_inicio=None, anos_termino=None, centros=None,
                 naturezas=None, areas=None, situacoes=None):
    if anos_inicio:  q = q.filter(_PDI.ano_inicio.in_(anos_inicio))
    if anos_termino: q = q.filter(_PDI.ano_fim.in_(anos_termino))
    if centros:      q = q.filter(or_(*[_PDI.centro.ilike(f"%{c}%") for c in centros]))
    if naturezas:    q = q.filter(or_(*[_PDI.natureza.ilike(f"%{n}%") for n in naturezas]))
    if areas:        q = q.filter(or_(*[_PDI.area.ilike(f"%{a}%") for a in areas]))
    if situacoes:    q = q.filter(or_(*[_PDI.situacao.ilike(f"%{s}%") for s in situacoes]))
    return q


# ── PDI ───────────────────────────────────────────────────────────────────────

@router.get("/pdi/kpis")
def pdi_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    concluidos = (
        db.query(func.count(_PDI.id))
        .filter(_PDI.situacao.ilike("Concluído"))
        .scalar() or 0
    )
    em_andamento = (
        db.query(func.count(_PDI.id))
        .filter(_PDI.situacao.ilike("Em andamento"))
        .scalar() or 0
    )
    return {"total_concluidos": concluidos, "total_em_andamento": em_andamento}


@router.get("/pdi/filtros")
def pdi_filtros(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    area:        list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _apply(q, exc=None):
        if exc != 'ano_inicio'  and ano_inicio:  q = q.filter(_PDI.ano_inicio.in_(ano_inicio))
        if exc != 'ano_termino' and ano_termino: q = q.filter(_PDI.ano_fim.in_(ano_termino))
        if exc != 'centro'      and centro:      q = q.filter(or_(*[_PDI.centro.ilike(f"%{c}%") for c in centro]))
        if exc != 'natureza'    and natureza:    q = q.filter(or_(*[_PDI.natureza.ilike(f"%{n}%") for n in natureza]))
        if exc != 'area'        and area:        q = q.filter(or_(*[_PDI.area.ilike(f"%{a}%") for a in area]))
        if exc != 'situacao'    and situacao:    q = q.filter(or_(*[_PDI.situacao.ilike(f"%{s}%") for s in situacao]))
        return q

    def _str_vals(col, campo):
        return sorted(r[0] for r in _apply(db.query(col), campo).filter(col != None, col != "--").distinct().all())

    def _int_vals(col, campo):
        return sorted(r[0] for r in _apply(db.query(col), campo).filter(col != None).distinct().all())

    return {
        "anos_inicio":  _int_vals(_PDI.ano_inicio, 'ano_inicio'),
        "anos_termino": _int_vals(_PDI.ano_fim,    'ano_termino'),
        "centros":      _str_vals(_PDI.centro,     'centro'),
        "naturezas":    _str_vals(_PDI.natureza,   'natureza'),
        "areas":        _str_vals(_PDI.area,       'area'),
        "situacoes":    _str_vals(_PDI.situacao,   'situacao'),
    }


@router.get("/pdi/por-area")
def pdi_por_area(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    area:        list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI.area, func.count(_PDI.id).label("total"))
    q = q.filter(_PDI.area != None, _PDI.area != "--")
    q = _filtrar_pdi(q, ano_inicio, ano_termino, centro, natureza, area, situacao)
    rows = q.group_by(_PDI.area).order_by(func.count(_PDI.id).desc()).all()
    return [{"area": r.area, "total": r.total} for r in rows]


@router.get("/pdi/por-centro")
def pdi_por_centro(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    area:        list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI.centro, func.count(_PDI.id).label("total"))
    q = q.filter(_PDI.centro != None, _PDI.centro != "--")
    q = _filtrar_pdi(q, ano_inicio, ano_termino, centro, natureza, area, situacao)
    rows = q.group_by(_PDI.centro).order_by(func.count(_PDI.id).desc()).all()
    return [{"centro": r.centro, "total": r.total} for r in rows]


@router.get("/pdi", response_model=list[schemas.ProjetoPDIOut])
def listar_pdi(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    area:        list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_pdi(db.query(_PDI), ano_inicio, ano_termino, centro, natureza, area, situacao)
    return q.offset(skip).limit(limit).all()


@router.get("/pdi/{projeto_id}", response_model=schemas.ProjetoPDIOut)
def detalhe_pdi(
    projeto_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    projeto = db.query(_PDI).filter(_PDI.id == projeto_id).first()
    if not projeto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return projeto
