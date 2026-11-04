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
  getKPIsPosGraduacao:      vi.fn(),
  getFiltrosPosGraduacao:   vi.fn(),
  getPosGraduacaoPorCentro: vi.fn(),
  getPosGraduacao:          vi.fn(),
}))

import {
  getKPIsPosGraduacao, getFiltrosPosGraduacao,
  getPosGraduacaoPorCentro, getPosGraduacao,
} from '../../api/index.js'
import PosGraduacao from '../../pages/PosGraduacao'

const programasMock = [
  {
    id: 1,
    programa:       'Ciência da Computação',
    fone:           '(86) 3215-5000',
    email:          'ppgcc@ufpi.edu.br',
    centro:         'CCEN',
    nivel:          'Doutorado',
    modalidade:     'Presencial',
    tipo:           'Acadêmico',
    conceito_capes: '5',
  },
]

function setup() {
  getKPIsPosGraduacao.mockResolvedValue({ total_pos_graduacao: 50 })
  getFiltrosPosGraduacao.mockResolvedValue({
    programas:       ['Engenharia Elétrica'],
    conceitos_capes: ['3', '4', '5', '6', '7'],
    centros:         ['CCEN', 'CCA'],
    niveis:          ['Mestrado', 'Doutorado'],
    tipos:           ['Acadêmico', 'Profissional'],
  })
  getPosGraduacaoPorCentro.mockResolvedValue([
    { centro: 'CCEN', total: 12 },
    { centro: 'CCA',  total: 8 },
  ])
  getPosGraduacao.mockResolvedValue(programasMock)
}

function renderPage() {
  return render(<MemoryRouter><PosGraduacao /></MemoryRouter>)
}

describe('PosGraduacao', () => {
  beforeEach(() => { vi.clearAllMocks(); setup() })

  it('renderiza sem quebrar', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('exibe KPI total de pós-graduação', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('50')).toBeInTheDocument())
  })

  it('exibe título "Pós-Graduação" no card', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getAllByText(/Pós-Graduação/).length).toBeGreaterThan(0)
    )
  })

  it('exibe cabeçalhos da tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('PROGRAMA')).toBeInTheDocument()
      expect(screen.getByText('NÍVEL')).toBeInTheDocument()
      expect(screen.getByText('CONCEITO CAPES')).toBeInTheDocument()
    })
  })

  it('exibe dados do programa na tabela', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Ciência da Computação')).toBeInTheDocument()
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
      expect(screen.getByText(/Nº de Pós-graduação x Centro/)).toBeInTheDocument()
    )
  })

  it('exibe filtro de Programa', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Programa')).toBeInTheDocument()
    )
  })

  it('exibe filtro de Nível', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nível')).toBeInTheDocument()
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
    getKPIsPosGraduacao.mockRejectedValue(new Error('Erro'))
    getPosGraduacaoPorCentro.mockRejectedValue(new Error('Erro'))
    getPosGraduacao.mockRejectedValue(new Error('Erro'))
    expect(() => renderPage()).not.toThrow()
  })
})
