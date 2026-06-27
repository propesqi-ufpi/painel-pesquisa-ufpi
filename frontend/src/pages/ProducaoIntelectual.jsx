import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  getKPIsProducao, getTiposProducao, getAnosProducao,
  getProducaoAnual, getVitrine,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import FiltroTexto from '../components/FiltroTexto'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconPatentes, iconSoftwares, iconMarcas } from '../assets/icons.js'

const CORES = [
  '#1E3A5F', '#2E5F8A', '#4A90D9', '#7AB3E0', '#A8D1F0',
  '#0D2B4A', '#1A4F7A', '#3D7DB5', '#6BA3CE', '#9BC4E3',
]

const COLUNAS_VITRINE = [
  { key: 'pedido',     label: 'PEDIDO' },
  { key: 'ano',        label: 'ANO' },
  { key: 'titulo',     label: 'TÍTULO' },
  { key: 'inventores', label: 'INVENTORES' },
  { key: 'descricao',  label: 'DESCRIÇÃO' },
]

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function ProducaoIntelectual() {
  const [kpis, setKpis] = useState({})
  const [tiposDisponiveis, setTiposDisponiveis] = useState([])
  const [anosDisponiveis,  setAnosDisponiveis]  = useState([])

  const [filtroInventor, setFiltroInventor] = useState('')
  const [filtroAno,      setFiltroAno]      = useState([])
  const [filtroTipo,     setFiltroTipo]     = useState([])

  const [dadosPatentes,  setDadosPatentes]  = useState([])
  const [dadosSoftwares, setDadosSoftwares] = useState([])
  const [vitrine,        setVitrine]        = useState([])

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)
  const [loadingVitrine,  setLoadingVitrine]  = useState(true)

  const refGraficoPatentes  = useRef(null)
  const refGraficoSoftwares = useRef(null)

  useEffect(() => {
    getKPIsProducao().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
    getTiposProducao().then((data) => setTiposDisponiveis(data.map((t) => ({ value: t, label: t })))).catch(() => {})
    getAnosProducao().then((data) => setAnosDisponiveis(data.map((a) => ({ value: String(a), label: String(a) })))).catch(() => {})
  }, [])

  useEffect(() => {
    setLoadingGraficos(true)
    const params = fa(filtroAno) ? { ano: filtroAno } : {}
    Promise.all([
      getProducaoAnual({ tipo: 'PATENTE', ...params }),
      getProducaoAnual({ tipo: 'SOFTWARE', ...params }),
    ])
      .then(([patentes, softwares]) => { setDadosPatentes(patentes); setDadosSoftwares(softwares) })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAno]) // eslint-disable-line

  useEffect(() => {
    setLoadingVitrine(true)
    getVitrine({
      tipo:     fa(filtroTipo),
      ano:      fa(filtroAno),
      inventor: filtroInventor || undefined,
      limit:    9999,
    })
      .then((data) => setVitrine(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingVitrine(false))
  }, [filtroTipo, filtroAno, filtroInventor])

  function limparFiltros() {
    setFiltroInventor('')
    setFiltroAno([])
    setFiltroTipo([])
  }

  const totalSoftwares = dadosSoftwares.reduce((s, d) => s + (d.depositadas ?? 0), 0)

  return (
    <div className="h-full flex gap-3">

      {/* ── Filtros (sidebar esquerda) ── */}
      <div className="w-40 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col gap-3">
        <FiltroTexto label="Inventores" value={filtroInventor} onChange={setFiltroInventor} placeholder="Buscar inventor…" />
        <FiltroSelect label="Ano"  value={filtroAno}  onChange={setFiltroAno}  options={anosDisponiveis} />
        <FiltroSelect label="Tipo" value={filtroTipo} onChange={setFiltroTipo} options={tiposDisponiveis} />
        <BotaoLimparFiltros onClick={limparFiltros} />
      </div>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

        {/* Cards KPI */}
        <div className="flex-shrink-0 grid grid-cols-4 gap-3">
          {loadingKpis ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <CardMetrica titulo="Patentes"           valor={kpis['PATENTE']}           icone={iconPatentes} />
              <CardMetrica titulo="Softwares"          valor={kpis['SOFTWARE']}           icone={iconSoftwares} />
              <CardMetrica titulo="Marcas"             valor={kpis['MARCA']}              icone={iconMarcas} />
              <CardMetrica titulo="Desenho Industrial" valor={kpis['DESENHO INDUSTRIAL']} />
            </>
          )}
        </div>

        {/* Gráficos */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-3">

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div ref={refGraficoPatentes}>
              <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
                Patentes depositadas x Ano
              </h3>
              {loadingGraficos ? (
                <div className="h-36 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={dadosPatentes.slice().reverse()} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="ano" width={44} tick={{ fontSize: 10 }} />
                    <Tooltip content={<TooltipGrafico />} />
                    <Bar dataKey="depositadas" fill="#1E3A5F" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoPatentes} nomeArquivo="patentes_por_ano" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
            <div ref={refGraficoSoftwares}>
              <h3 className="text-xs font-semibold text-center text-gray-700 dark:text-gray-200 mb-2">
                Softwares Registrados x Ano
              </h3>
              {loadingGraficos ? (
                <div className="h-36 flex items-center justify-center text-gray-400 text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={195}>
                  <PieChart>
                    <Pie data={dadosSoftwares} dataKey="depositadas" nameKey="ano" cx="50%" cy="46%" outerRadius={58}>
                      {dadosSoftwares.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipGrafico total={totalSoftwares} />} />
                    <Legend formatter={(value) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoSoftwares} nomeArquivo="softwares_por_ano" />
            </div>
          </div>
        </div>

        {/* Tabela Vitrine */}
        <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Informações das Produções Intelectuais
            </h3>
            <BotaoExportarCSV dados={vitrine} nomeArquivo="producao_intelectual" colunas={COLUNAS_VITRINE} />
          </div>
          <div className="flex-1 min-h-0">
            <TabelaPaginada colunas={COLUNAS_VITRINE} dados={vitrine} loading={loadingVitrine} />
          </div>
        </div>
      </div>
    </div>
  )
}
