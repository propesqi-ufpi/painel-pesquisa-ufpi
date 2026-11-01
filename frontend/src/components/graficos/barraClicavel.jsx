import { Rectangle } from 'recharts'
import { estaSelecionado, opacidade } from '../../utils/filtroCruzado'

export function aoTeclarAtivar(evento, acao) {
  if (evento.key === 'Enter' || evento.key === ' ') {
    evento.preventDefault()
    acao()
  }
}

/**
 * `shape` para <Bar> que vira um botão: clique ou Enter/Espaço alternam o valor
 * da categoria no filtro. Barras fora da seleção ficam esmaecidas.
 *
 *   <Bar dataKey="total" shape={barraClicavel({ categoria: 'area', selecionados, onAlternar })} />
 *
 * `podeFiltrar(valor)` desliga o clique em categorias que não são valores reais
 * (ex.: "Em branco"). O Recharts chama o shape como função, então não há remontagem.
 */
export function barraClicavel({ categoria, selecionados = [], onAlternar, podeFiltrar = () => true }) {
  return function desenharBarra(props) {
    const valor = props.payload?.[categoria]
    const forma = <Rectangle {...props} fillOpacity={opacidade(selecionados, valor)} />
    if (!podeFiltrar(valor)) return forma

    const ativo = estaSelecionado(selecionados, valor)
    const alternar = () => onAlternar(valor)
    return (
      <g
        key={props.index}
        role="button"
        tabIndex={0}
        aria-pressed={ativo}
        aria-label={`${valor}: ${props.value}. ${ativo ? 'Remover do filtro' : 'Filtrar por este valor'}`}
        onClick={alternar}
        onKeyDown={(e) => aoTeclarAtivar(e, alternar)}
        className="cursor-pointer outline-none [&:focus-visible>path]:stroke-amber-400 [&:focus-visible>path]:[stroke-width:2]"
      >
        {forma}
      </g>
    )
  }
}

/** Valor da categoria de uma fatia clicada (o formato do evento muda entre versões do Recharts). */
export function valorDaFatia(dado, nameKey) {
  return dado?.payload?.[nameKey] ?? dado?.[nameKey] ?? dado?.name
}
