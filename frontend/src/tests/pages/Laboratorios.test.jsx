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
  getKPIsLaboratorios:      vi.fn(),
  getFiltrosLaboratorios:   vi.fn(),
  getLaboratoriosPorCentro: vi.fn(),
  getLaboratorios:          vi.fn(),
}))

import {
  getKPIsLaboratorios, getFiltrosLaboratorios,
  getLaboratoriosPorCentro, getLaboratorios,
} from '../../api/index.js'
import Laboratorios from '../../pages/Laboratorios'

const labsMock = [
  {
    id: 1,
    nome:         'Laboratório de Computação',
    sigla:        'LABCC',
    centro_campi: 'CCEN',
    responsavel:  'Prof. Melo',
    email:        'labcc@ufpi.edu.br',
  },
]

function setup() {
  getKPIsLaboratorios.mockResolvedValue({ total_laboratorios: 70 })
  getFiltrosLaboratorios.mockResolvedValue({
    nomes:   ['Laboratório de Física'],
    centros: ['CCEN', 'CCA'],
  })
  getLaboratoriosPorCentro.mockResolvedValue([
    { centro: 'CCEN', total: 30 },
    { centro: 'CCA',  total: 20 },
  ])
  getLaboratorios.mockResolvedValue(labsMock)
}

function renderPage() {
  return render(<MemoryRouter><Laboratorios /></MemoryRouter>)
}

describe('Laboratorios', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI total de laboratórios', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('70')).toBeInTheDocument())
  })

  it('exibe título "Laboratórios" no card', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByText(/Laboratórios/).length).toBeGreaterThan(0)
    )
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('NOME')).toBeInTheDocument()
      expect(screen.getByText('SIGLA')).toBeInTheDocument()
      expect(screen.getByText('RESPONSÁVEL')).toBeInTheDocument()
    })
  })

  it('exibe dados do laboratório na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Laboratório de Computação')).toBeInTheDocument()
    )
  })

  it('exibe gráfico de barras horizontais (por centro)', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByText(/Nº de Laboratório x Centro\/Campi/)).toBeInTheDocument()
    })
  })

  it('exibe filtro de Laboratório', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Laboratório')).toBeInTheDocument()
    )
  })

  it('exibe filtro de Centro/Campi', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByText('Centro/Campi').length).toBeGreaterThan(0)
    )
  })

  it('exibe botão Limpar Filtros', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Limpar Filtros/)).toBeInTheDocument()
    )
  })

  it('exibe botão exportar CSV', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/CSV/)).toBeInTheDocument()
    )
  })

  it('não quebra quando API falha', async () => {
    getKPIsLaboratorios.mockRejectedValue(new Error('Erro'))
    getLaboratoriosPorCentro.mockRejectedValue(new Error('Erro'))
    getLaboratorios.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
