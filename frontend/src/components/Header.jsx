import { useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const titulos = {
  '/':                     'Geral',
  '/projetos-pdi':         'Projetos PD&I',
  '/projetos-finep':       'Projetos FINEP',
  '/producao-intelectual': 'Produção Intelectual',
  '/bolsistas':            'Bolsistas',
  '/nucleos':              'Núcleos de Pesquisa',
  '/grupos':               'Grupos de Pesquisa',
  '/incubadas':            'Empresas Incubadas',
  '/pos-graduacao':        'Pós-Graduação',
  '/laboratorios':         'Laboratórios',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { dark, toggleTheme } = useTheme()
  const titulo = titulos[pathname] ?? ''

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm px-2 md:px-4 py-2 flex items-center gap-2 md:gap-4">
      {/* Hamburguer — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300"
        aria-label="Abrir menu"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>

      {/* Título da página */}
      <h1 className="flex-1 min-w-0 truncate text-base font-semibold text-gray-800 dark:text-white pl-2 md:pl-0">
        {titulo}
      </h1>

      {/* Alternar tema — visível também no mobile */}
      <button
        onClick={toggleTheme}
        className="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        aria-label="Alternar tema"
      >
        {dark ? <svg data-icon="sol" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></svg> : <svg data-icon="lua" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
      </button>
    </header>
  )
}
