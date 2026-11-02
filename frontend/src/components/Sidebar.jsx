import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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
    'flex items-center gap-3 px-4 min-h-[44px] py-2.5 text-sm transition-colors border-l-[3px]',
    isActive
      ? 'bg-azul-medio text-white border-white'
      : 'text-white/70 border-transparent hover:bg-white/10',
  ].join(' ')

export default function Sidebar({ isOpen, onClose }) {
  const { sair } = useAuth()
  const { dark, toggleTheme } = useTheme()
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-azul-escuro flex flex-col',
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
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 min-h-[44px] text-white/70 hover:text-white text-sm px-2 py-2 rounded hover:bg-white/10 transition-colors"
          >
            <span>{dark ? <svg data-icon="sol" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></svg> : <svg data-icon="lua" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}</span>
            <span>{dark ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 min-h-[44px] text-white/70 hover:text-white text-sm px-2 py-2 rounded hover:bg-white/10 transition-colors"
          >
            <span><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg></span>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
