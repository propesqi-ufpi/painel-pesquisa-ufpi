import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  ResponsiveContainer,
} from 'recharts'
import {
  getKPIsFinep, getFiltrosFinep,
  getRelacaoTipoFinep, getPorCentroFinep,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconFomento, iconProjetos } from '../assets/icons.js'

const CORES_DONUT = ['#1E3A5F', '#4A90D9']

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function formatarMi(v) {
  if (v == null) return '-'
  return v.toFixed(2).replace('.', ',') + ' Mi'
}

function formatarEixoMi(v) {
  return `R$ ${Number(v).toFixed(1).replace('.', ',')} Mi`
}

function BarLabelMi({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 3} textAnchor="middle" fontSize={9} fill="#374151">
      {`R$ ${Number(value).toFixed(1).replace('.', ',')} Mi`}
    </text>
  )
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function ProjetosFinep() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosRelacao,   setDadosRelacao]   = useState([])
  const [dadosPorCentro, setDadosPorCentro] = useState([])

  const [filtroAnoInicio,  setFiltroAnoInicio]  = useState([])
  const [filtroAnoTermino, setFiltroAnoTermino] = useState([])
  const [filtroCentro,     setFiltroCentro]     = useState([])
  const [filtroNatureza,   setFiltroNatureza]   = useState([])
  const [filtroSituacao,   setFiltroSituacao]   = useState([])

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)

  const refGraficoDonut  = useRef(null)
  const refGraficoCentro = useRef(null)

  const filtrosAtivos = {
    ano_inicio:  fa(filtroAnoInicio),
    ano_termino: fa(filtroAnoTermino),
    centro:      fa(filtroCentro),
    natureza:    fa(filtroNatureza),
    situacao:    fa(filtroSituacao),
  }

  useEffect(() => {
    getKPIsFinep().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosFinep(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingGraficos(true)
    Promise.all([getRelacaoTipoFinep(filtrosAtivos), getPorCentroFinep(filtrosAtivos)])
      .then(([relacao, centro]) => { setDadosRelacao(relacao); setDadosPorCentro(centro) })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroSituacao]) // eslint-disable-line

  function limparFiltros() {
    setFiltroAnoInicio([])
    setFiltroAnoTermino([])
    setFiltroCentro([])
    setFiltroNatureza([])
    setFiltroSituacao([])
  }

  const totalRelacao = dadosRelacao.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3">

        <div className="grid grid-cols-2 gap-3 w-56 flex-shrink-0">
          {loadingKpis ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <CardMetrica titulo="Valor Total"         valor={formatarMi(kpis.valor_total_mi)} icone={iconFomento} />
              <CardMetrica titulo="Projetos Financiados" valor={kpis.total_projetos}             icone={iconProjetos} />
            </>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
            <FiltroSelect label="Ano de Início"  value={filtroAnoInicio}  onChange={setFiltroAnoInicio}  options={toOpts(opcoes.anos_inicio)} />
            <FiltroSelect label="Ano de Término" value={filtroAnoTermino} onChange={setFiltroAnoTermino} options={toOpts(opcoes.anos_termino)} />
            <FiltroSelect label="Centro/Campi"   value={filtroCentro}     onChange={setFiltroCentro}     options={toOpts(opcoes.centros)} />
            <FiltroSelect label="Natureza"       value={filtroNatureza}   onChange={setFiltroNatureza}   options={toOpts(opcoes.naturezas)} />
            <FiltroSelect label="Situação"       value={filtroSituacao}   onChange={setFiltroSituacao}   options={toOpts(opcoes.situacoes)} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Linha 2: Donut + Barras ── */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

        {/* Donut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGraficoDonut} className="flex-1">
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Relação: Internos x Externos
            </h3>
            {loadingGraficos ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={dadosRelacao}
                    dataKey="total"
                    nameKey="tipo"
                    cx="42%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    labelLine
                  >
                    {dadosRelacao.map((_, i) => (
                      <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalRelacao} />} />
                  <Legend formatter={(value) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGraficoDonut} nomeArquivo="finep_relacao_tipo" />
          </div>
        </div>

        {/* Barras */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGraficoCentro} className="flex-1">
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Valor Total de Fomento por Centro/Campi
            </h3>
            {loadingGraficos ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosPorCentro} margin={{ top: 20, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="centro" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={formatarEixoMi} tick={{ fontSize: 9 }} width={62} />
                  <Tooltip content={<TooltipGrafico formatarValor={(v) => `R$ ${formatarMi(v)}`} />} />
                  <Bar dataKey="valor_mi" fill="#2E5F8A" radius={[3, 3, 0, 0]}>
                    <LabelList content={<BarLabelMi />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGraficoCentro} nomeArquivo="finep_por_centro" />
          </div>
        </div>
      </div>
    </div>
  )
}
