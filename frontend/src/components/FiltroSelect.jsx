import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FiltroSelect({
  label,
  value = [],
  onChange,
  options = [],
  disabled,
  className = '',
}) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function fechar(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function toggle(v) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v))
    else onChange([...value, v])
  }

  const texto =
    value.length === 0
      ? 'Todos'
      : value.length === 1
      ? (options.find((o) => o.value === value[0])?.label ?? value[0])
      : `${value.length} selecionados`

  return (
    <div ref={ref} className={`flex flex-col gap-0.5 relative ${className}`}>
      {label && (
        <label className="text-xs font-medium text-texto">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAberto((a) => !a)}
        className="border border-borda rounded px-2 py-1 bg-superficie text-xs text-left flex justify-between items-center gap-1 focus:outline-none focus:ring-1 focus:ring-azul disabled:opacity-50  min-w-0"
      >
        <span className={`truncate ${value.length === 0 ? 'text-texto-suave' : ''}`}>
          {texto}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform text-texto-suave ${aberto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {aberto && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-superficie border border-borda rounded shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-texto-suave">Sem opções</div>
          ) : (
            <>
              <label className="flex items-center gap-2 px-2 py-1.5 border-b border-borda hover:bg-azul-suave cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.length === options.length}
                  onChange={() => {
                    if (value.length === options.length) onChange([])
                    else onChange(options.map((o) => o.value))
                  }}
                  className="accent-azul w-3 h-3 flex-shrink-0"
                />
                <span className="text-xs font-semibold text-texto-suave">Selecionar todos</span>
              </label>
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-azul-suave cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="accent-azul w-3 h-3 flex-shrink-0"
                  />
                  <span className="text-xs text-texto truncate">
                    {opt.label}
                  </span>
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
