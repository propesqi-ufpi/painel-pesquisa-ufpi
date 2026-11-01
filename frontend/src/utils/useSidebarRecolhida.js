import { useEffect, useState } from 'react'

/*
 * Sidebar recolhida (só ícones) a partir do desktop.
 *
 * Sem escolha salva, segue a largura da tela: recolhida em telas médias
 * (768–1279 px), aberta em telas largas. Depois que a pessoa usa o botão, a
 * escolha fica salva e passa a valer em qualquer largura. No mobile a sidebar é
 * gaveta e aparece sempre aberta, então este estado não se aplica lá.
 */

const CHAVE = 'sidebar-recolhida'
const CONSULTA = '(max-width: 1279px)'

function lerPreferencia() {
  try {
    const v = localStorage.getItem(CHAVE)
    return v === '1' ? true : v === '0' ? false : null
  } catch {
    return null
  }
}

const consulta = () =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(CONSULTA) : null

export function useSidebarRecolhida() {
  const [preferencia, setPreferencia] = useState(lerPreferencia)
  const [telaMedia, setTelaMedia] = useState(() => consulta()?.matches ?? false)

  useEffect(() => {
    const mq = consulta()
    if (!mq?.addEventListener) return undefined
    const mudar = (e) => setTelaMedia(e.matches)
    mq.addEventListener('change', mudar)
    return () => mq.removeEventListener('change', mudar)
  }, [])

  const recolhida = preferencia ?? telaMedia

  function alternar() {
    const nova = !recolhida
    try {
      localStorage.setItem(CHAVE, nova ? '1' : '0')
    } catch {
      // Sem storage: vale só nesta sessão.
    }
    setPreferencia(nova)
  }

  return [recolhida, alternar]
}
