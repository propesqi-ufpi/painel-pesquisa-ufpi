import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsNucleos, getFiltrosNucleos,
  getNucleosPorCentro, getNucleos,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconNucleos, iconNucleosAtivos, iconNucleosInativos } from '../assets/icons.js'

const COLUNAS = [
  { key: 'denominacao',   label: 'DENOMINAÇÃO' },
  { key: 'centro_campus', label: 'CENTRO/CAMPUS' },
  { key: 'coordenador',   label: 'COORDENADOR' },
  { key: 'ano_resolucao', label: 'ANO DA RESOLUÇÃO' },
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

export default function NucleosPesquisa() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [nucleos,        setNucleos]        = useState([])

  const [filtroCentro,      setFiltroCentro]      = useState([])
  const [filtroVinculacao,  setFiltroVinculacao]  = useState([])
  const [filtroAno,         setFiltroAno]         = useState([])
  const [filtroDenominacao, setFiltroDenominacao] = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    centro_campus: fa(filtroCentro),
    vinculacao:    fa(filtroVinculacao),
    ano_resolucao: fa(filtroAno),
    denominacao:   fa(filtroDenominacao),
  }

  useEffect(() => {
    getKPIsNucleos().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosNucleos(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getNucleosPorCentro(filtrosAtivos).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getNucleos({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setNucleos(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  function limparFiltros() {
    setFiltroCentro([])
    setFiltroVinculacao([])
    setFiltroAno([])
    setFiltroDenominacao([])
  }

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3">

        <div className="grid grid-cols-3 gap-3 w-72 flex-shrink-0">
          {loadingKpis ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <CardMetrica titulo="Total"    valor={kpis.total_nucleos}   icone={iconNucleos} />
              <CardMetrica titulo="Ativos"   valor={kpis.total_ativos}    icone={iconNucleosAtivos} />
              <CardMetrica titulo="Inativos" valor={kpis.total_inativos}  icone={iconNucleosInativos} />
            </>
          )}
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FiltroSelect label="Centro/Campi" value={filtroCentro}      onChange={setFiltroCentro}      options={toOpts(opcoes.centros)} />
            <FiltroSelect label="Vinculação"   value={filtroVinculacao}  onChange={setFiltroVinculacao}  options={toOpts(opcoes.vinculacoes)} />
            <FiltroSelect label="Ano"          value={filtroAno}         onChange={setFiltroAno}         options={toOpts(opcoes.anos)} />
            <FiltroSelect label="Núcleos"      value={filtroDenominacao} onChange={setFiltroDenominacao} options={toOpts(opcoes.nucleos)} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráfico + Tabela ── */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

        {/* Gráfico */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Nº de Núcleos x Centro/Campi
            </h3>
            {loadingGrafico ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dadosPorCentro} margin={{ top: 8, right: 8, left: 0, bottom: 44 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="centro" tick={<TickRotacionado />} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<TooltipGrafico />} />
                  <Bar dataKey="total" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="nucleos_por_centro" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Informações dos Núcleos de Pesquisa
            </h3>
            <BotaoExportarCSV dados={nucleos} nomeArquivo="nucleos" colunas={COLUNAS} />
          </div>
          <div className="flex-1 min-h-0">
            <TabelaPaginada colunas={COLUNAS} dados={nucleos} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
