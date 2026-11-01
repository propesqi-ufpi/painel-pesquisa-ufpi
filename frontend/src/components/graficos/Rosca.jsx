import { useMemo } from 'react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import TooltipGrafico from '../TooltipGrafico'
import LegendaClicavel from './LegendaClicavel'
import { valorDaFatia } from './barraClicavel'
import { opacidade } from '../../utils/filtroCruzado'
import { useCoresGrafico } from '../../utils/coresGrafico'
import { formatarNumero, percentualDe } from '../../utils/numeros'

/*
 * Rosca (donut) com o total no centro e a legenda ao lado.
 *
 * Os números ficam na legenda ("12 · 32%"), na cor do texto, e não em rótulos
 * em volta da rosca: rótulos externos saíam cortados no topo do cartão, se
 * sobrepunham em fatias pequenas e vinham pintados na cor da fatia. Fatias em
 * ordem decrescente, a partir do meio-dia, em sentido horário.
 *
 * Clique na fatia ou no item da legenda liga/desliga o filtro (a legenda é o
 * caminho por teclado).
 */

const SEMPRE = () => true

export default function Rosca({
  dados = [],
  categoria,
  valor = 'total',
  corDe,
  selecionados = [],
  onAlternar,
  podeFiltrar = SEMPRE,
  rotuloTotal = 'total',
  nomeSerie = 'Total',
  tamanho = 220,
}) {
  const cores = useCoresGrafico()

  const ordenados = useMemo(
    () => [...dados].sort((a, b) => (Number(b[valor]) || 0) - (Number(a[valor]) || 0)),
    [dados, valor],
  )
  const total = ordenados.reduce((s, d) => s + (Number(d[valor]) || 0), 0)

  if (!ordenados.length || !total) {
    return <p className="py-8 text-center text-xs text-texto-suave">Sem dados para os filtros escolhidos.</p>
  }

  const legenda = ordenados.map((d) => ({
    value: d[categoria],
    color: podeFiltrar(d[categoria]) ? corDe(d[categoria]) : cores.outros,
    detalhe: `${formatarNumero(d[valor])} · ${percentualDe(d[valor], total)}`,
  }))

  const raio = tamanho / 2 - 4

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2 sm:flex-row">
      <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
        <PieChart width={tamanho} height={tamanho}>
          <Pie
            data={ordenados}
            dataKey={valor}
            nameKey={categoria}
            cx="50%"
            cy="50%"
            innerRadius={Math.round(raio * 0.62)}
            outerRadius={raio}
            startAngle={90}
            endAngle={-270}
            stroke={cores.superficie}
            strokeWidth={2}
            isAnimationActive={false}
            className="cursor-pointer"
            onClick={(d) => {
              const v = valorDaFatia(d, categoria)
              if (podeFiltrar(v)) onAlternar?.(v)
            }}
          >
            {ordenados.map((d) => (
              <Cell
                key={d[categoria]}
                fill={podeFiltrar(d[categoria]) ? corDe(d[categoria]) : cores.outros}
                fillOpacity={opacidade(selecionados, d[categoria])}
              />
            ))}
          </Pie>
          {/* Acima do total no centro, que vem depois no DOM. */}
          <Tooltip wrapperStyle={{ zIndex: 10 }} content={<TooltipGrafico total={total} nomeSerie={nomeSerie} />} />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-tight">
          <span className="text-2xl font-semibold text-texto tabular-nums">{formatarNumero(total)}</span>
          <span className="text-[11px] text-texto-suave">{rotuloTotal}</span>
        </div>
      </div>
      <div className="w-full min-w-0 sm:w-auto sm:max-w-[55%]">
        <LegendaClicavel
          vertical
          payload={legenda}
          selecionados={selecionados}
          onAlternar={onAlternar}
          podeFiltrar={podeFiltrar}
        />
      </div>
    </div>
  )
}
