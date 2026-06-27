import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsGrupos, getFiltrosGrupos,
  getGruposPorArea, getGrupos,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconGrupos } from '../assets/icons.js'

const COLUNAS = [
  { key: 'nome_grupo',        label: 'NOME DO GRUPO' },
  { key: 'nome_lider',        label: 'NOME DO LÍDER' },
  { key: 'area_predominante', label: 'ÁREA PREDOMINANTE' },
  { key: 'ultimo_envio',      label: 'ÚLTIMO ENVIO' },
  { key: 'status',            label: 'SITUAÇÃO' },
]

function toOpts(arr = []) {
  return arr.map((v) => ({ value: String(v), label: String(v) }))
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardGrupos({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-azul-escuro text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">Grupos de Pesquisa</p>
      <img src={iconGrupos} alt="" className="w-7 h-7 object-contain mt-2 opacity-90" />
      <p className="text-3xl font-bold mt-2">{valor ?? '—'}</p>
    </div>
  )
}

export default function GruposPesquisa() {
  const [kpis,         setKpis]         = useState({})
  const [opcoes,       setOpcoes]       = useState({})
  const [dadosPorArea, setDadosPorArea] = useState([])
  const [grupos,       setGrupos]       = useState([])

  const [filtroNome, setFiltroNome] = useState([])
  const [filtroArea, setFiltroArea] = useState([])
  const [filtroAno,  setFiltroAno]  = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    nome_grupo:        fa(filtroNome),
    area_predominante: fa(filtroArea),
    ultimo_envio:      fa(filtroAno),
  }

  useEffect(() => {
    getKPIsGrupos().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosGrupos(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroNome, filtroArea, filtroAno]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getGruposPorArea(filtrosAtivos)
      .then((data) => setDadosPorArea(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroNome, filtroArea, filtroAno]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getGrupos({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setGrupos(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroNome, filtroArea, filtroAno]) // eslint-disable-line

  function limparFiltros() {
    setFiltroNome([])
    setFiltroArea([])
    setFiltroAno([])
  }

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Top: Card + Gráfico + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3 items-stretch" style={{ height: '230px' }}>

        {/* Card */}
        <div className="w-44 flex-shrink-0">
          <CardGrupos valor={kpis.total_grupos} loading={loadingKpis} />
        </div>

        {/* Gráfico */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-1">
              Nº de Grupos por Área Predominante
            </h3>
            {loadingGrafico ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: 148 }}>
                <div style={{ height: Math.max(148, dadosPorArea.length * 26), width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosPorArea} layout="vertical" margin={{ top: 2, right: 24, left: 0, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <YAxis type="category" dataKey="area" width={120} tick={{ fontSize: 9 }} />
                      <XAxis type="number" tick={{ fontSize: 10 }}
                        label={{ value: 'N° DE GRUPOS', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#6B7280' }}
                      />
                      <Tooltip content={<TooltipGrafico />} />
                      <Bar dataKey="total" fill="#2E5F8A" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="grupos_por_area" />
          </div>
        </div>

        {/* Filtros */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm h-full space-y-2">
            <FiltroSelect label="Nome do Grupo"       value={filtroNome} onChange={setFiltroNome} options={toOpts(opcoes.nomes)} />
            <FiltroSelect label="Área"               value={filtroArea} onChange={setFiltroArea} options={toOpts(opcoes.areas)} />
            <FiltroSelect label="Ano de Atualização" value={filtroAno}  onChange={setFiltroAno}  options={toOpts(opcoes.anos_envio)} />
            <BotaoLimparFiltros onClick={limparFiltros} />
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Informações dos Grupos de Pesquisas
          </h3>
          <BotaoExportarCSV dados={grupos} nomeArquivo="grupos" colunas={COLUNAS} />
        </div>
        <div className="flex-1 min-h-0">
          <TabelaPaginada colunas={COLUNAS} dados={grupos} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
