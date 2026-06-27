import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getKPIsProjetosPDI, getFiltrosPDI,
  getPorAreaPDI, getPorCentroPDI, getProjetosPDI,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconConcluidos, iconEmAndamento } from '../assets/icons.js'

const COLUNAS = [
  { key: 'titulo',      label: 'PROJETOS' },
  { key: 'centro',      label: 'CENTRO' },
  { key: 'coordenador', label: 'COORDENADORES' },
  { key: 'natureza',    label: 'NATUREZA' },
  { key: 'situacao',    label: 'SITUAÇÃO' },
  { key: 'area',        label: 'ÁREA DO CONHECIMENTO' },
]

function TickRotacionado({ x, y, payload }) {
  const texto =
    typeof payload.value === 'string' && payload.value.length > 12
      ? payload.value.slice(0, 12) + '…'
      : payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="end" fill="#6B7280" fontSize={9} transform="rotate(-35)">
        {texto}
      </text>
    </g>
  )
}

function formatarEixoY(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')} Mil`
  return String(v)
}

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function ProjetosPDI() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorArea,   setDadosPorArea]   = useState([])
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [projetos,       setProjetos]       = useState([])

  const [filtroAnoInicio,  setFiltroAnoInicio]  = useState([])
  const [filtroAnoTermino, setFiltroAnoTermino] = useState([])
  const [filtroCentro,     setFiltroCentro]     = useState([])
  const [filtroNatureza,   setFiltroNatureza]   = useState([])
  const [filtroArea,       setFiltroArea]       = useState([])
  const [filtroSituacao,   setFiltroSituacao]   = useState([])

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)
  const [loadingTabela,   setLoadingTabela]   = useState(true)

  const refGraficoArea   = useRef(null)
  const refGraficoCentro = useRef(null)

  const filtrosAtivos = {
    ano_inicio:  fa(filtroAnoInicio),
    ano_termino: fa(filtroAnoTermino),
    centro:      fa(filtroCentro),
    natureza:    fa(filtroNatureza),
    area:        fa(filtroArea),
    situacao:    fa(filtroSituacao),
  }

  useEffect(() => {
    getKPIsProjetosPDI().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosPDI(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroArea, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingGraficos(true)
    Promise.all([getPorAreaPDI(filtrosAtivos), getPorCentroPDI(filtrosAtivos)])
      .then(([area, centro]) => { setDadosPorArea(area); setDadosPorCentro(centro) })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroArea, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getProjetosPDI({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setProjetos(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroArea, filtroSituacao]) // eslint-disable-line

  function limparFiltros() {
    setFiltroAnoInicio([])
    setFiltroAnoTermino([])
    setFiltroCentro([])
    setFiltroNatureza([])
    setFiltroArea([])
    setFiltroSituacao([])
  }

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Linha 1: KPI Cards + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3">

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 w-56 flex-shrink-0">
          {loadingKpis ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <CardMetrica titulo="Concluídos"    valor={kpis.total_concluidos}   icone={iconConcluidos} />
              <CardMetrica titulo="Em Andamento"  valor={kpis.total_em_andamento} icone={iconEmAndamento} />
            </>
          )}
        </div>

        {/* Filtros */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
            <FiltroSelect label="Ano Início"   value={filtroAnoInicio}  onChange={setFiltroAnoInicio}  options={toOpts(opcoes.anos_inicio)} />
            <FiltroSelect label="Ano Término"  value={filtroAnoTermino} onChange={setFiltroAnoTermino} options={toOpts(opcoes.anos_termino)} />
            <FiltroSelect label="Centro/Campi" value={filtroCentro}     onChange={setFiltroCentro}     options={toOpts(opcoes.centros)} />
            <FiltroSelect label="Natureza"     value={filtroNatureza}   onChange={setFiltroNatureza}   options={toOpts(opcoes.naturezas)} />
            <FiltroSelect label="Área"         value={filtroArea}       onChange={setFiltroArea}       options={toOpts(opcoes.areas)} />
            <FiltroSelect label="Situação"     value={filtroSituacao}   onChange={setFiltroSituacao}   options={toOpts(opcoes.situacoes)} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráficos + Tabela ── */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

        {/* Coluna de gráficos */}
        <div className="flex flex-col gap-3 min-h-0">

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div ref={refGraficoArea}>
              <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
                Nº de Projetos x Área do Conhecimento
              </h3>
              {loadingGraficos ? (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dadosPorArea} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="area" tick={<TickRotacionado />} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="total" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoArea} nomeArquivo="projetos_por_area" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div ref={refGraficoCentro}>
              <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
                Nº de Projetos x Centros/Campus
              </h3>
              {loadingGraficos ? (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dadosPorCentro} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="centro" tick={<TickRotacionado />} interval={0} />
                    <YAxis tickFormatter={formatarEixoY} tick={{ fontSize: 10 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="total" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoCentro} nomeArquivo="projetos_por_centro" />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Informações dos Projetos de Pesquisas
            </h3>
            <BotaoExportarCSV dados={projetos} nomeArquivo="projetos_pdi" colunas={COLUNAS} />
          </div>
          <div className="flex-1 min-h-0">
            <TabelaPaginada colunas={COLUNAS} dados={projetos} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
