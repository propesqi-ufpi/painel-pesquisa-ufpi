import brasao from '../assets/marca/brasao-ufpi.webp'

/*
 * Brasão da UFPI + "UFPI · PROPESQI" + nome do painel, sobre a faixa azul.
 * O arquivo é um recorte do PNG oficial sem fundo (refs/logo_ufpi_brasao.png).
 * Quando a ASCOM mandar o vetor (VIS-02), troca-se só o import.
 */

const ALTURA = { sm: 'h-8', md: 'h-12', lg: 'h-20' }

export function Brasao({ tamanho = 'md', className = '' }) {
  return (
    <img
      src={brasao}
      alt="Brasão da Universidade Federal do Piauí"
      className={`${ALTURA[tamanho]} w-auto shrink-0 select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] ${className}`}
      draggable="false"
    />
  )
}

/**
 * Brasão com o texto ao lado. `compacta` (sidebar recolhida) esconde o texto a
 * partir do desktop; no mobile a gaveta abre inteira e o texto aparece.
 */
export default function Marca({ compacta = false, tamanho = 'md', textoClassName = '' }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Brasao tamanho={tamanho} />
      <div className={`flex flex-col min-w-0 leading-tight ${compacta ? 'md:sr-only' : ''} ${textoClassName}`}>
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/75">
          UFPI · PROPESQI
        </span>
        <span className="text-sm font-semibold text-white">
          Painel de Pesquisa e Inovação
        </span>
      </div>
    </div>
  )
}
