import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

const mockSair = vi.fn()
const mockSetTema = vi.fn()

vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  // eslint-disable-next-line no-unused-vars
  NavLink: ({ to, children, className, end, ...resto }) => <a href={to} {...resto}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ sair: mockSair, token: 'fake-token' }),
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ tema: 'system', setTema: mockSetTema, dark: false, toggleTheme: vi.fn() }),
}))

function renderSidebar(isOpen = true, props = {}) {
  return render(
    <MemoryRouter>
      <Sidebar isOpen={isOpen} onClose={vi.fn()} {...props} />
    </MemoryRouter>
  )
}

const matchMediaOriginal = window.matchMedia
function simularLargura(desktop) {
  window.matchMedia = vi.fn((q) => ({
    matches: q.includes('min-width') ? desktop : !desktop,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('Sidebar', () => {
  beforeEach(() => mockSair.mockReset())
  afterEach(() => { window.matchMedia = matchMediaOriginal })

  it('renderiza 10 links de navegação', () => {
    renderSidebar()
    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('botão logout está presente', () => {
    renderSidebar()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('labels dos links estão corretos', () => {
    renderSidebar()
    expect(screen.getByText('Geral')).toBeInTheDocument()
    expect(screen.getByText('Laboratórios')).toBeInTheDocument()
  })

  it('chama sair ao clicar em logout', () => {
    renderSidebar()
    fireEvent.click(screen.getByText('Sair'))
    expect(mockSair).toHaveBeenCalledTimes(1)
  })

  it('seletor de tema tem claro, sistema e escuro, com o atual marcado', () => {
    renderSidebar()
    const opcoes = screen.getAllByRole('radio')
    expect(opcoes.map((o) => o.getAttribute('aria-label'))).toEqual(['Tema claro', 'Tema sistema', 'Tema escuro'])
    expect(screen.getByRole('radio', { name: 'Tema sistema' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: 'Tema escuro' }))
    expect(mockSetTema).toHaveBeenCalledWith('dark')
  })

  it('mostra o brasão e a marca UFPI · PROPESQI no topo', () => {
    renderSidebar()
    expect(screen.getByAltText('Brasão da Universidade Federal do Piauí')).toBeInTheDocument()
    expect(screen.getByText('UFPI · PROPESQI')).toBeInTheDocument()
  })

  it('agrupa os links em Visão geral, Pesquisa, Inovação e Formação', () => {
    renderSidebar()
    const grupos = screen.getAllByRole('group')
    expect(grupos.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')).textContent))
      .toEqual(['Visão geral', 'Pesquisa', 'Inovação', 'Formação'])
    const inovacao = screen.getByRole('group', { name: 'Inovação' })
    expect(within(inovacao).getAllByRole('link').map((l) => l.textContent))
      .toEqual(['Projetos FINEP', 'Produção Intelectual', 'Empresas Incubadas'])
  })

  it('links usam ícones SVG, não imagens PNG', () => {
    renderSidebar()
    const link = screen.getByRole('link', { name: 'Laboratórios' })
    expect(link.querySelector('svg')).toBeInTheDocument()
    expect(link.querySelector('img')).toBeNull()
  })

  it('botão de recolher alterna e informa o estado', () => {
    const alternar = vi.fn()
    const { rerender } = renderSidebar(true, { recolhida: false, onAlternarRecolhida: alternar })
    const botao = screen.getByRole('button', { name: 'Recolher menu' })
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(botao)
    expect(alternar).toHaveBeenCalledTimes(1)
    rerender(<Sidebar isOpen onClose={vi.fn()} recolhida onAlternarRecolhida={alternar} />)
    expect(screen.getByRole('button', { name: 'Expandir menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('recolhida, os nomes continuam acessíveis e a dica aparece no hover do desktop', () => {
    simularLargura(true)
    renderSidebar(false, { recolhida: true, onAlternarRecolhida: vi.fn() })
    const link = screen.getByRole('link', { name: 'Bolsistas' })
    expect(screen.queryByTestId('dica-lateral')).toBeNull()
    fireEvent.mouseEnter(link)
    expect(screen.getByTestId('dica-lateral')).toHaveTextContent('Bolsistas')
    fireEvent.mouseLeave(link)
    expect(screen.queryByTestId('dica-lateral')).toBeNull()
    fireEvent.focus(link)
    expect(screen.getByTestId('dica-lateral')).toHaveTextContent('Bolsistas')
  })

  it('no mobile não mostra dica, a gaveta abre com os nomes', () => {
    simularLargura(false)
    renderSidebar(true, { recolhida: true })
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Bolsistas' }))
    expect(screen.queryByTestId('dica-lateral')).toBeNull()
  })

  it('aberta, não mostra dica', () => {
    simularLargura(true)
    renderSidebar(true, { recolhida: false })
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Bolsistas' }))
    expect(screen.queryByTestId('dica-lateral')).toBeNull()
  })
})
