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
  getKPIsGrupos:    vi.fn(),
  getFiltrosGrupos: vi.fn(),
  getGruposPorArea: vi.fn(),
  getGrupos:        vi.fn(),
}))

import {
  getKPIsGrupos, getFiltrosGrupos, getGruposPorArea, getGrupos,
} from '../../api/index.js'
import GruposPesquisa from '../../pages/GruposPesquisa'

const gruposMock = [
  {
    id: 1,
    nome_grupo:        'Grupo Beta',
    nome_lider:        'Prof. Oliveira',
    area_predominante: 'Ciências da Computação',
    ultimo_envio:      '2023',
    status:            'Ativo',
  },
]

function setup() {
  getKPIsGrupos.mockResolvedValue({ total_grupos: 75 })
  getFiltrosGrupos.mockResolvedValue({
    nomes:      ['Grupo Gamma'],
    areas:      ['Ciências da Computação', 'Engenharia'],
    anos_envio: [2021, 2022, 2023],
  })
  getGruposPorArea.mockResolvedValue([
    { area: 'Ciências da Computação', total: 20 },
  ])
  getGrupos.mockResolvedValue(gruposMock)
}

function renderPage() {
  return render(<MemoryRouter><GruposPesquisa /></MemoryRouter>)
}

describe('GruposPesquisa', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI total de grupos', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('75')).toBeInTheDocument())
  })

  it('exibe título "Grupos de Pesquisa" no card', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByText(/Grupos de Pesquisa/).length).toBeGreaterThan(0)
    )
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('NOME DO GRUPO')).toBeInTheDocument()
      expect(screen.getByText('NOME DO LÍDER')).toBeInTheDocument()
      expect(screen.getByText('ÁREA PREDOMINANTE')).toBeInTheDocument()
    })
  })

  it('exibe dados do grupo na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Grupo Beta')).toBeInTheDocument()
    )
  })

  it('exibe gráfico de barras por área', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    )
  })

  it('exibe título do gráfico', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Nº de Grupos por Área Predominante/)).toBeInTheDocument()
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
    getKPIsGrupos.mockRejectedValue(new Error('Erro'))
    getGruposPorArea.mockRejectedValue(new Error('Erro'))
    getGrupos.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
