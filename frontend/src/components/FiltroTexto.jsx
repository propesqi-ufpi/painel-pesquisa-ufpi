export default function FiltroTexto({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-texto">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-borda rounded px-2 py-1 bg-superficie text-xs focus:outline-none focus:ring-1 focus:ring-azul "
      />
    </div>
  )
}
