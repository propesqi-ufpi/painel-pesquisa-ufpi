import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const OPCOES = [
  { valor: 'light',  rotulo: 'Claro',   Icone: Sun },
  { valor: 'system', rotulo: 'Sistema', Icone: Monitor },
  { valor: 'dark',   rotulo: 'Escuro',  Icone: Moon },
]

const ESTILOS = {
  // Sobre a faixa azul (sidebar).
  faixa: {
    grupo: 'bg-white/10',
    ativo: 'bg-white text-faixa',
    inativo: 'text-white/70 hover:text-white hover:bg-white/10',
  },
  // Sobre a superfície (cabeçalho).
  superficie: {
    grupo: 'bg-superficie-2 border border-borda',
    ativo: 'bg-azul text-sobre-azul',
    inativo: 'text-texto-suave hover:text-texto hover:bg-azul-suave',
  },
}

/** Tema em três estados, como grupo de botões de rádio. */
export default function SeletorTema({ variante = 'superficie', comRotulo = false, vertical = false, className = '' }) {
  const { tema, setTema } = useTheme()
  const estilo = ESTILOS[variante]

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      aria-orientation={vertical ? 'vertical' : undefined}
      className={`inline-flex rounded-lg p-0.5 gap-0.5 ${vertical ? 'flex-col' : ''} ${estilo.grupo} ${className}`}
    >
      {OPCOES.map(({ valor, rotulo, Icone }) => {
        const ativo = tema === valor
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={`Tema ${rotulo.toLowerCase()}`}
            title={`Tema ${rotulo.toLowerCase()}`}
            onClick={() => setTema(valor)}
            className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro ${comRotulo ? 'flex-1' : ''} ${ativo ? estilo.ativo : estilo.inativo}`}
          >
            <Icone className="w-4 h-4" aria-hidden="true" />
            {comRotulo && <span>{rotulo}</span>}
          </button>
        )
      })}
    </div>
  )
}
