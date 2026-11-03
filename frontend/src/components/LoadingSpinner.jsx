const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-4',
  lg: 'h-16 w-16 border-4',
}

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-azul border-t-transparent ${sizes[size]}`}
    />
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
