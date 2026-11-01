import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  getKPIsIncubadas, getFiltrosIncubadas,
  getIncubadasPorIncubadora, getIncubadas,
} from '../api/index.js'
import CardMetrica from '../components/CardMetrica'
import SkeletonCard from '../components/SkeletonCard'
import FiltroSelect from '../components/FiltroSelect'
import BotaoLimparFiltros from '../components/BotaoLimparFiltros'
import TabelaPaginada from '../components/TabelaPaginada'
import TooltipGrafico from '../components/TooltipGrafico'
import BotaoExportarCSV from '../components/BotaoExportarCSV'
import BotaoExportarPNG from '../components/BotaoExportarPNG'
import { iconIncubadas, iconGraduadas, iconInbate } from '../assets/icons.js'
import { opcoesFiltro } from '../utils/exibicao'
import { useCoresGrafico, useCorPorCategoria } from '../utils/coresGrafico'
import { alternarValor, semChave, opacidade } from '../utils/filtroCruzado'
import { valorDaFatia } from '../components/graficos/barraClicavel'
import LegendaClicavel from '../components/graficos/LegendaClicavel'
import DicaFiltro from '../components/graficos/DicaFiltro'

const COLUNAS = [
  { key: 'nome_projeto',   label: 'NOME DO PROJETO' },
  { key: 'objetivo',       label: 'OBJETIVO' },
  { key: 'equipe_projeto', label: 'EQUIPE DO PROJETO', tipo: 'pessoas' },
  { key: 'contato',        label: 'CONTATO' },
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

  const totalDonut = dadosPorIncubadora.reduce((s, d) => s + (d.total ?? 0), 0)

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Linha 1: Cards + Filtros ── */}
      <div className="flex-shrink-0 flex gap-3">

        <div className="grid grid-cols-3 gap-3 flex-1">
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

        <div className="w-56 flex-shrink-0">
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

      {/* ── Linha 2: Donut + Tabela ── */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">

        {/* Donut */}
        <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col">
          <div ref={refGrafico}>
            <h3 className="text-xs font-semibold text-center text-texto mb-2">
              Número de Empresas Incubadas por Incubadora
            </h3>
            <DicaFiltro />
            {loadingGrafico ? (
              <div className="h-48 flex items-center justify-center text-texto-suave text-xs">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    stroke={cores.superficie}
                    strokeWidth={2}
                    data={dadosPorIncubadora}
                    dataKey="total"
                    nameKey="incubadora"
                    className="cursor-pointer"
                    onClick={(d) => alternarIncubadora(valorDaFatia(d, 'incubadora'))}
                    cx="42%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={90}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(1).replace('.', ',')}%)`
                    }
                    labelLine
                  >
                    {dadosPorIncubadora.map((item, i) => (
                      <Cell key={i} fill={corDe(item.incubadora)} fillOpacity={opacidade(filtroIncubadora, item.incubadora)} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: cores.grade, fillOpacity: 0.6 }} content={<TooltipGrafico total={totalDonut} />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle"
                    content={<LegendaClicavel vertical selecionados={filtroIncubadora} onAlternar={alternarIncubadora} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <BotaoExportarPNG refGrafico={refGrafico} nomeArquivo="incubadas_por_incubadora" />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-superficie rounded-xl p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-xs font-semibold text-texto">
              Informações das Empresas
            </h3>
            <BotaoExportarCSV dados={incubadas} nomeArquivo="incubadas" colunas={COLUNAS} />
          </div>
          <div className="flex-1 min-h-0">
            <TabelaPaginada colunas={COLUNAS} dados={incubadas} loading={loadingTabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
