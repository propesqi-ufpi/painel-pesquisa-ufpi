import { useMemo } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import TooltipGrafico from '../TooltipGrafico'
import { barraClicavel } from './barraClicavel'
import { useCoresGrafico } from '../../utils/coresGrafico'
import {
  LARGURA_CARACTERE, larguraDoRotulo, ordenarParaRanking, quebrarEmDuasLinhas,
} from '../../utils/barrasHorizontais'

/*
 * Ranking por categoria (área, centro, campus) em barras horizontais.
 *
 * O nome da categoria fica inteiro à esquerda, em até duas linhas, em vez de
 * girado e cortado sob a barra. O valor vai escrito na ponta de cada barra, por
 * isso não há eixo numérico nem grade. Barras em ordem decrescente; categorias
 * que não filtram (ex.: "Em branco") vão para o fim, em cinza.
 *
 * Com muitas categorias, a lista rola dentro de `alturaMax` (ou da altura que o
 * pai der, via `className`). O PNG exportado sai com a lista inteira.
 */

const LINHA = 30 // px por categoria
const SEMPRE = () => true
const FORMATO_PADRAO = (v) => Number(v ?? 0).toLocaleString('pt-BR')

function RotuloCategoria({ x, y, payload, cor, largura }) {
  const texto = String(payload?.value ?? '')
  const porLinha = Math.max(4, Math.floor((largura - 8) / LARGURA_CARACTERE))
  const linhas = quebrarEmDuasLinhas(texto, porLinha)
  const cortado = linhas.join(' ') !== texto
  return (
    <text x={x - 6} y={y} textAnchor="end" fill={cor} fontSize={11} className="font-condensed">
      {cortado && <title>{texto}</title>}
      {linhas.map((linha, i) => (
        <tspan key={i} x={x - 6} dy={i === 0 ? (linhas.length === 1 ? 4 : -2) : 12}>
          {linha}
        </tspan>
      ))}
    </text>
  )
}

// Texto simples: o <Label> do Recharts quebra linha quando falta espaço à direita.
function ValorNaPonta({ x, y, width, height, value, cor, formatarValor }) {
  return (
    <text x={x + width + 6} y={y + height / 2} dominantBaseline="central" fill={cor} fontSize={11} className="tabular-nums">
      {formatarValor(value)}
    </text>
  )
}

export default function BarrasHorizontais({
  dados = [],
  categoria,
  valor = 'total',
  selecionados = [],
  onAlternar,
  podeFiltrar = SEMPRE,
  formatarValor = FORMATO_PADRAO,
  nomeSerie = 'Total',
  total,
  alturaMax,
  className = '',
}) {
  const cores = useCoresGrafico()

  const ordenados = useMemo(
    () => ordenarParaRanking(dados, { categoria, valor, podeFiltrar }),
    [dados, categoria, valor, podeFiltrar],
  )

  const larguraRotulo = larguraDoRotulo(ordenados.map((d) => d[categoria]))
  const maiorValor = ordenados.reduce((m, d) => Math.max(m, formatarValor(d[valor]).length), 0)
  const folgaValor = Math.ceil(maiorValor * 6.4) + 10
  const altura = ordenados.length * LINHA + 8

  if (!ordenados.length) {
    return <p className="py-8 text-center text-xs text-texto-suave">Sem dados para os filtros escolhidos.</p>
  }

  return (
    <div
      data-rolagem-grafico=""
      className={`overflow-y-auto overscroll-contain ${className}`}
      style={alturaMax ? { maxHeight: alturaMax } : undefined}
    >
      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ordenados}
            layout="vertical"
            margin={{ top: 4, right: folgaValor, bottom: 4, left: 0 }}
            barCategoryGap={7}
          >
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey={categoria}
              width={larguraRotulo}
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={<RotuloCategoria cor={cores.eixo} largura={larguraRotulo} />}
            />
            <Tooltip
              cursor={{ fill: cores.grade, fillOpacity: 0.6 }}
              content={<TooltipGrafico formatarValor={formatarValor} total={total} />}
            />
            <Bar
              dataKey={valor}
              name={nomeSerie}
              fill={cores.serie1}
              radius={[0, 4, 4, 0]}
              shape={barraClicavel({ categoria, selecionados, onAlternar, podeFiltrar, formatarValor })}
            >
              {ordenados.map((d, i) => (
                <Cell key={i} fill={podeFiltrar(d[categoria]) ? cores.serie1 : cores.outros} />
              ))}
              <LabelList
                dataKey={valor}
                content={<ValorNaPonta cor={cores.texto} formatarValor={formatarValor} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
