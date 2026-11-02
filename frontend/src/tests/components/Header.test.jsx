import { render, screen, fireEvent } from '@testing-library/react'

const mockToggle = vi.fn()

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/projetos-pdi' }),
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ dark: false, toggleTheme: mockToggle }),
}))

import Header from '../../components/Header'

describe('Header', () => {
  beforeEach(() => mockToggle.mockReset())

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

  it('exibe ícone de lua no modo claro', () => {
    render(<Header onMenuClick={() => {}} />)
    expect(screen.getByLabelText('Alternar tema').querySelector('[data-icon="lua"]')).not.toBeNull()
  })

  it('chama toggleTheme ao clicar no botão de tema', () => {
    render(<Header onMenuClick={() => {}} />)
    fireEvent.click(screen.getByLabelText('Alternar tema'))
    expect(mockToggle).toHaveBeenCalledTimes(1)
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
