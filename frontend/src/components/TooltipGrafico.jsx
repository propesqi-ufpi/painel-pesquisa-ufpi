export default function TooltipGrafico({ active, payload, label, formatarValor, total }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-sm">
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
