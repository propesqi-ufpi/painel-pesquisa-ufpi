export default function TooltipGrafico({ active, payload, label, formatarValor, total }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-superficie border border-borda rounded-lg shadow-lg p-3 text-sm">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((item, i) => {
        const pct =
          total != null
            ? ` (${((item.value / total) * 100).toFixed(1)}%)`
            : ''
        const valorExibido = formatarValor ? formatarValor(item.value) : item.value
        return (
          <p key={i} style={{ color: item.color }}>
            {item.name}: {valorExibido}{pct}
          </p>
        )
      })}
    </div>
  )
}
