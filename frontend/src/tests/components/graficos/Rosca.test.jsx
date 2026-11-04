import { render, screen, fireEvent } from '@testing-library/react'
import Rosca from '../../../components/graficos/Rosca'

vi.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie:      ({ children }) => <div data-testid="pie">{children}</div>,
  Cell:     ({ fill }) => <span data-testid="fatia" data-fill={fill} />,
  Tooltip:  () => null,
}))

const dados = [
  { tipo: 'Cooperação', total: 12 },
  { tipo: 'Pesquisa',   total: 36 },
]
const corDe = (c) => (c === 'Pesquisa' ? '#111111' : '#222222')

describe('Rosca', () => {
  it('mostra o total no centro com o rótulo', () => {
    render(<Rosca dados={dados} categoria="tipo" corDe={corDe} rotuloTotal="projetos" />)
    expect(screen.getByText('48')).toBeInTheDocument()
    expect(screen.getByText('projetos')).toBeInTheDocument()
  })

  it('legenda em ordem decrescente com valor e percentual em pt-BR', () => {
    render(<Rosca dados={dados} categoria="tipo" corDe={corDe} onAlternar={vi.fn()} />)
    const botoes = screen.getAllByRole('button')
    expect(botoes[0]).toHaveTextContent('Pesquisa')
    expect(botoes[0]).toHaveTextContent('36 · 75%')
    expect(botoes[1]).toHaveTextContent('12 · 25%')
  })

  it('fatias seguem a cor da categoria', () => {
    render(<Rosca dados={dados} categoria="tipo" corDe={corDe} />)
    const fatias = screen.getAllByTestId('fatia').map((f) => f.dataset.fill)
    expect(fatias).toEqual(['#111111', '#222222'])
  })

  it('item da legenda alterna o filtro', () => {
    const onAlternar = vi.fn()
    render(<Rosca dados={dados} categoria="tipo" corDe={corDe} onAlternar={onAlternar} />)
    fireEvent.click(screen.getByRole('button', { name: /Cooperação/ }))
    expect(onAlternar).toHaveBeenCalledWith('Cooperação')
  })

  it('aviso quando não há dados', () => {
    render(<Rosca dados={[]} categoria="tipo" corDe={corDe} />)
    expect(screen.getByText('Sem dados para os filtros escolhidos.')).toBeInTheDocument()
  })
})
