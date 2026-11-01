import SkeletonTabela from './SkeletonTabela'
import { valorExibicao, VAZIO } from '../utils/exibicao'

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
  if (loading) return <SkeletonTabela />

  const comPaginacao = totalPaginas != null && totalPaginas > 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-azul-escuro text-white">
              {colunas.map((col) => (
                <th key={col.key} className="text-xs font-semibold py-2 px-3 whitespace-nowrap">
                  {col.label}
                </th>
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
              dados.map((linha, i) => (
                <tr
                  key={i}
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
