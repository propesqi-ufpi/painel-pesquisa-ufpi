export default function CardMetrica({ titulo, valor, subtitulo, onClick, icone, tamanhoValor = 'text-2xl' }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-faixa text-white p-3 rounded-xl',
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '',
      ].join(' ')}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-80 leading-tight">
        {titulo}
      </p>
      <p className={`${tamanhoValor} font-bold mt-1`}>{valor}</p>
      {subtitulo && (
        <p className="text-xs opacity-70 mt-0.5">{subtitulo}</p>
      )}
      {icone && (
        <img
          src={icone}
          alt=""
          className="w-6 h-6 object-contain opacity-80 mt-2"
        />
      )}
    </div>
  )
}
