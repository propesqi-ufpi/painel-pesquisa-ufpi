import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart:    ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar:         () => null,
  XAxis:       () => null,
  YAxis:       () => null,
  CartesianGrid:() => null,
  Tooltip:     () => null,
  PieChart:    ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie:         () => null,
  Cell:        () => null,
  Legend:      () => null,
  LabelList:   () => null,
}))

vi.mock('../../api/index.js', () => ({
  getKPIsFinep:        vi.fn(),
  getFiltrosFinep:     vi.fn(),
  getRelacaoTipoFinep: vi.fn(),
  getPorCentroFinep:   vi.fn(),
}))

import {
  getKPIsFinep, getFiltrosFinep, getRelacaoTipoFinep, getPorCentroFinep,
} from '../../api/index.js'
import ProjetosFinep from '../../pages/ProjetosFinep'

function setup() {
  getKPIsFinep.mockResolvedValue({ valor_total_mi: 12.5, total_projetos: 8 })
  getFiltrosFinep.mockResolvedValue({
    anos_inicio: [2019], anos_termino: [2024],
    centros: ['CCA'], naturezas: ['Pesquisa'], situacoes: ['Aprovado'],
  })
  getRelacaoTipoFinep.mockResolvedValue([
    { tipo: 'Projeto Interno', total: 5 },
    { tipo: 'Projeto Externo', total: 3 },
  ])
  getPorCentroFinep.mockResolvedValue([
    { centro: 'CCA', valor_mi: 4.2 },
  ])
}

function renderPage() {
  return render(<MemoryRouter><ProjetosFinep /></MemoryRouter>)
}

describe('ProjetosFinep', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI de valor total', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/12,50 Mi/)).toBeInTheDocument()
    )
  })

  it('exibe KPI de total de projetos', async () => {
    renderPage()
    // O centro da rosca também mostra o total; o KPI é o <p> do cartão.
    await waitFor(() => expect(screen.getAllByText('8').some((el) => el.tagName === 'P')).toBe(true))
  })

  it('exibe gráfico de pizza (relação tipo)', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    )
  })

  it('exibe gráfico de barras (por centro)', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    )
  })

  it('botão Limpar Filtros está presente', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Limpar Filtros/)).toBeInTheDocument()
    )
  })

  it('exibe os títulos dos gráficos', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Relação: Internos x Externos/)).toBeInTheDocument()
      expect(screen.getByText(/Valor Total de Fomento/)).toBeInTheDocument()
    })
  })
})
