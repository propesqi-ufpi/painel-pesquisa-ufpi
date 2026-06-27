import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart:     ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar:          () => null,
  XAxis:        () => null,
  YAxis:        () => null,
  CartesianGrid:() => null,
  Tooltip:      () => null,
}))

vi.mock('../../api/index.js', () => ({
  getKPIsProjetosPDI: vi.fn(),
  getFiltrosPDI:      vi.fn(),
  getPorAreaPDI:      vi.fn(),
  getPorCentroPDI:    vi.fn(),
  getProjetosPDI:     vi.fn(),
}))

import {
  getKPIsProjetosPDI, getFiltrosPDI,
  getPorAreaPDI, getPorCentroPDI, getProjetosPDI,
} from '../../api/index.js'
import ProjetosPDI from '../../pages/ProjetosPDI'

const kpisMock    = { total_concluidos: 80, total_em_andamento: 40 }
const filtrosMock = {
  anos_inicio: [2020, 2021],
  anos_termino: [2022, 2023],
  centros:    ['CCA', 'CCE'],
  naturezas:  ['Pesquisa'],
  areas:      ['Ciências Exatas'],
  situacoes:  ['Concluído', 'Em andamento'],
}
const projetosMock = [
  { id: 1, titulo: 'Projeto Alpha', centro: 'CCA', coordenador: 'Prof. João',
    natureza: 'Pesquisa', situacao: 'Concluído', area: 'Ciências Exatas' },
]

function setup() {
  getKPIsProjetosPDI.mockResolvedValue(kpisMock)
  getFiltrosPDI.mockResolvedValue(filtrosMock)
  getPorAreaPDI.mockResolvedValue([{ area: 'Ciências Exatas', total: 30 }])
  getPorCentroPDI.mockResolvedValue([{ centro: 'CCA', total: 20 }])
  getProjetosPDI.mockResolvedValue(projetosMock)
}

function renderPage() {
  return render(<MemoryRouter><ProjetosPDI /></MemoryRouter>)
}

describe('ProjetosPDI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setup()
  })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPIs de concluídos e em andamento', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('40')).toBeInTheDocument()
    })
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('PROJETOS')).toBeInTheDocument()
      expect(screen.getByText('CENTRO')).toBeInTheDocument()
      expect(screen.getByText('COORDENADORES')).toBeInTheDocument()
    })
  })

  it('exibe dados do projeto na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Projeto Alpha')).toBeInTheDocument()
    )
  })

  it('filtros de situação são carregados', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Situação')).toBeInTheDocument()
    })
  })

  it('botão Limpar Filtros está presente', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Limpar Filtros/)).toBeInTheDocument()
    )
  })

  it('clicar em Limpar Filtros não gera erro', async () => {
    renderPage()
    await waitFor(() => screen.getByText(/Limpar Filtros/))
    expect(() => fireEvent.click(screen.getByText(/Limpar Filtros/))).not.toThrow()
  })

  it('gráficos são renderizados', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0)
    )
  })

  it('botão exportar CSV está presente', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/CSV/)).toBeInTheDocument()
    )
  })
})
