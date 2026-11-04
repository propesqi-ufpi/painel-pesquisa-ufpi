import { formatarNumero, percentualDe } from '../utils/numeros'

/*
 * Dica (tooltip) de todos os gráficos.
 *
 * O texto fica nas cores de texto do tema; a cor da série aparece só na
 * bolinha ao lado do nome, que é quem carrega a identidade. Números em pt-BR.
 *
 * Em pizza/rosca o Recharts não manda `label`: o título vira o nome da fatia e
 * a linha usa `nomeSerie` (ex.: "Projetos").
 */
export default function TooltipGrafico({ active, payload, label, formatarValor, total, nomeSerie }) {
  if (!active || !payload?.length) return null

  const semRotulo = label == null || label === ''
  const titulo = semRotulo && payload.length === 1 ? payload[0].name : label
  const formatar = formatarValor ?? formatarNumero

  return (
    <div className="bg-superficie border border-borda rounded-lg shadow-lg px-3 py-2 text-sm text-texto">
      {titulo != null && titulo !== '' && <p className="font-semibold mb-1">{titulo}</p>}
      <ul className="flex flex-col gap-0.5">
        {payload.map((item, i) => {
          const cor = item.color ?? item.payload?.fill
          const nome = semRotulo && payload.length === 1 ? (nomeSerie ?? 'Total') : item.name
          const pct = total != null ? percentualDe(item.value, total) : ''
          return (
            <li key={i} className="flex items-center gap-2">
              {cor && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cor }} aria-hidden="true" />}
              <span className="text-texto-suave">{nome}:</span>
              <span className="font-semibold tabular-nums">{formatar(item.value)}</span>
              {pct && <span className="text-texto-suave tabular-nums">({pct})</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
