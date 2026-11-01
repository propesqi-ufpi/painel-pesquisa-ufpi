"""Filtros reutilizados pelos routers."""
from sqlalchemy import func


def em_lista(coluna, valores):
    """Filtro de seleção múltipla por igualdade exata.

    Ignora maiúsculas/minúsculas e espaços nas pontas, mas não casa trechos:
    selecionar "CT" não traz "CTT" e "ativo" não traz "inativo".
    Os valores vêm das opções de /filtros, que são os próprios valores da coluna.
    """
    normalizados = [v.strip().lower() for v in valores if v is not None]
    return func.lower(func.trim(coluna)).in_(normalizados)
