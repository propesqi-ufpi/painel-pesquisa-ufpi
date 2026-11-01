import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
import SeletorTema from './SeletorTema'
import {
  iconProjetos, iconFomento, iconBolsistas, iconNucleos,
  iconGrupos, iconIncubadas, iconPosGraduacao, iconLaboratorios,
  iconPatentes,
} from '../assets/icons.js'

const links = [
  { to: '/',                     label: 'Geral',                icone: null,               end: true },
  { to: '/projetos-pdi',         label: 'Projetos PD&I',        icone: iconProjetos },
  { to: '/projetos-finep',       label: 'Projetos FINEP',       icone: iconFomento },
  { to: '/producao-intelectual', label: 'Produção Intelectual', icone: iconPatentes },
  { to: '/bolsistas',            label: 'Bolsistas',            icone: iconBolsistas },
  { to: '/nucleos',              label: 'Núcleos de Pesquisa',  icone: iconNucleos },
  { to: '/grupos',               label: 'Grupos de Pesquisa',   icone: iconGrupos },
  { to: '/incubadas',            label: 'Empresas Incubadas',   icone: iconIncubadas },
  { to: '/pos-graduacao',        label: 'Pós-Graduação',        icone: iconPosGraduacao },
  { to: '/laboratorios',         label: 'Laboratórios',         icone: iconLaboratorios },
]

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-[3px]',
    isActive
      ? 'bg-white/10 text-white border-ouro font-medium'
      : 'text-white/70 border-transparent hover:bg-white/10',
  ].join(' ')

export default function Sidebar({ isOpen, onClose }) {
  const { sair } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    sair()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-faixa flex flex-col',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0 md:z-auto',
        ].join(' ')}
      >
        {/* Topo */}
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-white text-lg font-bold tracking-tight">
            Painel UFPI
          </span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-2">
          {links.map(({ to, label, icone, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={onClose}
            >
              {icone
                ? <img src={icone} alt="" className="w-5 h-5 object-contain shrink-0" />
                : <span className="w-5 h-5 shrink-0" />
              }
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          <SeletorTema variante="faixa" comRotulo className="w-full" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-white/70 hover:text-white text-sm px-2 py-2 rounded hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
