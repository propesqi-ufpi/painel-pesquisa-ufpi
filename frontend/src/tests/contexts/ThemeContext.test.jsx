import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../context/ThemeContext'

function Probe() {
  const { dark, toggleTheme, tema, setTema } = useTheme()
  return (
    <div>
      <span data-testid="modo">{dark ? 'escuro' : 'claro'}</span>
      <span data-testid="tema">{tema}</span>
      <button onClick={toggleTheme}>toggle</button>
      <button onClick={() => setTema('system')}>sistema</button>
    </div>
  )
}

// Simula o sistema operacional pedindo tema escuro ou claro.
function simularSistema(escuro) {
  const ouvintes = new Set()
  const mq = {
    matches: escuro,
    addEventListener: (_, f) => ouvintes.add(f),
    removeEventListener: (_, f) => ouvintes.delete(f),
  }
  window.matchMedia = vi.fn(() => mq)
  return (novo) => { mq.matches = novo; ouvintes.forEach((f) => f({ matches: novo })) }
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('inicia em modo claro quando localStorage não tem tema', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('modo').textContent).toBe('claro')
  })

  it('inicia em modo escuro quando localStorage contém "dark"', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('modo').textContent).toBe('escuro')
  })

  it('toggle muda de claro para escuro', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('modo').textContent).toBe('escuro')
  })

  it('toggle adiciona classe "dark" no documentElement', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle persiste tema "dark" no localStorage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggle duplo retorna ao modo claro', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('modo').textContent).toBe('claro')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle duplo remove classe "dark" do documentElement', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    act(() => { screen.getByText('toggle').click() })
    act(() => { screen.getByText('toggle').click() })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('useTheme lança erro fora do provider', () => {
    function Fora() {
      useTheme()
      return null
    }
    expect(() => render(<Fora />)).toThrow()
  })

  describe('tema do sistema', () => {
    afterEach(() => { delete window.matchMedia })

    it('sem escolha salva, segue o sistema', () => {
      simularSistema(true)
      render(<ThemeProvider><Probe /></ThemeProvider>)
      expect(screen.getByTestId('tema').textContent).toBe('system')
      expect(screen.getByTestId('modo').textContent).toBe('escuro')
    })

    it('acompanha a mudança do sistema enquanto está em "sistema"', () => {
      const mudar = simularSistema(false)
      render(<ThemeProvider><Probe /></ThemeProvider>)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      act(() => mudar(true))
      expect(screen.getByTestId('modo').textContent).toBe('escuro')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('escolha explícita ignora o sistema, e "sistema" volta a segui-lo', () => {
      simularSistema(true)
      localStorage.setItem('theme', 'light')
      render(<ThemeProvider><Probe /></ThemeProvider>)
      expect(screen.getByTestId('modo').textContent).toBe('claro')
      act(() => { screen.getByText('sistema').click() })
      expect(screen.getByTestId('modo').textContent).toBe('escuro')
      expect(localStorage.getItem('theme')).toBe('system')
    })
  })
})
