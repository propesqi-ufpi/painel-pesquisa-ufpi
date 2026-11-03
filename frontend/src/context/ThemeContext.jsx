import { createContext, useContext, useEffect, useState } from 'react'

/*
 * Tema em três estados: claro, escuro ou sistema (segue o sistema operacional).
 * A escolha fica no localStorage com as chaves antigas ('light' | 'dark') mais
 * 'system'. Sem escolha salva, segue o sistema.
 */

const ThemeContext = createContext(null)
const CHAVE = 'theme'
const TEMAS = ['light', 'dark', 'system']

const consultaEscuro = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

function lerTemaSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return TEMAS.includes(salvo) ? salvo : 'system'
  } catch {
    return 'system'
  }
}

function aplicar(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

export function ThemeProvider({ children }) {
  const [tema, setTemaEstado] = useState(lerTemaSalvo)
  const [sistemaEscuro, setSistemaEscuro] = useState(() => consultaEscuro()?.matches ?? false)
  const dark = tema === 'system' ? sistemaEscuro : tema === 'dark'

  // A classe é aplicada já no render para os gráficos lerem as cores certas
  // no mesmo ciclo (useCoresGrafico lê as variáveis CSS do documento).
  if (typeof document !== 'undefined') aplicar(dark)

  useEffect(() => {
    const mq = consultaEscuro()
    if (!mq?.addEventListener) return undefined
    const mudar = (e) => setSistemaEscuro(e.matches)
    mq.addEventListener('change', mudar)
    return () => mq.removeEventListener('change', mudar)
  }, [])

  function setTema(novo) {
    if (!TEMAS.includes(novo)) return
    try {
      localStorage.setItem(CHAVE, novo)
    } catch {
      // Sem storage (aba anônima com bloqueio): o tema vale só nesta sessão.
    }
    setTemaEstado(novo)
  }

  /** Alterna entre claro e escuro, a partir do que está na tela. */
  function toggleTheme() {
    setTema(dark ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ tema, setTema, dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}

/** Tema escuro ativo? Não exige o provider (fora dele, considera claro). */
export function useEhEscuro() {
  return useContext(ThemeContext)?.dark ?? false
}
