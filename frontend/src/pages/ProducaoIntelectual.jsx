import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsProducao, getTiposProducao, getAnosProducao,
  getProducaoAnual, getVitrine,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import ChipsFiltros from '../components/ChipsFiltros'
import FiltroSelect from '../components/FiltroSelect'
import FiltroTexto from '../components/FiltroTexto'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import { alternarValor } from '../utils/filtroCruzado'
import { barraClicavel } from '../components/graficos/barraClicavel'
import DicaFiltro from '../components/graficos/DicaFiltro'
import { useCoresGrafico } from '../utils/coresGrafico'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconPatentes, iconSoftwares, iconMarcas } from '../assets/icons.js'

const COLUNAS_VITRINE = [
  { key: 'pedido',     label: 'PEDIDO' },
  { key: 'ano',        label: 'ANO' },
  { key: 'titulo',     label: 'TÍTULO' },
  { key: 'inventores', label: 'INVENTORES', tipo: 'pessoas' },
  { key: 'descricao',  label: 'DESCRIÇÃO' },
]

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function ProducaoIntelectual() {
  const cores = useCoresGrafico()
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

  // Os gráficos por ano ignoram o filtro de ano: mostram todos os anos e destacam os selecionados.
  useEffect(() => {
    setLoadingGraficos(true)
    Promise.all([
      getProducaoAnual({ tipo: 'PATENTE' }),
      getProducaoAnual({ tipo: 'SOFTWARE' }),
    ])
      .then(([patentes, softwares]) => { setDadosPatentes(patentes); setDadosSoftwares(softwares) })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [])

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

  const alternarAno = (v) => setFiltroAno((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroInventor('')
    setFiltroAno([])
    setFiltroTipo([])
  }

  // Mesmos campos nos seletores e nos chips de filtros ativos.
  const campos = [
    { rotulo: 'Inventores', valor: filtroInventor, alterar: setFiltroInventor, tipo: 'texto' },
    { rotulo: 'Ano', valor: filtroAno, alterar: setFiltroAno, opcoes: anosDisponiveis },
    { rotulo: 'Tipo', valor: filtroTipo, alterar: setFiltroTipo, opcoes: tiposDisponiveis },
  ]

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:h-full">

      {/* ── Filtros (sidebar esquerda) ── */}
      <div className="bg-superficie rounded-xl p-3 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-40 lg:flex-shrink-0 lg:flex lg:flex-col">
        <FiltroTexto label="Inventores" value={filtroInventor} onChange={setFiltroInventor} placeholder="Buscar inventor…" />
        <FiltroSelect label="Ano"  value={filtroAno}  onChange={setFiltroAno}  options={anosDisponiveis} />
        <FiltroSelect label="Tipo" value={filtroTipo} onChange={setFiltroTipo} options={tiposDisponiveis} />
        <BotaoLimparFiltros onClick={limparFiltros} />
      </div>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

        <ChipsFiltros campos={campos} onLimpar={limparFiltros} />

        {/* Cards KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex-shrink-0">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:flex-shrink-0">

          <div className="bg-superficie rounded-xl p-3 shadow-sm">
            <div ref={refGraficoPatentes}>
              <h3 className="text-xs font-semibold text-center text-texto mb-2">
                Patentes depositadas x Ano
              </h3>
              <DicaFiltro />
              {loadingGraficos ? (
                <div className="h-36 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={dadosPatentes.slice().reverse()} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={cores.grade} strokeDasharray="3 3" />
                    <XAxis stroke={cores.grade} type="number" tick={{ fontSize: 10, fill: cores.eixo }} />
                    <YAxis stroke={cores.grade} type="category" dataKey="ano" width={44} tick={{ fontSize: 10, fill: cores.eixo }} />
                    <Tooltip cursor={{ fill: cores.grade, fillOpacity: 0.6 }} content={<TooltipGrafico />} />
                    <Bar dataKey="depositadas" fill={cores.serie1} radius={[0, 3, 3, 0]} shape={barraClicavel({ categoria: 'ano', selecionados: filtroAno, onAlternar: alternarAno })} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoPatentes} nomeArquivo="patentes_por_ano" />
            </div>
          </div>

          <div className="bg-superficie rounded-xl p-3 shadow-sm">
            <div ref={refGraficoSoftwares}>
              <h3 className="text-xs font-semibold text-center text-texto mb-2">
                Softwares Registrados x Ano
              </h3>
              <DicaFiltro />
              {loadingGraficos ? (
                <div className="h-36 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
              ) : (
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={dadosSoftwares.slice().reverse()} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={cores.grade} strokeDasharray="3 3" />
                    <XAxis stroke={cores.grade} type="number" tick={{ fontSize: 10, fill: cores.eixo }} />
                    <YAxis stroke={cores.grade} type="category" dataKey="ano" width={44} tick={{ fontSize: 10, fill: cores.eixo }} />
                    <Tooltip cursor={{ fill: cores.grade, fillOpacity: 0.6 }} content={<TooltipGrafico />} />
                    <Bar dataKey="depositadas" name="Registrados" fill={cores.serie1} radius={[0, 3, 3, 0]} shape={barraClicavel({ categoria: 'ano', selecionados: filtroAno, onAlternar: alternarAno })} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoSoftwares} nomeArquivo="softwares_por_ano" />
            </div>
          </div>
        </div>

        {/* Tabela Vitrine */}
        <div className="cartao-tabela">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-texto">
              Informações das Produções Intelectuais
            </h3>
            <BotaoExportarCSV dados={vitrine} nomeArquivo="producao_intelectual" colunas={COLUNAS_VITRINE} />
          </div>
          <div className="cartao-tabela-corpo">
            <TabelaPaginada colunas={COLUNAS_VITRINE} dados={vitrine} loading={loadingVitrine} />
          </div>
        </div>
      </div>
    </div>
  )
}
