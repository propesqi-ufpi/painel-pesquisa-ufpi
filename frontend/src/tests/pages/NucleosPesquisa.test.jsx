import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart:     ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar:          () => null,
  XAxis:        () => null,
  YAxis:        () => null,
  CartesianGrid:() => null,
  Tooltip:      () => null,
  Cell: () => null,
  LabelList: () => null,
}))

vi.mock('../../api/index.js', () => ({
  getKPIsNucleos:     vi.fn(),
  getFiltrosNucleos:  vi.fn(),
  getNucleosPorCentro:vi.fn(),
  getNucleos:         vi.fn(),
}))

import {
  getKPIsNucleos, getFiltrosNucleos, getNucleosPorCentro, getNucleos,
} from '../../api/index.js'
import NucleosPesquisa from '../../pages/NucleosPesquisa'

const nucleosMock = [
  {
    id: 1,
    denominacao:   'Núcleo Alpha',
    centro_campus: 'CCA',
    coordenador:   'Prof. Lima',
    ano_resolucao: 2018,
  },
]

function setup() {
  getKPIsNucleos.mockResolvedValue({
    total_nucleos: 40, total_ativos: 30, total_inativos: 10,
  })
  getFiltrosNucleos.mockResolvedValue({
    centros:      ['CCA', 'CCE'],
    vinculacoes:  ['Interno'],
    anos:         [2018, 2019],
    nucleos:      ['Núcleo Beta'],
  })
  getNucleosPorCentro.mockResolvedValue([{ centro: 'CCA', total: 15 }])
  getNucleos.mockResolvedValue(nucleosMock)
}

function renderPage() {
  return render(<MemoryRouter><NucleosPesquisa /></MemoryRouter>)
}

describe('NucleosPesquisa', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI total de núcleos', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('40')).toBeInTheDocument())
  })

  it('exibe KPI ativos', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('30')).toBeInTheDocument())
  })

  it('exibe KPI inativos', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('DENOMINAÇÃO')).toBeInTheDocument()
      expect(screen.getByText('CENTRO/CAMPUS')).toBeInTheDocument()
      expect(screen.getByText('COORDENADOR')).toBeInTheDocument()
    })
  })

  it('exibe dados do núcleo na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Núcleo Alpha')).toBeInTheDocument()
    )
  })

  it('exibe gráfico de barras (por centro)', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    )
  })

  it('exibe título do gráfico', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Nº de Núcleos x Centro\/Campi/)).toBeInTheDocument()
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
    getKPIsNucleos.mockRejectedValue(new Error('Erro'))
    getNucleosPorCentro.mockRejectedValue(new Error('Erro'))
    getNucleos.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
