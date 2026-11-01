export default function BotaoLimparFiltros({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="self-end px-2 py-1 text-xs border border-azul text-azul rounded hover:bg-azul-suave transition-colors whitespace-nowrap"
    >
      ✕ Limpar Filtros
    </button>
  )
}
