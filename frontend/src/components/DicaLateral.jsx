import { cloneElement, useState } from 'react'
import { createPortal } from 'react-dom'

/*
 * Dica que aparece à direita do item na sidebar recolhida. Vai num portal com
 * posição fixa porque a <nav> rola (overflow) e cortaria a dica.
 *
 * É só reforço visual: o nome do item já está no rótulo acessível do próprio
 * item, então a dica fica fora da árvore de acessibilidade.
 */
export default function DicaLateral({ texto, ativa = true, children }) {
  const [pos, setPos] = useState(null)

  if (!ativa) return children

  const mostrar = (e) => {
    // No mobile a sidebar é gaveta aberta, com os nomes à vista.
    if (window.matchMedia && !window.matchMedia('(min-width: 768px)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    setPos({ left: r.right + 8, top: r.top + r.height / 2 })
  }
  const esconder = () => setPos(null)

  const encadear = (proprio, nosso) => (e) => {
    proprio?.(e)
    nosso(e)
  }

  return (
    <>
      {cloneElement(children, {
        onMouseEnter: encadear(children.props.onMouseEnter, mostrar),
        onMouseLeave: encadear(children.props.onMouseLeave, esconder),
        onFocus: encadear(children.props.onFocus, mostrar),
        onBlur: encadear(children.props.onBlur, esconder),
      })}
      {pos && createPortal(
        <div
          aria-hidden="true"
          data-testid="dica-lateral"
          className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md bg-texto px-2.5 py-1.5 text-xs font-medium text-superficie shadow-lg"
          style={{ left: pos.left, top: pos.top }}
        >
          {texto}
        </div>,
        document.body,
      )}
    </>
  )
}
