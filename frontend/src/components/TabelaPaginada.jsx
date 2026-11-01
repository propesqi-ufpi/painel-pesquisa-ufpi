import { useMemo, useState } from 'react'
import SkeletonTabela from './SkeletonTabela'
import { valorExibicao, VAZIO } from '../utils/exibicao'
import { ordenarLinhas, proximaOrdem } from '../utils/ordenacao'

const ARIA_SORT = { asc: 'ascending', desc: 'descending' }
const PROXIMA_ACAO = { asc: 'decrescente', desc: 'sem ordenação' }

function IconeOrdem({ dir }) {
  // Seta para cima (crescente), para baixo (decrescente) ou as duas (coluna sem ordem ativa).
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir !== 'desc' && <path d={dir === 'asc' ? 'M12 19V5M5 12l7-7 7 7' : 'M8 9l4-4 4 4'} />}
      {dir !== 'asc' && <path d={dir === 'desc' ? 'M12 5v14M19 12l-7 7-7-7' : 'M16 15l-4 4-4-4'} />}
    </svg>
  )
}

function Cabecalho({ coluna, ordem, onOrdenar }) {
  const ativa = ordem?.key === coluna.key ? ordem.dir : null
  if (coluna.ordenavel === false) {
    return <th scope="col" className="text-xs font-semibold py-2 px-3 whitespace-nowrap">{coluna.label}</th>
  }

  return (
    <th scope="col" aria-sort={ARIA_SORT[ativa] ?? 'none'} className="text-xs whitespace-nowrap p-0">
      <button
        type="button"
        onClick={() => onOrdenar(coluna.key)}
        title={`Ordenar: ${ativa ? PROXIMA_ACAO[ativa] : 'crescente'}`}
        className="group w-full flex items-center gap-1 py-2 px-3 text-left font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
      >
        <span>{coluna.label}</span>
        <span className={`transition-opacity ${ativa ? 'opacity-100' : 'opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70'}`}>
          <IconeOrdem dir={ativa} />
        </span>
      </button>
    </th>
  )
}

function Celula({ coluna, linha }) {
  const valor = valorExibicao(coluna, linha)
  const bruto = linha[coluna.key]
  // Quando a limpeza muda o texto, o valor original da planilha fica no tooltip.
  const original = bruto != null && String(bruto).trim() !== String(valor ?? '') ? String(bruto) : undefined

  return (
    <td title={original} className="text-xs py-1.5 px-3 dark:text-gray-200">
      {coluna.render
        ? coluna.render(valor, linha)
        : valor ?? <span className="text-gray-400 dark:text-gray-500" aria-label="Não informado">{VAZIO}</span>}
    </td>
  )
}

export default function TabelaPaginada({
  colunas = [],
  dados = [],
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  pagina,
  totalPaginas,
  onAnterior,
  onProxima,
}) {
  const [ordem, setOrdem] = useState(null)
  const linhas = useMemo(() => ordenarLinhas(dados, colunas, ordem), [dados, colunas, ordem])

  if (loading) return <SkeletonTabela />

  const comPaginacao = totalPaginas != null && totalPaginas > 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-azul-escuro text-white">
              {colunas.map((col) => (
                <Cabecalho
                  key={col.key}
                  coluna={col}
                  ordem={ordem}
                  onOrdenar={(key) => setOrdem((atual) => proximaOrdem(atual, key))}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td colSpan={colunas.length} className="text-center py-6 text-gray-500 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              linhas.map((linha, i) => (
                <tr
                  key={linha.id ?? i}
                  className={`${
                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                  } hover:bg-azul-claro dark:hover:bg-gray-700 transition-colors`}
                >
                  {colunas.map((col) => (
                    <Celula key={col.key} coluna={col} linha={linha} />
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {comPaginacao && (
        <div className="flex-shrink-0 flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onAnterior}
            disabled={pagina <= 1}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={onProxima}
            disabled={pagina >= totalPaginas}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
