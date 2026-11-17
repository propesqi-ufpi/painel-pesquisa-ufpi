import { useState, useEffect, useRef } from 'react'
import { getKPIsBolsistas, getFiltrosBolsistas, getBolsistasPorCampus, getBolsistas } from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import ChipsFiltros from '../components/ChipsFiltros'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import TabelaPaginada from '../components/TabelaPaginada'
import { opcoesFiltro } from '../utils/exibicao'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'
import { formatarNumero } from '../utils/numeros'

const COLUNAS = [
  { key: 'nome',          label: 'NOME', tipo: 'pessoa' },
  { key: 'nivel',         label: 'NÍVEL', curta: true },
  { key: 'modalidade',    label: 'MODALIDADE' },
  { key: 'orgao',         label: 'ÓRGÃO' },
  { key: 'campus_centro', label: 'CAMPUS/CENTRO' },
]

// Todos os bolsistas por padrão, em ordem alfabética.
const ORDEM_INICIAL = { key: 'nome', dir: 'asc' }

function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardGrande({ titulo, valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-faixa text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
      <p className="text-sm font-bold uppercase tracking-widest opacity-80">{titulo}</p>
      <p className="text-4xl font-bold mt-2">{valor ?? '—'}</p>
    </div>
  )
}

export default function Bolsistas() {
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorCampus, setDadosPorCampus] = useState([])
  const [bolsistas,      setBolsistas]      = useState([])

  const [filtroModalidade, setFiltroModalidade] = useState([])
  const [filtroOrgao,      setFiltroOrgao]      = useState([])
  const [filtroCentro,     setFiltroCentro]     = useState([])
  const [filtroNome,       setFiltroNome]       = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    modalidade:    fa(filtroModalidade),
    orgao:         fa(filtroOrgao),
    campus_centro: fa(filtroCentro),
    nome:          fa(filtroNome),
  }

  useEffect(() => {
    getKPIsBolsistas().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosBolsistas(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroModalidade, filtroOrgao, filtroCentro, filtroNome]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getBolsistasPorCampus(semChave(filtrosAtivos, 'campus_centro'))
      .then(setDadosPorCampus)
      .catch(() => {})
      .finally(() => setLoadingGrafico(false))
  }, [filtroModalidade, filtroOrgao, filtroCentro, filtroNome]) // eslint-disable-line

  // A lista segue todos os filtros, inclusive o campus escolhido no gráfico.
  useEffect(() => {
    setLoadingTabela(true)
    getBolsistas({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setBolsistas(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroModalidade, filtroOrgao, filtroCentro, filtroNome]) // eslint-disable-line

  const alternarCampus = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroModalidade([])
    setFiltroOrgao([])
    setFiltroCentro([])
    setFiltroNome([])
  }

  const totalCampus = dadosPorCampus.reduce((s, d) => s + (d.total ?? 0), 0)

  // Mesmos campos nos seletores e nos chips de filtros ativos.
  const campos = [
    { rotulo: 'Modalidade', valor: filtroModalidade, alterar: setFiltroModalidade, opcoes: opcoesFiltro(opcoes.modalidades) },
    { rotulo: 'Órgão', valor: filtroOrgao, alterar: setFiltroOrgao, opcoes: opcoesFiltro(opcoes.orgaos) },
    { rotulo: 'Centro/Campus', valor: filtroCentro, alterar: setFiltroCentro, opcoes: opcoesFiltro(opcoes.campi) },
    { rotulo: 'Nome', valor: filtroNome, alterar: setFiltroNome, opcoes: opcoesFiltro(opcoes.nomes, { tipo: 'pessoa' }) },
  ]

  return (
    <div className="pagina-com-tabela">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="pagina-topo">

        <div className="grid grid-cols-2 gap-3 lg:w-64 lg:flex-shrink-0">
          <CardGrande titulo="CNPq" valor={kpis.total_cnpq} loading={loadingKpis} />
          <CardGrande titulo="UFPI" valor={kpis.total_ufpi} loading={loadingKpis} />
        </div>

        <div className="lg:flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div className="grade-filtros lg:grid-cols-4">
            {campos.map((c) => (
              <FiltroSelect key={c.rotulo} label={c.rotulo} value={c.valor} onChange={c.alterar} options={c.opcoes} />
            ))}
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      <ChipsFiltros campos={campos} onLimpar={limparFiltros} />

      {/* ── Gráfico por campus; a lista vem embaixo, na largura toda ── */}
      <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
        <div ref={refGrafico} className="flex flex-col">
          <h3 className="text-xs font-semibold text-center text-texto mb-2">
            Bolsistas por Campus/Centro
          </h3>
          <DicaFiltro />
          {loadingGrafico ? (
            <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
          ) : (
            <BarrasHorizontais dados={dadosPorCampus} categoria="campus" selecionados={filtroCentro} onAlternar={alternarCampus} nomeSerie="Bolsistas" total={totalCampus} alturaMax={320} />
          )}
        </div>
        <div className="flex justify-end mt-1 flex-shrink-0">
          <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="bolsistas_por_campus" />
        </div>
      </div>

      {/* Lista */}
      <div className="cartao-tabela">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-texto">
            Lista de Bolsistas
            {!loadingTabela && <span className="ml-1 font-normal text-texto-suave">({formatarNumero(bolsistas.length)})</span>}
          </h3>
          <BotaoExportarCSV dados={bolsistas} nomeArquivo="bolsistas" colunas={COLUNAS} />
        </div>
        <div className="cartao-tabela-corpo">
          <TabelaPaginada colunas={COLUNAS} dados={bolsistas} loading={loadingTabela} ordemInicial={ORDEM_INICIAL} emptyMessage="Nenhum bolsista para os filtros escolhidos" />
        </div>
      </div>
    </div>
  )
}
