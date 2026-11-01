import { useMemo, useRef } from 'react'
import { useEhEscuro } from '../context/ThemeContext'

/*
 * Cores dos gráficos, lidas dos tokens de src/index.css.
 *
 * O Recharts precisa das cores como props (fill/stroke) e o html2canvas, que
 * exporta o PNG, não aplica CSS dentro do SVG. Por isso as cores vão como
 * valores, relidos sempre que o tema muda.
 */

// Tema claro, para quando as variáveis CSS não existem (testes, SSR).
const PADRAO = {
  series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  outros: '#9aa3ae',
  grade: '#e3e8ef',
  eixo: '#5f6b7a',
  superficie: '#ffffff',
  texto: '#16202e',
}

export function lerCoresGrafico(raiz = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!raiz) return PADRAO
  const estilo = getComputedStyle(raiz)
  const ler = (nome, padrao) => estilo.getPropertyValue(nome).trim() || padrao
  const rgb = (nome, padrao) => {
    const v = estilo.getPropertyValue(nome).trim()
    return v ? `rgb(${v.split(/\s+/).join(', ')})` : padrao
  }
  return {
    series: PADRAO.series.map((cor, i) => ler(`--serie-${i + 1}`, cor)),
    outros: ler('--serie-outros', PADRAO.outros),
    grade: ler('--grade', PADRAO.grade),
    eixo: ler('--eixo', PADRAO.eixo),
    superficie: rgb('--superficie', PADRAO.superficie),
    texto: rgb('--texto', PADRAO.texto),
  }
}

/** Cores do tema atual; mudam junto com o tema. `serie1` é a cor de gráficos com uma série só. */
export function useCoresGrafico() {
  const dark = useEhEscuro()
  return useMemo(() => {
    const cores = lerCoresGrafico()
    return { ...cores, serie1: cores.series[0], dark }
  }, [dark])
}

/**
 * Cor por categoria, estável: a cor segue a categoria, não a posição. Quando um
 * filtro some com uma fatia, as outras não trocam de cor. Ordem fixa da paleta,
 * sem repetir: da 9ª categoria em diante, cinza ("outros").
 */
export function useCorPorCategoria(cores) {
  const atribuidas = useRef(new Map())
  return (categoria) => {
    const chave = String(categoria ?? '').trim().toLowerCase()
    const mapa = atribuidas.current
    if (!mapa.has(chave)) mapa.set(chave, mapa.size)
    const indice = mapa.get(chave)
    return indice < cores.series.length ? cores.series[indice] : cores.outros
  }
}
