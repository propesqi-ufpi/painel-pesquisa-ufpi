import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsLaboratorios, getFiltrosLaboratorios,
  getLaboratoriosPorCentro, getLaboratorios,
} from '../api/index.js'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconLaboratorios } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { useCoresGrafico, useCorPorCategoria } from '../utils/coresGrafico'
import { alternarValor, semChave, opacidade } from '../utils/filtroCruzado'
import { valorDaFatia } from '../components/graficos/barraClicavel'
import LegendaClicavel from '../components/graficos/LegendaClicavel'
import DicaFiltro from '../components/graficos/DicaFiltro'

const COLUNAS = [
  { key: 'nome',        label: 'NOME' },
  { key: 'sigla',       label: 'SIGLA' },
  { key: 'centro_campi', label: 'CENTRO/CAMPI' },
  { key: 'responsavel', label: 'RESPONSÁVEL', tipo: 'pessoas' },
  { key: 'email',       label: 'EMAIL' },
]



function fa(arr) { return arr.length > 0 ? arr : undefined }

function CardLabs({ valor, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="h-full bg-faixa text-white rounded-xl px-4 py-4 flex flex-col items-center justify-center text-center">
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">Laboratórios</p>
      <img src={iconLaboratorios} alt="" className="w-7 h-7 object-contain mt-2 opacity-90" />
      <p className="text-3xl font-bold mt-2">{valor ?? '—'}</p>
    </div>
  )
}

export default function Laboratorios() {
  const cores = useCoresGrafico()
  const corDe = useCorPorCategoria(cores)
  const [kpis,           setKpis]           = useState({})
  const [opcoes,         setOpcoes]         = useState({})
  const [dadosPorCentro, setDadosPorCentro] = useState([])
  const [labs,           setLabs]           = useState([])

  const [filtroNome,   setFiltroNome]   = useState([])
  const [filtroCentro, setFiltroCentro] = useState([])

  const [loadingKpis,    setLoadingKpis]    = useState(true)
  const [loadingGrafico, setLoadingGrafico] = useState(true)
  const [loadingTabela,  setLoadingTabela]  = useState(true)

  const refGrafico = useRef(null)

  const filtrosAtivos = {
    nome:         fa(filtroNome),
    centro_campi: fa(filtroCentro),
  }

  useEffect(() => {
    getKPIsLaboratorios().then(setKpis).catch(() => {}).finally(() => setLoadingKpis(false))
  }, [])

  useEffect(() => {
    getFiltrosLaboratorios(filtrosAtivos).then(setOpcoes).catch(() => {})
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  useEffect(() => {
    setLoadingGrafico(true)
    getLaboratoriosPorCentro(semChave(filtrosAtivos, 'centro_campi')).then(setDadosPorCentro).catch(() => {}).finally(() => setLoadingGrafico(false))
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  useEffect(() => {
    setLoadingTabela(true)
    getLaboratorios({ ...filtrosAtivos, limit: 9999 })
      .then((data) => setLabs(Array.isArray(data) ? data : (data.items ?? [])))
      .catch(() => {})
      .finally(() => setLoadingTabela(false))
  }, [filtroNome, filtroCentro]) // eslint-disable-line

  // "Em branco" é o rótulo do backend para centro vazio; não é um valor filtrável.
  const centroFiltravel = (v) => v !== 'Em branco'
  const alternarCentro = (v) => { if (centroFiltravel(v)) setFiltroCentro((atual) => alternarValor(atual, v)) }

  function limparFiltros() {
    setFiltroNome([])
    setFiltroCentro([])
  }

  const totalPie = dadosPorCentro.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Top: Card + Gráfico + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3 items-stretch" style={{ height: '280px' }}>

        {/* Card */}
        <div className="w-44 flex-shrink-0">
          <CardLabs valor={kpis.total_laboratorios} loading={loadingKpis} />
        </div>

        {/* Gráfico pizza */}
        <div className="flex-1 bg-superficie rounded-xl p-3 shadow-sm">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-texto mb-1">
              Nº de Laboratório x Centro/Campi
            </h3>
            <DicaFiltro />
            {loadingGrafico ? (
              <div className="h-40 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={215}>
                <PieChart>
                  <Pie
                    stroke={cores.superficie}
                    strokeWidth={2}
                    data={dadosPorCentro}
                    dataKey="total"
                    nameKey="centro"
                    className="cursor-pointer"
                    onClick={(d) => alternarCentro(valorDaFatia(d, 'centro'))}
                    cx="40%"
                    cy="50%"
                    outerRadius={60}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorCentro.map((item, i) => (
                      <Cell key={i} fill={centroFiltravel(item.centro) ? corDe(item.centro) : cores.outros} fillOpacity={opacidade(filtroCentro, item.centro)} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: cores.grade, fillOpacity: 0.6 }} content={<TooltipGrafico total={totalPie} />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle"
                    content={<LegendaClicavel vertical selecionados={filtroCentro} onAlternar={alternarCentro} podeFiltrar={centroFiltravel} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="laboratorios_por_centro" />
          </div>
        </div>

        {/* Filtros */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-superficie rounded-xl p-3 shadow-sm h-full space-y-2">
            <FiltroSelect label="Laboratório"  value={filtroNome}   onChange={setFiltroNome}   options={opcoesFiltro(opcoes.nomes)} />
            <FiltroSelect label="Centro/Campi" value={filtroCentro} onChange={setFiltroCentro} options={opcoesFiltro(opcoes.centros)} />
            <BotaoLimparFiltros onClick={limparFiltros} />
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 min-h-0 bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold text-texto">
            Informações dos Laboratórios
          </h3>
          <BotaoExportarCSV dados={labs} nomeArquivo="laboratorios" colunas={COLUNAS} />
        </div>
        <div className="flex-1 min-h-0">
          <TabelaPaginada colunas={COLUNAS} dados={labs} loading={loadingTabela} />
        </div>
      </div>
    </div>
  )
}
