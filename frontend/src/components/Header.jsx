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
    <header className="bg-superficie shadow-sm px-4 py-3 flex items-center gap-4">
      {/* Hamburguer — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-texto-suave text-xl leading-none"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Título da página */}
      <h1 className="flex-1 text-base font-semibold text-texto">
        {titulo}
      </h1>

      {/* Toggle dark mode — só desktop */}
      <button
        onClick={toggleTheme}
        className="hidden md:block text-texto-suave hover:text-texto transition-colors text-xl"
        aria-label="Alternar tema"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
