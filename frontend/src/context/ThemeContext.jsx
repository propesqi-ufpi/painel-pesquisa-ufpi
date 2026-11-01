import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

function initDark() {
  const saved = localStorage.getItem('theme')
  const dark = saved === 'dark'
  if (dark) document.documentElement.classList.add('dark')
  return dark
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(initDark)

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
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
