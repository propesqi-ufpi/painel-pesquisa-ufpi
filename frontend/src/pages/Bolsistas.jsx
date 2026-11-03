import { useState, useEffect, useRef } from 'react'
import { getKPIsBolsistas, getFiltrosBolsistas, getBolsistasPorCampus } from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { opcoesFiltro } from '../utils/exibicao'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'

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

  const [filtroModalidade, setFiltroModalidade] = useState([])
  const [filtroOrgao,      setFiltroOrgao]      = useState([])
  const [filtroCentro,     setFiltroCentro]     = useState([])
  const [filtroNome,       setFiltroNome]       = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)

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

  const alternarCampus = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroModalidade([])
    setFiltroOrgao([])
    setFiltroCentro([])
    setFiltroNome([])
  }

  const totalCampus = dadosPorCampus.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="pagina">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="pagina-topo">

        <div className="grid grid-cols-2 gap-3 lg:w-64 lg:flex-shrink-0">
          <CardGrande titulo="CNPq" valor={kpis.total_cnpq} loading={loadingKpis} />
          <CardGrande titulo="UFPI" valor={kpis.total_ufpi} loading={loadingKpis} />
        </div>

        <div className="lg:flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div className="grade-filtros lg:grid-cols-4">
            <FiltroSelect label="Modalidade"    value={filtroModalidade} onChange={setFiltroModalidade} options={opcoesFiltro(opcoes.modalidades)} />
            <FiltroSelect label="Órgão"         value={filtroOrgao}      onChange={setFiltroOrgao}      options={opcoesFiltro(opcoes.orgaos)} />
            <FiltroSelect label="Centro/Campus" value={filtroCentro}     onChange={setFiltroCentro}     options={opcoesFiltro(opcoes.campi)} />
            <FiltroSelect label="Nome"          value={filtroNome}       onChange={setFiltroNome}       options={opcoesFiltro(opcoes.nomes, { tipo: 'pessoa' })} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Gráfico por campus ── */}
      <div className="lg:flex-1 lg:min-h-0 bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
        <div ref={refGrafico} className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-xs font-semibold text-center text-texto mb-2">
            Bolsistas por Campus/Centro
          </h3>
          <DicaFiltro />
          {loadingGrafico ? (
            <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
          ) : (
            <BarrasHorizontais dados={dadosPorCampus} categoria="campus" selecionados={filtroCentro} onAlternar={alternarCampus} nomeSerie="Bolsistas" total={totalCampus} className="flex-1 min-h-0 max-h-[60vh] lg:max-h-none" />
          )}
        </div>
        <div className="flex justify-end mt-1 flex-shrink-0">
          <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="bolsistas_por_campus" />
        </div>
      </div>
    </div>
  )
}
