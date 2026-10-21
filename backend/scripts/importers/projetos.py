import pandas as pd
from sqlalchemy.orm import Session
from app import models
from scripts.importers.utils import normalizar_colunas, safe_int, safe_float, safe_str, log_resultado


def importar_projetos_finep(caminho_xlsx: str, db: Session):
    """Importa os dados da tabela de Projetos UFPI FINEP."""
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name="Projetos UFPI FINEP 2025")
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Projetos FINEP: {e}")
        return

    # Linhas sem título (ex.: linha de total no fim da planilha) não são projetos
    df = df.dropna(subset=["projeto"])

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        try:
            obj = models.ProjetoFinep(
                id=int(row["n"]),
                titulo=str(row["projeto"]),
                edital=safe_str(row.get("editalchamada")),
                linha_area=safe_str(row.get("linhaárea")),
                valor=safe_float(row.get("valor")),
                status=safe_str(row.get("situação")),
                coordenador=safe_str(row.get("coordenador")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("PROJETOS FINEP", inseridos, erros)


def importar_projetos_pdi(caminho_xlsx: str, db: Session):
    """Importa projetos PD&I da primeira aba de PROJETOS_PDI.xlsx.
    São 5.550 registros. Linhas sem título (coluna 'PROJETOS') são ignoradas.
    """
    try:
        df = pd.read_excel(caminho_xlsx, sheet_name=0)
        df = normalizar_colunas(df)
    except Exception as e:
        print(f"[Erro] Falha ao ler Projetos PDI: {e}")
        return

    inseridos, erros = 0, []
    for idx, row in df.iterrows():
        if pd.isna(row.get("projetos")):
            continue
        try:
            obj = models.ProjetoPDI(
                registro=safe_str(row.get("registro")),
                titulo=str(row["projetos"]),
                coordenador=safe_str(row.get("coordenadores")),
                natureza=safe_str(row.get("natureza")),
                area=safe_str(row.get("área_do_conhecimento")),
                centro=safe_str(row.get("centro")),
                modalidade=safe_str(row.get("modalidade")),
                agencia_fomento=safe_str(row.get("agência_de_fomento")),
                valor_total=safe_float(row.get("valor_total")),
                ano_inicio=safe_int(row.get("anoi")),
                ano_fim=safe_int(row.get("anof")),
                situacao=safe_str(row.get("situação")),
            )
            db.add(obj)
            inseridos += 1
        except Exception as e:
            erros.append({"linha": idx + 2, "erro": str(e)})

    db.commit()
    log_resultado("PROJETOS PDI", inseridos, erros)
