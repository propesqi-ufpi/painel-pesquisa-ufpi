import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import SkeletonTabela from './SkeletonTabela'
import { valorExibicao, VAZIO } from '../utils/exibicao'
import { ordenarLinhas, proximaOrdem } from '../utils/ordenacao'

const ARIA_SORT = { asc: 'ascending', desc: 'descending' }
const PROXIMA_ACAO = { asc: 'decrescente', desc: 'sem ordenação' }

function IconeOrdem({ dir }) {
  const Icone = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown
  return <Icone className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
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
    <td title={original} className="text-xs py-1.5 px-3">
      {coluna.render
        ? coluna.render(valor, linha)
        : valor ?? <span className="text-texto-suave" aria-label="Não informado">{VAZIO}</span>}
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
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left border-collapse font-condensed tabular-nums">
          <thead className="sticky top-0 z-10">
            <tr className="bg-faixa text-white">
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
                <td colSpan={colunas.length} className="text-center py-6 text-texto-suave text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              linhas.map((linha, i) => (
                <tr
                  key={linha.id ?? i}
                  className={`${
                    i % 2 === 0 ? 'bg-superficie' : 'bg-superficie-2'
                  } hover:bg-azul-suave transition-colors`}
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
        <div className="flex-shrink-0 flex items-center justify-between pt-2 border-t border-borda">
          <button
            onClick={onAnterior}
            disabled={pagina <= 1}
            className="px-3 py-1 text-xs border border-borda rounded hover:bg-azul-suave disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-texto-suave">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={onProxima}
            disabled={pagina >= totalPaginas}
            className="px-3 py-1 text-xs border border-borda rounded hover:bg-azul-suave disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
