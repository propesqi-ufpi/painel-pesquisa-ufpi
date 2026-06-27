from collections import defaultdict
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app import models, schemas
from app.dependencies import get_db, verificar_autenticacao

router = APIRouter(prefix="/finep", tags=["FINEP"])

_PDI = models.ProjetoPDI
_FINEP = _PDI.agencia_fomento.ilike("FINEP")


def _filtrar_finep(q, anos_inicio=None, anos_termino=None, centros=None,
                   naturezas=None, situacoes=None):
    q = q.filter(_FINEP)
    if anos_inicio:  q = q.filter(_PDI.ano_inicio.in_(anos_inicio))
    if anos_termino: q = q.filter(_PDI.ano_fim.in_(anos_termino))
    if centros:      q = q.filter(or_(*[_PDI.centro.ilike(f"%{c}%") for c in centros]))
    if naturezas:    q = q.filter(or_(*[_PDI.natureza.ilike(f"%{n}%") for n in naturezas]))
    if situacoes:    q = q.filter(or_(*[_PDI.situacao.ilike(f"%{s}%") for s in situacoes]))
    return q


# ── KPIs ─────────────────────────────────────────────────────────────────────

@router.get("/kpis")
def finep_kpis(
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    valor = db.query(func.sum(models.ProjetoFinep.valor)).scalar() or 0.0
    total = db.query(func.count(models.ProjetoFinep.id)).scalar() or 0
    return {
        "valor_total_mi": round(valor / 1_000_000, 2),
        "total_projetos": total,
    }


@router.get("/filtros")
def finep_filtros(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    def _apply(q, exc=None):
        q = q.filter(_FINEP)
        if exc != 'ano_inicio'  and ano_inicio:  q = q.filter(_PDI.ano_inicio.in_(ano_inicio))
        if exc != 'ano_termino' and ano_termino: q = q.filter(_PDI.ano_fim.in_(ano_termino))
        if exc != 'centro'      and centro:      q = q.filter(or_(*[_PDI.centro.ilike(f"%{c}%") for c in centro]))
        if exc != 'natureza'    and natureza:    q = q.filter(or_(*[_PDI.natureza.ilike(f"%{n}%") for n in natureza]))
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
        "situacoes":    _str_vals(_PDI.situacao,   'situacao'),
    }


@router.get("/relacao-tipo")
def finep_relacao_tipo(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI.modalidade, func.count(_PDI.id).label("total"))
    q = q.filter(_PDI.modalidade != None)
    q = _filtrar_finep(q, ano_inicio, ano_termino, centro, natureza, situacao)
    rows = q.group_by(_PDI.modalidade).all()
    agrupado: dict[str, int] = defaultdict(int)
    for r in rows:
        agrupado[r.modalidade.strip().title()] += r.total
    return [
        {"tipo": tipo, "total": total}
        for tipo, total in sorted(agrupado.items(), key=lambda x: -x[1])
    ]


@router.get("/por-centro")
def finep_por_centro(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = db.query(_PDI.centro, func.sum(_PDI.valor_total).label("valor_total"))
    q = q.filter(_PDI.centro != None, _PDI.centro != "--")
    q = _filtrar_finep(q, ano_inicio, ano_termino, centro, natureza, situacao)
    rows = (
        q.group_by(_PDI.centro)
        .order_by(func.sum(_PDI.valor_total).desc())
        .all()
    )
    return [
        {"centro": r.centro, "valor_mi": round((r.valor_total or 0) / 1_000_000, 2)}
        for r in rows
    ]


@router.get("", response_model=list[schemas.ProjetoPDIOut])
def listar_finep(
    ano_inicio:  list[int] = Query(default=[]),
    ano_termino: list[int] = Query(default=[]),
    centro:      list[str] = Query(default=[]),
    natureza:    list[str] = Query(default=[]),
    situacao:    list[str] = Query(default=[]),
    skip:  int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    q = _filtrar_finep(db.query(_PDI), ano_inicio, ano_termino, centro, natureza, situacao)
    return q.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=schemas.ProjetoPDIOut)
def detalhe_finep(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verificar_autenticacao),
):
    projeto = db.query(_PDI).filter(_PDI.id == id, _FINEP).first()
    if not projeto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return projeto
