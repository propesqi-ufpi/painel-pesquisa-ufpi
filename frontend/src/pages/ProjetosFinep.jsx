import { useState, useEffect, useRef } from 'react'
import { getKPIsFinep, getFiltrosFinep, getRelacaoTipoFinep, getPorCentroFinep } from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import ChipsFiltros from '../components/ChipsFiltros'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconFomento, iconProjetos } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { useCoresGrafico, useCorPorCategoria } from '../utils/coresGrafico'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import Rosca from '../components/graficos/Rosca'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'

function formatarMi(v) {
  if (v == null) return '-'
  return v.toFixed(2).replace('.', ',') + ' Mi'
}

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function ProjetosFinep() {
  const cores = useCoresGrafico()
  const corDe = useCorPorCategoria(cores)
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosRelacao,   setDadosRelacao]   = useState([])
  const [dadosPorCentro, setDadosPorCentro] = useState([])

  const [filtroAnoInicio,  setFiltroAnoInicio]  = useState([])
  const [filtroAnoTermino, setFiltroAnoTermino] = useState([])
  const [filtroCentro,     setFiltroCentro]     = useState([])
  const [filtroNatureza,   setFiltroNatureza]   = useState([])
  const [filtroSituacao,   setFiltroSituacao]   = useState([])
  const [filtroModalidade, setFiltroModalidade] = useState([])

  const [loadingKpis,     setLoadingKpis]     = useState(true)
  const [loadingGraficos, setLoadingGraficos] = useState(true)

  const refGraficoDonut  = useRef(null)
  const refGraficoCentro = useRef(null)

  const filtrosAtivos = {
    ano_inicio:  fa(filtroAnoInicio),
    ano_termino: fa(filtroAnoTermino),
    centro:      fa(filtroCentro),
    natureza:    fa(filtroNatureza),
    situacao:    fa(filtroSituacao),
    modalidade:  fa(filtroModalidade),
  }

  useEffect(() => {
    getKPIsFinep().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosFinep(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroSituacao, filtroModalidade]) // eslint-disable-line

  useEffect(() => {
    setLoadingGraficos(true)
    // Cada gráfico ignora o próprio filtro: mostra tudo e destaca o que está selecionado.
    Promise.all([getRelacaoTipoFinep(semChave(filtrosAtivos, 'modalidade')), getPorCentroFinep(semChave(filtrosAtivos, 'centro'))])
      .then(([relacao, centro]) => { setDadosRelacao(relacao); setDadosPorCentro(centro) })
      .catch(() => {})
      .finally(() => setLoadingGraficos(false))
  }, [filtroAnoInicio, filtroAnoTermino, filtroCentro, filtroNatureza, filtroSituacao, filtroModalidade]) // eslint-disable-line

  const alternarModalidade = (v) => setFiltroModalidade((atual) => alternarValor(atual, v))
  const alternarCentro     = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroAnoInicio([])
    setFiltroAnoTermino([])
    setFiltroCentro([])
    setFiltroNatureza([])
    setFiltroSituacao([])
    setFiltroModalidade([])
  }


  // Mesmos campos nos seletores e nos chips de filtros ativos.
  const campos = [
    { rotulo: 'Ano de Início', valor: filtroAnoInicio, alterar: setFiltroAnoInicio, opcoes: opcoesFiltro(opcoes.anos_inicio) },
    { rotulo: 'Ano de Término', valor: filtroAnoTermino, alterar: setFiltroAnoTermino, opcoes: opcoesFiltro(opcoes.anos_termino) },
    { rotulo: 'Centro/Campi', valor: filtroCentro, alterar: setFiltroCentro, opcoes: opcoesFiltro(opcoes.centros) },
    { rotulo: 'Natureza', valor: filtroNatureza, alterar: setFiltroNatureza, opcoes: opcoesFiltro(opcoes.naturezas) },
    { rotulo: 'Situação', valor: filtroSituacao, alterar: setFiltroSituacao, opcoes: opcoesFiltro(opcoes.situacoes) },
    { rotulo: 'Modalidade', valor: filtroModalidade, alterar: setFiltroModalidade, opcoes: opcoesFiltro(opcoes.modalidades) },
  ]

  return (
    <div className="pagina">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="pagina-topo">

        <div className="grid grid-cols-2 gap-3 lg:w-56 lg:flex-shrink-0">
          {loadingKpis ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <CardMetrica titulo="Valor Total"         valor={formatarMi(kpis.valor_total_mi)} icone={iconFomento} />
              <CardMetrica titulo="Projetos Financiados" valor={kpis.total_projetos}             icone={iconProjetos} />
            </>
          )}
        </div>

        <div className="lg:flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div className="grade-filtros">
            {campos.map((c) => (
              <FiltroSelect key={c.rotulo} label={c.rotulo} value={c.valor} onChange={c.alterar} options={c.opcoes} />
            ))}
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      <ChipsFiltros campos={campos} onLimpar={limparFiltros} />

      {/* ── Linha 2: Donut + Barras ── */}
      <div className="pagina-corpo">

        {/* Donut */}
        <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGraficoDonut} className="flex-1 flex flex-col">
            <h3 className="text-xs font-semibold text-center text-texto mb-2">
              Relação: Internos x Externos
            </h3>
            <DicaFiltro />
            {loadingGraficos ? (
              <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <Rosca
                dados={dadosRelacao}
                categoria="tipo"
                corDe={corDe}
                selecionados={filtroModalidade}
                onAlternar={alternarModalidade}
                rotuloTotal="projetos"
                nomeSerie="Projetos"
              />
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGraficoDonut} nomeArquivo="finep_relacao_tipo" />
          </div>
        </div>

        {/* Barras */}
        <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGraficoCentro} className="flex-1">
            <h3 className="text-xs font-semibold text-center text-texto mb-2">
              Valor Total de Fomento por Centro/Campi
            </h3>
            <DicaFiltro />
            {loadingGraficos ? (
              <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <BarrasHorizontais dados={dadosPorCentro} categoria="centro" valor="valor_mi" selecionados={filtroCentro} onAlternar={alternarCentro} nomeSerie="Fomento" formatarValor={(v) => `R$ ${formatarMi(v)}`} alturaMax={240} />
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGraficoCentro} nomeArquivo="finep_por_centro" />
          </div>
        </div>
      </div>
    </div>
  )
}
