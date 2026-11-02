import { useSyncExternalStore } from 'react'

// O tema escuro é controlado pela classe "dark" em <html> (ThemeContext).
// Observar a classe diretamente evita acoplar os gráficos ao contexto e
// mantém as páginas testáveis sem ThemeProvider.
function subscribe(callback) {
  if (typeof MutationObserver === 'undefined') return () => {}
  const obs = new MutationObserver(callback)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

// No escuro, os azuis institucionais (#1E3A5F / #2E5F8A) quase somem sobre
// o fundo cinza-800; troca por tons mais claros da mesma família.
const CLAREADOS = {
  '#1E3A5F': '#9BC4E3',
  '#2E5F8A': '#7AB3E0',
  '#0D2B4A': '#6BA3CE',
  '#1A4F7A': '#A8D1F0',
}

export function useChartColors() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false)
  return {
    dark,
    primary: dark ? '#4A90D9' : '#1E3A5F',
    secondary: dark ? '#7AB3E0' : '#2E5F8A',
    axis: dark ? '#9CA3AF' : '#6B7280',
    grid: dark ? '#374151' : '#E5E7EB',
    paleta: (cores) => (dark ? cores.map((c) => CLAREADOS[c] ?? c) : cores),
  }
}
