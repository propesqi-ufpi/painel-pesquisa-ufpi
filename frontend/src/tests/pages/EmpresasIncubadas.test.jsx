import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart:  ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie:       () => null,
  Cell:      () => null,
  Legend:    () => null,
  Tooltip:   () => null,
}))

vi.mock('../../api/index.js', () => ({
  getKPIsIncubadas:          vi.fn(),
  getFiltrosIncubadas:       vi.fn(),
  getIncubadasPorIncubadora: vi.fn(),
  getIncubadas:              vi.fn(),
}))

import {
  getKPIsIncubadas, getFiltrosIncubadas, getIncubadasPorIncubadora, getIncubadas,
} from '../../api/index.js'
import EmpresasIncubadas from '../../pages/EmpresasIncubadas'

const incubadasMock = [
  {
    id: 1,
    nome_projeto:   'TechStart',
    objetivo:       'Desenvolver soluções em TI',
    equipe_projeto: 'João, Maria',
    contato:        'contato@techstart.com',
    incubadora:     'INBATE',
  },
]

function setup() {
  getKPIsIncubadas.mockResolvedValue({
    total_incubadas: 25, total_graduadas: 10, total_incubadoras: 3,
  })
  getFiltrosIncubadas.mockResolvedValue({
    incubadoras: ['INBATE', 'ITEC'],
    situacoes:   ['Incubada', 'Graduada'],
  })
  getIncubadasPorIncubadora.mockResolvedValue([
    { incubadora: 'INBATE', total: 15 },
    { incubadora: 'ITEC',   total: 10 },
  ])
  getIncubadas.mockResolvedValue(incubadasMock)
}

function renderPage() {
  return render(<MemoryRouter><EmpresasIncubadas /></MemoryRouter>)
}

describe('EmpresasIncubadas', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI de empresas incubadas', async () => {
    renderPage()
    // O centro da rosca também mostra o total; o KPI é o <p> do cartão.
    await waitFor(() => expect(screen.getAllByText('25').some((el) => el.tagName === 'P')).toBe(true))
  })

  it('exibe KPI de empresas graduadas', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
  })

  it('exibe KPI de incubadoras', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
  })

  it('exibe título "Empresas Incubadas" no card', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByText(/Empresas Incubadas/).length).toBeGreaterThan(0)
    )
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('NOME DO PROJETO')).toBeInTheDocument()
      expect(screen.getByText('INCUBADORA')).toBeInTheDocument()
      expect(screen.getByText('CONTATO')).toBeInTheDocument()
    })
  })

  it('exibe dados da empresa incubada na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('TechStart')).toBeInTheDocument()
    )
  })

  it('exibe gráfico de pizza (por incubadora)', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByText(/Número de Empresas Incubadas por Incubadora/)).toBeInTheDocument()
    })
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
    getKPIsIncubadas.mockRejectedValue(new Error('Erro'))
    getIncubadasPorIncubadora.mockRejectedValue(new Error('Erro'))
    getIncubadas.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
