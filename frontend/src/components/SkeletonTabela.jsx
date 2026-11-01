export default function SkeletonTabela({ linhas = 5 }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-borda rounded" />
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="h-8 bg-superficie-2 rounded" />
      ))}
    </div>
  )
}
