import { estaSelecionado, opacidade } from '../../utils/filtroCruzado'

/**
 * Conteúdo de <Legend> para gráficos de pizza: cada item é um botão que alterna
 * o valor no filtro. É o caminho por teclado; as fatias também aceitam clique.
 * Um item pode trazer `detalhe` (ex.: "12 · 32%"), escrito na cor do texto.
 *
 *   <Legend content={<LegendaClicavel selecionados={...} onAlternar={...} />} />
 */
export default function LegendaClicavel({
  payload = [],
  selecionados = [],
  onAlternar,
  podeFiltrar = () => true,
  vertical = false,
}) {
  return (
    <ul className={`flex gap-x-3 gap-y-1 ${vertical ? 'flex-col' : 'flex-wrap justify-center'}`}>
      {payload.map((item) => {
        const valor = item.value
        const ativo = estaSelecionado(selecionados, valor)
        const conteudo = (
          <>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} aria-hidden="true" />
            <span className="text-xs text-texto-suave">{valor}</span>
            {item.detalhe && (
              <span className="ml-auto pl-2 text-xs text-texto tabular-nums whitespace-nowrap">{item.detalhe}</span>
            )}
          </>
        )
        return (
          <li key={valor} style={{ opacity: opacidade(selecionados, valor) }}>
            {podeFiltrar(valor) ? (
              <button
                type="button"
                aria-pressed={ativo}
                onClick={() => onAlternar(valor)}
                className={`flex w-full items-center gap-1.5 rounded px-1 text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-azul ${ativo ? 'font-semibold' : ''}`}
              >
                {conteudo}
              </button>
            ) : (
              <span className="flex w-full items-center gap-1.5 px-1">{conteudo}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
