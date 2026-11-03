import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

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
  const titulo = titulos[pathname] ?? ''

  return (
    <header className="bg-superficie shadow-sm px-4 py-3 flex items-center gap-4">
      {/* Hamburguer — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-texto-suave hover:text-texto rounded p-1 -m-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-azul"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Título da página */}
      <h1 className="flex-1 text-base font-semibold text-texto">
        {titulo}
      </h1>
    </header>
  )
}
