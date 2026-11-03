import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Brasao } from './Marca'

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
    <header className="bg-superficie shadow-sm px-4 py-3 flex items-center gap-3">
      {/* Hamburguer — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-11 h-11 -ml-2 flex items-center justify-center text-texto-suave hover:text-texto rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-azul"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* No mobile a sidebar some; o brasão fica no cabeçalho. */}
      <Brasao tamanho="sm" className="md:hidden" />

      {/* Título da página */}
      <h1 className="flex-1 min-w-0 truncate text-base font-semibold text-texto">
        {titulo}
      </h1>
    </header>
  )
}
