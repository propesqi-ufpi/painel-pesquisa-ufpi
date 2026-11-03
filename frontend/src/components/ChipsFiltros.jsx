import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { montarChips } from '../utils/chipsFiltros'

/*
 * Filtros ativos acima dos gráficos e da tabela, venham do seletor ou de um
 * clique no gráfico. Cada chip remove o próprio valor; "Limpar filtros" remove
 * tudo. Sem filtro ativo, não ocupa espaço.
 *
 * Ao remover um chip, o foco vai para o chip seguinte (ou para "Limpar
 * filtros"), para quem navega pelo teclado não perder o lugar.
 */
export default function ChipsFiltros({ campos, onLimpar }) {
  const chips = montarChips(campos)
  const lista = useRef(null)
  const focarIndice = useRef(null)

  useEffect(() => {
    if (focarIndice.current === null || !lista.current) return
    const botoes = lista.current.querySelectorAll('button')
    const alvo = botoes[Math.min(focarIndice.current, botoes.length - 1)]
    alvo?.focus()
    focarIndice.current = null
  })

  const quantos = chips.length === 1 ? '1 filtro ativo' : `${chips.length} filtros ativos`

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {chips.length ? quantos : 'Nenhum filtro ativo'}
      </p>
      {chips.length > 0 && (
        <div
          ref={lista}
          role="group"
          aria-label="Filtros ativos"
          className="flex flex-wrap items-center gap-1.5 lg:flex-shrink-0"
        >
          <span className="text-xs text-texto-suave mr-0.5">Filtrando por</span>
          {chips.map((chip, i) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => { focarIndice.current = i; chip.remover() }}
              aria-label={`Remover filtro ${chip.rotulo}: ${chip.texto}`}
              title="Remover este filtro"
              className="group inline-flex max-w-full items-center gap-1 rounded-full border border-azul/30 bg-azul-suave py-0.5 pl-2.5 pr-1.5 text-xs text-texto transition-colors hover:border-azul focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro"
            >
              <span className="text-texto-suave whitespace-nowrap">{chip.rotulo}:</span>
              <span className="font-medium truncate">{chip.texto}</span>
              <X className="h-3.5 w-3.5 shrink-0 text-texto-suave group-hover:text-texto" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={onLimpar}
            className="ml-1 rounded text-xs font-medium text-azul underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </>
  )
}
