import { useState, useEffect, useRef } from 'react'
import { getKPIsProjetosPDI, getFiltrosPDI, getPorAreaPDI, getPorCentroPDI, getProjetosPDI } from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconConcluidos, iconEmAndamento } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'

const COLUNAS = [
  { key: 'titulo',      label: 'PROJETOS' },
  { key: 'centro',      label: 'CENTRO' },
  { key: 'coordenador', label: 'COORDENADORES', tipo: 'pessoas' },
  { key: 'natureza',    label: 'NATUREZA' },
  { key: 'situacao',    label: 'SITUAÇÃO' },
  { key: 'area',        label: 'ÁREA DO CONHECIMENTO' },
]

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
    // Cada gráfico ignora o próprio filtro: mostra todas as barras e destaca as selecionadas.
    Promise.all([getPorAreaPDI(semChave(filtrosAtivos, 'area')), getPorCentroPDI(semChave(filtrosAtivos, 'centro'))])
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

  const alternarArea   = (v) => setFiltroArea((atual) => alternarValor(atual, v))
  const alternarCentro = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroAnoInicio([])
    setFiltroAnoTermino([])
    setFiltroCentro([])
    setFiltroNatureza([])
    setFiltroArea([])
    setFiltroSituacao([])
  }

  return (
    <div className="pagina">

      {/* ── Linha 1: KPI Cards + Filtros ── */}
      <div className="pagina-topo">

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 lg:w-56 lg:flex-shrink-0">
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
        <div className="lg:flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div className="grade-filtros">
            <FiltroSelect label="Ano Início"   value={filtroAnoInicio}  onChange={setFiltroAnoInicio}  options={opcoesFiltro(opcoes.anos_inicio)} />
            <FiltroSelect label="Ano Término"  value={filtroAnoTermino} onChange={setFiltroAnoTermino} options={opcoesFiltro(opcoes.anos_termino)} />
            <FiltroSelect label="Centro/Campi" value={filtroCentro}     onChange={setFiltroCentro}     options={opcoesFiltro(opcoes.centros)} />
            <FiltroSelect label="Natureza"     value={filtroNatureza}   onChange={setFiltroNatureza}   options={opcoesFiltro(opcoes.naturezas)} />
            <FiltroSelect label="Área"         value={filtroArea}       onChange={setFiltroArea}       options={opcoesFiltro(opcoes.areas)} />
            <FiltroSelect label="Situação"     value={filtroSituacao}   onChange={setFiltroSituacao}   options={opcoesFiltro(opcoes.situacoes)} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráficos + Tabela ── */}
      <div className="pagina-corpo">

        {/* Coluna de gráficos */}
        <div className="flex flex-col gap-3 min-h-0">

          <div className="bg-superficie rounded-xl p-3 shadow-sm">
            <div ref={refGraficoArea}>
              <h3 className="text-xs font-semibold text-center text-texto mb-2">
                Nº de Projetos x Área do Conhecimento
              </h3>
              <DicaFiltro />
              {loadingGraficos ? (
                <div className="h-40 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
              ) : (
                <BarrasHorizontais dados={dadosPorArea} categoria="area" selecionados={filtroArea} onAlternar={alternarArea} nomeSerie="Projetos" alturaMax={210} />
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoArea} nomeArquivo="projetos_por_area" />
            </div>
          </div>

          <div className="bg-superficie rounded-xl p-3 shadow-sm">
            <div ref={refGraficoCentro}>
              <h3 className="text-xs font-semibold text-center text-texto mb-2">
                Nº de Projetos x Centros/Campus
              </h3>
              <DicaFiltro />
              {loadingGraficos ? (
                <div className="h-40 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
              ) : (
                <BarrasHorizontais dados={dadosPorCentro} categoria="centro" selecionados={filtroCentro} onAlternar={alternarCentro} nomeSerie="Projetos" alturaMax={210} />
              )}
            </div>
            <div className="flex justify-end mt-1">
              <BotaoExportarPNG refGrafico={refGraficoCentro} nomeArquivo="projetos_por_centro" />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="cartao-tabela">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-texto">
              Informações dos Projetos de Pesquisas
            </h3>
            <BotaoExportarCSV dados={projetos} nomeArquivo="projetos_pdi" colunas={COLUNAS} />
          </div>
          <div className="cartao-tabela-corpo">
            <TabelaPaginada colunas={COLUNAS} dados={projetos} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
