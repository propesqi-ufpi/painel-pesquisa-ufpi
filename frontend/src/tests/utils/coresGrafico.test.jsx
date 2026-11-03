import { renderHook } from '@testing-library/react'
import { lerCoresGrafico, useCoresGrafico, useCorPorCategoria } from '../../utils/coresGrafico'

describe('coresGrafico', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('usa a paleta clara quando os tokens não existem', () => {
    const cores = lerCoresGrafico()
    expect(cores.series).toHaveLength(8)
    expect(cores.series[0]).toBe('#2a78d6')
    expect(cores.superficie).toBe('#ffffff')
  })

  it('lê os tokens do tema quando existem', () => {
    document.documentElement.style.setProperty('--serie-1', '#3987e5')
    document.documentElement.style.setProperty('--superficie', '18 28 41')
    const cores = lerCoresGrafico()
    expect(cores.series[0]).toBe('#3987e5')
    expect(cores.superficie).toBe('rgb(18, 28, 41)')
  })

  it('funciona fora do ThemeProvider', () => {
    const { result } = renderHook(() => useCoresGrafico())
    expect(result.current.serie1).toBe('#2a78d6')
    expect(result.current.dark).toBe(false)
  })

  it('a cor segue a categoria, não a posição, e não se repete', () => {
    const { result } = renderHook(() => useCorPorCategoria(lerCoresGrafico()))
    const corDe = result.current
    const ct = corDe('CT')
    const ccn = corDe('CCN')
    expect(ct).not.toBe(ccn)
    // Depois de um filtro, CT some e CCN vem primeiro: CCN mantém a cor.
    expect(corDe('CCN')).toBe(ccn)
    expect(corDe(' ct ')).toBe(ct)
  })

  it('da nona categoria em diante, cinza de "outros"', () => {
    const cores = lerCoresGrafico()
    const { result } = renderHook(() => useCorPorCategoria(cores))
    const usadas = Array.from({ length: 10 }, (_, i) => result.current(`Categoria ${i}`))
    expect(new Set(usadas.slice(0, 8)).size).toBe(8)
    expect(usadas[8]).toBe(cores.outros)
    expect(usadas[9]).toBe(cores.outros)
  })
})
