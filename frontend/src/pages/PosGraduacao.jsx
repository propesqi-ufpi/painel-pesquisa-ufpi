import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsPosGraduacao, getFiltrosPosGraduacao,
  getPosGraduacaoPorCentro, getPosGraduacao,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconPosGraduacao } from '../assets/icons.js'

const COLUNAS = [
  { key: 'programa',       label: 'PROGRAMA' },
  { key: 'fone',           label: 'FONE' },
  { key: 'email',          label: 'EMAIL' },
  { key: 'centro',         label: 'CENTRO' },
  { key: 'nivel',          label: 'NÍVEL' },
  { key: 'modalidade',     label: 'MODALIDADE' },
  { key: 'tipo',           label: 'TIPO' },
  { key: 'conceito_capes', label: 'CONCEITO CAPES' },
]

function TickRotacionado({ x, y, payload }) {
  const texto =
    typeof payload.value === 'string' && payload.value.length > 10
      ? payload.value.slice(0, 10) + '…'
      : payload.value
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="end" fill="#6B7280" fontSize={9} transform="rotate(-35)">
        {texto}
      </text>
    </g>
  )
}

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardPosGrad({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">Pós-Graduação</p>
      <img src={iconPosGraduacao} alt="" className="w-7 h-7 object-contain mt-2 opacity-90" />
      <p className="text-3xl font-bold mt-2">{valor ?? '—'}</p>
    </div>
  )
}

export default function PosGraduacao() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [programas,      setProgramas]      = useState([])

  const [filtroPrograma, setFiltroPrograma] = useState([])
  const [filtroConceito, setFiltroConceito] = useState([])
  const [filtroCentro,   setFiltroCentro]   = useState([])
  const [filtroNivel,    setFiltroNivel]    = useState([])
  const [filtroTipo,     setFiltroTipo]     = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    programa:       fa(filtroPrograma),
    conceito_capes: fa(filtroConceito),
    centro:         fa(filtroCentro),
    nivel:          fa(filtroNivel),
    tipo:           fa(filtroTipo),
  }

  useEffect(() => {
    getKPIsPosGraduacao().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosPosGraduacao(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getPosGraduacaoPorCentro(filtrosAtivos).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getPosGraduacao({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setProgramas(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  function limparFiltros() {
    setFiltroPrograma([])
    setFiltroConceito([])
    setFiltroCentro([])
    setFiltroNivel([])
    setFiltroTipo([])
  }

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Top: Card + Gráfico + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3 items-stretch" style={{ height: '230px' }}>

        {/* Card */}
        <div className="w-44 flex-shrink-0">
          <CardPosGrad valor={kpis.total_pos_graduacao} loading={loadingKpis} />
        </div>

        {/* Gráfico */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-1">
              Nº de Pós-graduação x Centro
            </h3>
            {loadingGrafico ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={168}>
                <BarChart data={dadosPorCentro} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="centro" tick={<TickRotacionado />} interval={0}
                    label={{ value: 'CENTRO', position: 'insideBottom', offset: -30, fontSize: 9, fill: '#6B7280' }}
                  />
                  <YAxis tick={{ fontSize: 10 }}
                    label={{ value: 'Programas', angle: -90, position: 'insideLeft', offset: 10, fontSize: 9, fill: '#6B7280' }}
                  />
                  <Tooltip content={<TooltipGrafico />} />
                  <Bar dataKey="total" fill="#2E5F8A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="pos_graduacao_por_centro" />
          </div>
        </div>

        {/* Filtros */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm h-full">
            <div className="grid grid-cols-2 gap-2">
              <FiltroSelect label="Programa"       value={filtroPrograma} onChange={setFiltroPrograma} options={toOpts(opcoes.programas)} />
              <FiltroSelect label="Conceito CAPES" value={filtroConceito} onChange={setFiltroConceito} options={toOpts(opcoes.conceitos_capes)} />
              <FiltroSelect label="Centro/Campi"   value={filtroCentro}   onChange={setFiltroCentro}   options={toOpts(opcoes.centros)} />
              <FiltroSelect label="Nível"          value={filtroNivel}    onChange={setFiltroNivel}    options={toOpts(opcoes.niveis)} />
              <FiltroSelect label="Tipo"           value={filtroTipo}     onChange={setFiltroTipo}     options={toOpts(opcoes.tipos)} />
              <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Programas de Pós-Graduação
          </h3>
          <BotaoExportarCSV dados={programas} nomeArquivo="pos_graduacao" colunas={COLUNAS} />
        </div>
        <div className="flex-1 min-h-0">
          <TabelaPaginada colunas={COLUNAS} dados={programas} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
