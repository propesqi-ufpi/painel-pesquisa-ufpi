import { useState, useEffect, useRef } from 'react'
import {
  getKPIsIncubadas, getFiltrosIncubadas,
  getIncubadasPorIncubadora, getIncubadas,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import ChipsFiltros from '../components/ChipsFiltros'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconIncubadas, iconGraduadas, iconInbate } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { useCoresGrafico, useCorPorCategoria } from '../utils/coresGrafico'
import { alternarValor, semChave } from '../utils/filtroCruzado'
import Rosca from '../components/graficos/Rosca'
import DicaFiltro from '../components/graficos/DicaFiltro'

const COLUNAS = [
  { key: 'nome_projeto',   label: 'NOME DO PROJETO' },
  { key: 'objetivo',       label: 'OBJETIVO', longo: true },
  { key: 'equipe_projeto', label: 'EQUIPE DO PROJETO', tipo: 'pessoas' },
  { key: 'contato',        label: 'CONTATO', longo: true },
  { key: 'incubadora',     label: 'INCUBADORA' },
]

function fa(arr) { return arr.length > 0 ? arr : undefined }

export default function EmpresasIncubadas() {
  const cores = useCoresGrafico()
  const corDe = useCorPorCategoria(cores)
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
    getIncubadasPorIncubadora(semChave(filtrosAtivos, 'incubadora')).then(setDadosPorIncubadora).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getIncubadas({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setIncubadas(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroIncubadora, filtroSituacao]) // eslint-disable-line

  const alternarIncubadora = (v) => setFiltroIncubadora((atual) => alternarValor(atual, v))

  function limparFiltros() {
    setFiltroIncubadora([])
    setFiltroSituacao([])
  }


  // Mesmos campos nos seletores e nos chips de filtros ativos.
  const campos = [
    { rotulo: 'Incubadora', valor: filtroIncubadora, alterar: setFiltroIncubadora, opcoes: opcoesFiltro(opcoes.incubadoras) },
    { rotulo: 'Situação', valor: filtroSituacao, alterar: setFiltroSituacao, opcoes: opcoesFiltro(opcoes.situacoes) },
  ]

  return (
    <div className="pagina-com-tabela">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="pagina-topo">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:flex-1">
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

        <div className="lg:w-56 lg:flex-shrink-0">
          <div className="bg-superficie rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex gap-2 items-end">
              <FiltroSelect
                label="Incubadora"
                value={filtroIncubadora}
                onChange={setFiltroIncubadora}
                options={opcoesFiltro(opcoes.incubadoras)}
                className="flex-1"
              />
              <BotaoLimparFiltros onClick={limparFiltros} />
            </div>
            <FiltroSelect label="Situação" value={filtroSituacao} onChange={setFiltroSituacao} options={opcoesFiltro(opcoes.situacoes)} />
          </div>
        </div>
      </div>

      <ChipsFiltros campos={campos} onLimpar={limparFiltros} />

      {/* ── Linha 2: Donut + Tabela ── */}
      {/* Donut */}
      <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
        <div ref={refGrafico} className="flex-1 flex flex-col">
          <h3 className="text-xs font-semibold text-center text-texto mb-2">
            Número de Empresas Incubadas por Incubadora
          </h3>
          <DicaFiltro />
          {loadingGrafico ? (
            <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
          ) : (
            <Rosca
              dados={dadosPorIncubadora}
              categoria="incubadora"
              corDe={corDe}
              selecionados={filtroIncubadora}
              onAlternar={alternarIncubadora}
              rotuloTotal="empresas"
              nomeSerie="Empresas"
            />
          )}
        </div>
        <div className="flex justify-end mt-1">
          <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="incubadas_por_incubadora" />
        </div>
      </div>

      {/* Tabela */}
      <div className="cartao-tabela">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-texto">
            Informações das Empresas
          </h3>
          <BotaoExportarCSV dados={incubadas} nomeArquivo="incubadas" colunas={COLUNAS} />
        </div>
        <div className="cartao-tabela-corpo">
          <TabelaPaginada colunas={COLUNAS} dados={incubadas} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
