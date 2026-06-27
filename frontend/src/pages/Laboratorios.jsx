import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsLaboratorios, getFiltrosLaboratorios,
  getLaboratoriosPorCentro, getLaboratorios,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconLaboratorios } from '../assets/icons.js'

const COLUNAS = [
  { key: 'nome',        label: 'NOME' },
  { key: 'sigla',       label: 'SIGLA' },
  { key: 'centro_campi', label: 'CENTRO/CAMPI' },
  { key: 'responsavel', label: 'RESPONSÁVEL' },
  { key: 'email',       label: 'EMAIL' },
]

const CORES_PIE = [
  '#7AB3E0', '#1E3A5F', '#4A90D9', '#2E5F8A', '#0D2B4A',
  '#A8D1F0', '#3D7DB5', '#6BA3CE', '#9BC4E3', '#1A4F7A',
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardLabs({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">Laboratórios</p>
      <img src={iconLaboratorios} alt="" className="w-7 h-7 object-contain mt-2 opacity-90" />
      <p className="text-3xl font-bold mt-2">{valor ?? '—'}</p>
    </div>
  )
}

export default function Laboratorios() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [labs,           setLabs]           = useState([])

  const [filtroNome,   setFiltroNome]   = useState([])
  const [filtroCentro, setFiltroCentro] = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    nome:         fa(filtroNome),
    centro_campi: fa(filtroCentro),
  }

  useEffect(() => {
    getKPIsLaboratorios().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosLaboratorios(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getLaboratoriosPorCentro(filtrosAtivos).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getLaboratorios({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setLabs(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  function limparFiltros() {
    setFiltroNome([])
    setFiltroCentro([])
  }

  const totalPie = dadosPorCentro.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Top: Card + Gráfico + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3 items-stretch" style={{ height: '280px' }}>

        {/* Card */}
        <div className="w-44 flex-shrink-0">
          <CardLabs valor={kpis.total_laboratorios} loading={loadingKpis} />
        </div>

        {/* Gráfico pizza */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-1">
              Nº de Laboratório x Centro/Campi
            </h3>
            {loadingGrafico ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={215}>
                <PieChart>
                  <Pie
                    data={dadosPorCentro}
                    dataKey="total"
                    nameKey="centro"
                    cx="40%"
                    cy="50%"
                    outerRadius={60}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorCentro.map((_, i) => (
                      <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalPie} />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7}
                    formatter={(value) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="laboratorios_por_centro" />
          </div>
        </div>

        {/* Filtros */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm h-full space-y-2">
            <FiltroSelect label="Laboratório"  value={filtroNome}   onChange={setFiltroNome}   options={toOpts(opcoes.nomes)} />
            <FiltroSelect label="Centro/Campi" value={filtroCentro} onChange={setFiltroCentro} options={toOpts(opcoes.centros)} />
            <BotaoLimparFiltros onClick={limparFiltros} />
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Laboratórios
          </h3>
          <BotaoExportarCSV dados={labs} nomeArquivo="laboratorios" colunas={COLUNAS} />
        </div>
        <div className="flex-1 min-h-0">
          <TabelaPaginada colunas={COLUNAS} dados={labs} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
