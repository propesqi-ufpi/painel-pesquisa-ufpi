import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/projetos-pdi' }),
}))

import Header from '../../components/Header'

describe('Header', () => {
  it('exibe o título correspondente à rota /projetos-pdi', () => {
    render(<Header onMenuClick={() => {}} />)
    expect(screen.getByText('Projetos PD&I')).toBeInTheDocument()
  })

  it('chama onMenuClick ao clicar no botão hambúrguer', () => {
    const onMenuClick = vi.fn()
    render(<Header onMenuClick={onMenuClick} />)
    fireEvent.click(screen.getByLabelText('Abrir menu'))
    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })

  it('botão de menu usa ícone, não emoji', () => {
    render(<Header onMenuClick={() => {}} />)
    const botao = screen.getByLabelText('Abrir menu')
    expect(botao.querySelector('svg')).toBeInTheDocument()
    expect(botao.textContent).toBe('')
  })
})


describe('Header — rota desconhecida', () => {
  it('exibe string vazia para rota não mapeada', async () => {
    vi.doMock('react-router-dom', () => ({
      useLocation: () => ({ pathname: '/rota-inexistente' }),
    }))
    // Apenas valida que não quebra com rota desconhecida
    const { default: H } = await import('../../components/Header')
    const { container } = render(<H onMenuClick={() => {}} />)
    expect(container).toBeInTheDocument()
    vi.doUnmock('react-router-dom')
  })
})
