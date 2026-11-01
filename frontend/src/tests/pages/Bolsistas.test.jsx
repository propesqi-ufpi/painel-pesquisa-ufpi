import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart:  ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie:       () => null,
  Cell:      () => null,
  Legend:    () => null,
  Tooltip:   () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LabelList: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

vi.mock('../../api/index.js', () => ({
  getKPIsBolsistas:      vi.fn(),
  getFiltrosBolsistas:   vi.fn(),
  getBolsistasPorCampus: vi.fn(),
}))

import {
  getKPIsBolsistas, getFiltrosBolsistas, getBolsistasPorCampus,
} from '../../api/index.js'
import Bolsistas from '../../pages/Bolsistas'

function setup() {
  getKPIsBolsistas.mockResolvedValue({ total_cnpq: 120, total_ufpi: 80 })
  getFiltrosBolsistas.mockResolvedValue({
    modalidades: ['PQ', 'PV'],
    orgaos:      ['CAPES', 'FAPEPI'],
    campi:       ['Teresina', 'Picos'],
    nomes:       ['Dr. Silva', 'Dr. Costa'],
  })
  getBolsistasPorCampus.mockResolvedValue([
    { campus: 'Teresina', total: 90 },
    { campus: 'Picos',    total: 30 },
  ])
}

function renderPage() {
  return render(<MemoryRouter><Bolsistas /></MemoryRouter>)
}

describe('Bolsistas', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI CNPq', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('120')).toBeInTheDocument())
  })

  it('exibe KPI UFPI', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('80')).toBeInTheDocument())
  })

  it('exibe título "CNPq" no card', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('CNPq')).toBeInTheDocument())
  })

  it('exibe título "UFPI" no card', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('UFPI')).toBeInTheDocument())
  })

  it('exibe filtro de Modalidade', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Modalidade')).toBeInTheDocument()
    )
  })

  it('exibe filtro de Órgão', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Órgão')).toBeInTheDocument()
    )
  })

  it('exibe botão Limpar Filtros', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Limpar Filtros/)).toBeInTheDocument()
    )
  })

  it('exibe gráfico de barras horizontais com título correto', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByText(/Bolsistas por Campus\/Centro/)).toBeInTheDocument()
    })
  })

  it('não quebra quando API falha', async () => {
    getKPIsBolsistas.mockRejectedValue(new Error('Erro'))
    getBolsistasPorCampus.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
