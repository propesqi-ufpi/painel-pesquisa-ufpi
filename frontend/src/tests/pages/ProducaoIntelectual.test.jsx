import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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
}))

vi.mock('../../api/index.js', () => ({
  getKPIsProducao:  vi.fn(),
  getTiposProducao: vi.fn(),
  getAnosProducao:  vi.fn(),
  getProducaoAnual: vi.fn(),
  getVitrine:       vi.fn(),
}))

import {
  getKPIsProducao, getTiposProducao, getAnosProducao,
  getProducaoAnual, getVitrine,
} from '../../api/index.js'
import ProducaoIntelectual from '../../pages/ProducaoIntelectual'

const vitrineMock = [
  { id: 1, pedido: 'BR102020001', ano: 2020, titulo: 'Invenção X',
    inventores: 'Dr. Silva', descricao: 'Descrição da invenção', tipo: 'PATENTE' },
]

function setup() {
  getKPIsProducao.mockResolvedValue({
    PATENTE: 50, SOFTWARE: 30, MARCA: 20, 'DESENHO INDUSTRIAL': 5,
  })
  getTiposProducao.mockResolvedValue(['PATENTE', 'SOFTWARE', 'MARCA', 'DESENHO INDUSTRIAL'])
  getAnosProducao.mockResolvedValue([2019, 2020, 2021])
  getProducaoAnual.mockResolvedValue([
    { id: 1, ano: 2021, tipo: 'PATENTE', depositadas: 10, concedidas: 5 },
  ])
  getVitrine.mockResolvedValue(vitrineMock)
}

function renderPage() {
  return render(<MemoryRouter><ProducaoIntelectual /></MemoryRouter>)
}

describe('ProducaoIntelectual', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI de patentes', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('50')).toBeInTheDocument())
  })

  it('exibe KPI de softwares', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('30')).toBeInTheDocument())
  })

  it('exibe KPI de marcas', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('20')).toBeInTheDocument())
  })

  it('exibe cabeçalhos da tabela Vitrine', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('PEDIDO')).toBeInTheDocument()
      expect(screen.getByText('TÍTULO')).toBeInTheDocument()
      expect(screen.getByText('INVENTORES')).toBeInTheDocument()
    })
  })

  it('exibe dados da vitrine na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Invenção X')).toBeInTheDocument()
    )
  })

  it('filtro de inventor (texto) está presente', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Buscar inventor/i)).toBeInTheDocument()
    )
  })

  it('gráfico de barras (patentes) está presente', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0)
    )
  })

  it('softwares por ano também é gráfico de barras (patentes e softwares)', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
    )
  })

  it('botão Limpar Filtros limpa o campo inventor', async () => {
    renderPage()
    await waitFor(() => screen.getByPlaceholderText(/Buscar inventor/i))
    const input = screen.getByPlaceholderText(/Buscar inventor/i)
    fireEvent.change(input, { target: { value: 'Silva' } })
    expect(input.value).toBe('Silva')
    fireEvent.click(screen.getByText(/Limpar Filtros/))
    expect(input.value).toBe('')
  })
})
