import { useState, useEffect, useRef } from 'react'
import { getKPIsNucleos, getFiltrosNucleos, getNucleosPorCentro, getNucleos } from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconNucleos, iconNucleosAtivos, iconNucleosInativos } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import BarrasHorizontais from '../components/graficos/BarrasHorizontais'
import DicaFiltro from '../components/graficos/DicaFiltro'

const COLUNAS = [
  { key: 'denominacao',   label: 'DENOMINAÇÃO' },
  { key: 'centro_campus', label: 'CENTRO/CAMPUS' },
  { key: 'coordenador',   label: 'COORDENADOR', tipo: 'pessoas' },
  { key: 'ano_resolucao', label: 'ANO DA RESOLUÇÃO' },
]

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
    getNucleosPorCentro(semChave(filtrosAtivos, 'centro_campus')).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getNucleos({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setNucleos(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroCentro, filtroVinculacao, filtroAno, filtroDenominacao]) // eslint-disable-line

  const alternarCentro = (v) => setFiltroCentro((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroCentro([])
    setFiltroVinculacao([])
    setFiltroAno([])
    setFiltroDenominacao([])
  }

  return (
    <div className="pagina">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="pagina-topo">

        <div className="grid grid-cols-3 gap-3 lg:w-72 lg:flex-shrink-0">
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

        <div className="lg:flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div className="grade-filtros lg:grid-cols-4">
            <FiltroSelect label="Centro/Campi" value={filtroCentro}      onChange={setFiltroCentro}      options={opcoesFiltro(opcoes.centros)} />
            <FiltroSelect label="Vinculação"   value={filtroVinculacao}  onChange={setFiltroVinculacao}  options={opcoesFiltro(opcoes.vinculacoes)} />
            <FiltroSelect label="Ano"          value={filtroAno}         onChange={setFiltroAno}         options={opcoesFiltro(opcoes.anos)} />
            <FiltroSelect label="Núcleos"      value={filtroDenominacao} onChange={setFiltroDenominacao} options={opcoesFiltro(opcoes.nucleos)} />
            <div className="flex items-end"><BotaoLimparFiltros onClick={limparFiltros} /></div>
          </div>
        </div>
      </div>

      {/* ── Linha 2: Gráfico + Tabela ── */}
      <div className="pagina-corpo">

        {/* Gráfico */}
        <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-texto mb-2">
              Nº de Núcleos x Centro/Campi
            </h3>
            <DicaFiltro />
            {loadingGrafico ? (
              <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <BarrasHorizontais dados={dadosPorCentro} categoria="centro" selecionados={filtroCentro} onAlternar={alternarCentro} nomeSerie="Núcleos" alturaMax={260} />
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="nucleos_por_centro" />
          </div>
        </div>

        {/* Tabela */}
        <div className="cartao-tabela">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-texto">
              Informações dos Núcleos de Pesquisa
            </h3>
            <BotaoExportarCSV dados={nucleos} nomeArquivo="nucleos" colunas={COLUNAS} />
          </div>
          <div className="cartao-tabela-corpo">
            <TabelaPaginada colunas={COLUNAS} dados={nucleos} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
