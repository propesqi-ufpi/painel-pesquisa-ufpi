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
  getBolsistas:          vi.fn(),
}))

import {
  getKPIsBolsistas, getFiltrosBolsistas, getBolsistasPorCampus, getBolsistas,
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
  getBolsistas.mockResolvedValue([
    { id: 1, nome: 'Dr. Zacarias Lima', nivel: '1A', modalidade: 'PQ', orgao: 'CNPq', campus_centro: 'Teresina' },
    { id: 2, nome: 'Ana Souza',          nivel: null, modalidade: 'PV', orgao: 'UFPI', campus_centro: 'Picos' },
    { id: 3, nome: 'Profa. Dra. Márcia Reis', nivel: '2', modalidade: 'PQ', orgao: 'CNPq', campus_centro: 'Teresina' },
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
    await waitFor(() => expect(screen.getAllByText('CNPq').some((el) => el.tagName === 'P')).toBe(true))
  })

  it('exibe título "UFPI" no card', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText('UFPI').some((el) => el.tagName === 'P')).toBe(true))
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

  it('lista todos os bolsistas em ordem alfabética, sem títulos', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Zacarias Lima')).toBeInTheDocument())
    const linhas = screen.getAllByRole('row').slice(1).map((tr) => tr.cells[0].textContent)
    expect(linhas).toEqual(['Ana Souza', 'Márcia Reis', 'Zacarias Lima'])
    expect(screen.getByRole('columnheader', { name: /NOME/ })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('busca a lista sem filtros e com todos os registros', async () => {
    renderPage()
    await waitFor(() => expect(getBolsistas).toHaveBeenCalled())
    expect(getBolsistas).toHaveBeenCalledWith(expect.objectContaining({ limit: 9999, campus_centro: undefined }))
  })

  it('mostra aviso quando a lista vem vazia', async () => {
    getBolsistas.mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('Nenhum bolsista para os filtros escolhidos')).toBeInTheDocument())
  })

  it('não quebra quando API falha', async () => {
    getKPIsBolsistas.mockRejectedValue(new Error('Erro'))
    getBolsistasPorCampus.mockRejectedValue(new Error('Erro'))
    getBolsistas.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
