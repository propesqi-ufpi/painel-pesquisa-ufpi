import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsIncubadas, getFiltrosIncubadas,
  getIncubadasPorIncubadora, getIncubadas,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconIncubadas, iconGraduadas, iconInbate } from '../assets/icons.js'

const COLUNAS = [
  { key: 'nome_projeto',   label: 'NOME DO PROJETO' },
  { key: 'objetivo',       label: 'OBJETIVO' },
  { key: 'equipe_projeto', label: 'EQUIPE DO PROJETO' },
  { key: 'contato',        label: 'CONTATO' },
  { key: 'incubadora',     label: 'INCUBADORA' },
]

const CORES_DONUT = [
  '#1E3A5F', '#4A90D9', '#2E5F8A', '#7AB3E0', '#A8D1F0',
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function EmpresasIncubadas() {
  const [kpis,               setKpis]               = useState({})
  const [opcoes,             setOpcoes]             = useState({})
  const [dadosPorIncubadora, setDadosPorIncubadora] = useState([])
  const [incubadas,          setIncubadas]          = useState([])

  const [filtroIncubadora, setFiltroIncubadora] = useState([])
  const [filtroSituacao,   setFiltroSituacao]   = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    incubadora: fa(filtroIncubadora),
    situacao:   fa(filtroSituacao),
  }

  useEffect(() => {
    getKPIsIncubadas().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosIncubadas(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getIncubadasPorIncubadora(filtrosAtivos).then(setDadosPorIncubadora).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getIncubadas({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setIncubadas(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  function limparFiltros() {
    setFiltroIncubadora([])
    setFiltroSituacao([])
  }

  const totalDonut = dadosPorIncubadora.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3">

        <div className="grid grid-cols-3 gap-3 flex-1">
          {loadingKpis ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <CardMetrica titulo="Empresas Incubadas"  valor={kpis.total_incubadas}   icone={iconIncubadas} tamanhoValor="text-4xl" />
              <CardMetrica titulo="Empresas Graduadas"  valor={kpis.total_graduadas}   icone={iconGraduadas} tamanhoValor="text-4xl" />
              <CardMetrica titulo="Incubadoras"         valor={kpis.total_incubadoras} icone={iconInbate}    tamanhoValor="text-4xl" />
            </>
          )}
        </div>

        <div className="w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex gap-2 items-end">
              <FiltroSelect
                label="Incubadora"
                value={filtroIncubadora}
                onChange={setFiltroIncubadora}
                options={toOpts(opcoes.incubadoras)}
                className="flex-1"
              />
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect label="Situação" value={filtroSituacao} onChange={setFiltroSituacao} options={toOpts(opcoes.situacoes)} />
          </div>
        </div>
      </div>

      {/* ── Linha 2: Donut + Tabela ── */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

        {/* Donut */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
              Número de Empresas Incubadas por Incubadora
            </h3>
            {loadingGrafico ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={dadosPorIncubadora}
                    dataKey="total"
                    nameKey="incubadora"
                    cx="42%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={90}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorIncubadora.map((_, i) => (
                      <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipGrafico total={totalDonut} />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7}
                    formatter={(value) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="incubadas_por_incubadora" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Informações das Empresas
            </h3>
            <BotaoExportarCSV dados={incubadas} nomeArquivo="incubadas" colunas={COLUNAS} />
          </div>
          <div className="flex-1 min-h-0">
            <TabelaPaginada colunas={COLUNAS} dados={incubadas} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
