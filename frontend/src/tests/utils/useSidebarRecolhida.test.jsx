import { act, renderHook } from '@testing-library/react'
import { useSidebarRecolhida } from '../../utils/useSidebarRecolhida'

const matchMediaOriginal = window.matchMedia

function simularTelaMedia(media) {
  const ouvintes = new Set()
  const mq = {
    matches: media,
    addEventListener: (_, f) => ouvintes.add(f),
    removeEventListener: (_, f) => ouvintes.delete(f),
  }
  window.matchMedia = vi.fn(() => mq)
  return (novo) => { mq.matches = novo; ouvintes.forEach((f) => f({ matches: novo })) }
}

describe('useSidebarRecolhida', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { window.matchMedia = matchMediaOriginal })

  it('sem escolha salva, recolhe em tela média e abre em tela larga', () => {
    simularTelaMedia(true)
    expect(renderHook(() => useSidebarRecolhida()).result.current[0]).toBe(true)
    simularTelaMedia(false)
    expect(renderHook(() => useSidebarRecolhida()).result.current[0]).toBe(false)
  })

  it('acompanha a largura da tela enquanto não há escolha', () => {
    const mudar = simularTelaMedia(false)
    const { result } = renderHook(() => useSidebarRecolhida())
    act(() => mudar(true))
    expect(result.current[0]).toBe(true)
  })

  it('a escolha da pessoa fica salva e vale em qualquer largura', () => {
    const mudar = simularTelaMedia(true)
    const { result } = renderHook(() => useSidebarRecolhida())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
    expect(localStorage.getItem('sidebar-recolhida')).toBe('0')
    act(() => mudar(false))
    act(() => mudar(true))
    expect(result.current[0]).toBe(false)
    expect(renderHook(() => useSidebarRecolhida()).result.current[0]).toBe(false)
  })
})
