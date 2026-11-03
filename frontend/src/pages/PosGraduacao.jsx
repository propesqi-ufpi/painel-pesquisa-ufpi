import { useState, useEffect, useRef } from 'react'
import { getKPIsPosGraduacao, getFiltrosPosGraduacao, getPosGraduacaoPorCentro, getPosGraduacao } from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import ChipsFiltros from '../components/ChipsFiltros'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconPosGraduacao } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'

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

function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardPosGrad({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-faixa text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
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
    getPosGraduacaoPorCentro(semChave(filtrosAtivos, 'centro')).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getPosGraduacao({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setProgramas(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroPrograma, filtroConceito, filtroCentro, filtroNivel, filtroTipo]) // eslint-disable-line

  const alternarCentro = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroPrograma([])
    setFiltroConceito([])
    setFiltroCentro([])
    setFiltroNivel([])
    setFiltroTipo([])
  }

  // Mesmos campos nos seletores e nos chips de filtros ativos.
  const campos = [
    { rotulo: 'Programa', valor: filtroPrograma, alterar: setFiltroPrograma, opcoes: opcoesFiltro(opcoes.programas) },
    { rotulo: 'Conceito CAPES', valor: filtroConceito, alterar: setFiltroConceito, opcoes: opcoesFiltro(opcoes.conceitos_capes) },
    { rotulo: 'Centro/Campi', valor: filtroCentro, alterar: setFiltroCentro, opcoes: opcoesFiltro(opcoes.centros) },
    { rotulo: 'Nível', valor: filtroNivel, alterar: setFiltroNivel, opcoes: opcoesFiltro(opcoes.niveis) },
    { rotulo: 'Tipo', valor: filtroTipo, alterar: setFiltroTipo, opcoes: opcoesFiltro(opcoes.tipos) },
  ]

  return (
    <div className="pagina">

      {/* ── Top: Card + Gráfico + Filtros ── */}
      <div className="pagina-topo-tres lg:h-[250px]">

        {/* Card */}
        <div className="lg:w-44 lg:flex-shrink-0">
          <CardPosGrad valor={kpis.total_pos_graduacao} loading={loadingKpis} />
        </div>

        {/* Gráfico */}
        <div className="topo-grafico bg-superficie rounded-xl p-3 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-texto mb-1">
              Nº de Pós-graduação x Centro
            </h3>
            <DicaFiltro />
            {loadingGrafico ? (
              <div className="h-40 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <BarrasHorizontais dados={dadosPorCentro} categoria="centro" selecionados={filtroCentro} onAlternar={alternarCentro} nomeSerie="Programas" alturaMax={150} />
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="pos_graduacao_por_centro" />
          </div>
        </div>

        {/* Filtros */}
        <div className="lg:w-52 lg:flex-shrink-0">
          <div className="bg-superficie rounded-xl p-3 shadow-sm h-full">
            <div className="grid grid-cols-2 gap-2">
              {campos.map((c) => (
                <FiltroSelect key={c.rotulo} label={c.rotulo} value={c.valor} onChange={c.alterar} options={c.opcoes} />
              ))}
              <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
            </div>
          </div>
        </div>
      </div>

      <ChipsFiltros campos={campos} onLimpar={limparFiltros} />

      {/* ── Tabela ── */}
      <div className="cartao-tabela">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-texto">
            Informações dos Programas de Pós-Graduação
          </h3>
          <BotaoExportarCSV dados={programas} nomeArquivo="pos_graduacao" colunas={COLUNAS} />
        </div>
        <div className="cartao-tabela-corpo">
          <TabelaPaginada colunas={COLUNAS} dados={programas} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
