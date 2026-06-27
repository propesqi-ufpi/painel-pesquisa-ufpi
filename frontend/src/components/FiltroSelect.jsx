import { useState, useEffect, useRef } from 'react'

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
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAberto((a) => !a)}
        className="border border-gray-300 rounded px-2 py-1 bg-white text-xs text-left flex justify-between items-center gap-1 focus:outline-none focus:ring-1 focus:ring-azul-medio disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 min-w-0"
      >
        <span className={`truncate ${value.length === 0 ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {texto}
        </span>
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform text-gray-500 dark:text-gray-400 ${aberto ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-gray-400">Sem opções</div>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="accent-azul-medio w-3 h-3 flex-shrink-0"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {opt.label}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
