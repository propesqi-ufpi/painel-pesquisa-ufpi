import { X } from 'lucide-react'

export default function BotaoLimparFiltros({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="self-end inline-flex items-center gap-1 px-2 py-1 text-xs border border-azul text-azul rounded hover:bg-azul-suave transition-colors whitespace-nowrap"
    >
      <X className="w-3.5 h-3.5" aria-hidden="true" />
      Limpar Filtros
    </button>
  )
}
