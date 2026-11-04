import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Atom, FlaskConical, GraduationCap, IdCard, Landmark, LayoutDashboard,
  Lightbulb, LogOut, Microscope, PanelLeftClose, PanelLeftOpen, Rocket, Users,
} from 'lucide-react'
import SeletorTema from './SeletorTema'
import Marca from './Marca'
import DicaLateral from './DicaLateral'

const grupos = [
  {
    titulo: 'Visão geral',
    links: [
      { to: '/', label: 'Geral', Icone: LayoutDashboard, end: true },
    ],
  },
  {
    titulo: 'Pesquisa',
    links: [
      { to: '/projetos-pdi',  label: 'Projetos PD&I',       Icone: FlaskConical },
      { to: '/grupos',        label: 'Grupos de Pesquisa',  Icone: Users },
      { to: '/nucleos',       label: 'Núcleos de Pesquisa', Icone: Atom },
      { to: '/laboratorios',  label: 'Laboratórios',        Icone: Microscope },
    ],
  },
  {
    titulo: 'Inovação',
    links: [
      { to: '/projetos-finep',       label: 'Projetos FINEP',       Icone: Landmark },
      { to: '/producao-intelectual', label: 'Produção Intelectual', Icone: Lightbulb },
      { to: '/incubadas',            label: 'Empresas Incubadas',   Icone: Rocket },
    ],
  },
  {
    titulo: 'Formação',
    links: [
      { to: '/bolsistas',     label: 'Bolsistas',     Icone: IdCard },
      { to: '/pos-graduacao', label: 'Pós-Graduação', Icone: GraduationCap },
    ],
  },
]

// Classes que só valem a partir do desktop quando recolhida; no mobile a gaveta
// aparece sempre aberta.
const R = {
  largura:  'md:w-[4.5rem]',
  rotulo:   'md:sr-only',
  item:     'md:justify-center md:px-0',
  titulo:   'md:sr-only',
  divisor:  'md:block',
  rodape:   'md:px-2 md:items-center',
}
const se = (cond, classe) => (cond ? classe : '')

const linkClass = (recolhida) => ({ isActive }) =>
  [
    'group flex items-center gap-3 mx-2 px-3 py-2.5 min-h-[44px] rounded-md text-sm transition-colors',
    'border-l-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro',
    se(recolhida, R.item),
    isActive
      ? 'bg-white/10 text-white border-ouro font-medium'
      : 'text-white/75 border-transparent hover:bg-white/10 hover:text-white',
  ].join(' ')

export default function Sidebar({ isOpen, onClose, recolhida = false, onAlternarRecolhida }) {
  const { sair } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    sair()
    navigate('/login')
  }

  // Dica lateral só com a sidebar recolhida (DicaLateral ignora o mobile).
  const dicas = recolhida

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
        aria-label="Menu principal"
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-faixa flex flex-col',
          'transition-[transform,width] duration-300 ease-in-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0 md:z-auto',
          se(recolhida, R.largura),
        ].join(' ')}
      >
        {/* Marca, com filete ouro como na faixa institucional */}
        <div className={`px-4 py-4 border-b-[3px] border-ouro ${se(recolhida, 'md:px-0 md:flex md:justify-center')}`}>
          <Marca compacta={recolhida} />
        </div>

        {/* Navegação */}
        <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {grupos.map(({ titulo, links }, gi) => (
            <div key={titulo} role="group" aria-labelledby={`grupo-nav-${gi}`} className={gi ? 'mt-3' : ''}>
              <span
                id={`grupo-nav-${gi}`}
                className={`block px-5 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55 ${se(recolhida, R.titulo)}`}
              >
                {titulo}
              </span>
              {recolhida && gi > 0 && (
                <hr aria-hidden="true" className={`hidden mx-4 mb-2 border-white/15 ${R.divisor}`} />
              )}
              <ul className="flex flex-col gap-0.5">
                {links.map(({ to, label, Icone, end }) => (
                  <li key={to}>
                    <DicaLateral texto={label} ativa={dicas}>
                      <NavLink
                        to={to}
                        end={end}
                        className={linkClass(recolhida)}
                        onClick={onClose}
                      >
                        <Icone className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <span className={`truncate ${se(recolhida, R.rotulo)}`}>{label}</span>
                      </NavLink>
                    </DicaLateral>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Rodapé */}
        <div className={`border-t border-white/10 px-4 py-3 flex flex-col gap-1.5 ${se(recolhida, R.rodape)}`}>
          {/* Recolhida: tema em coluna, só ícones. Aberta (ou mobile): com rótulos. */}
          {recolhida ? (
            <>
              <SeletorTema variante="faixa" vertical className="hidden md:inline-flex" />
              <SeletorTema variante="faixa" comRotulo className="w-full md:hidden" />
            </>
          ) : (
            <SeletorTema variante="faixa" comRotulo className="w-full" />
          )}

          <DicaLateral texto="Sair" ativa={dicas}>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex items-center gap-3 min-h-[44px] text-white/75 hover:text-white text-sm px-2 py-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro ${se(recolhida, R.item)}`}
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className={se(recolhida, R.rotulo)}>Sair</span>
            </button>
          </DicaLateral>

          {onAlternarRecolhida && (
            <DicaLateral texto="Expandir menu" ativa={dicas}>
              <button
                type="button"
                onClick={onAlternarRecolhida}
                aria-expanded={!recolhida}
                aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}
                className={`hidden md:flex items-center gap-3 min-h-[44px] text-white/75 hover:text-white text-sm px-2 py-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro ${se(recolhida, R.item)}`}
              >
                {recolhida
                  ? <PanelLeftOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                  : <PanelLeftClose className="w-4 h-4 shrink-0" aria-hidden="true" />}
                {!recolhida && <span>Recolher menu</span>}
              </button>
            </DicaLateral>
          )}
        </div>
      </aside>
    </>
  )
}
