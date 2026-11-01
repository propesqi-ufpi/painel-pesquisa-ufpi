/*
 * Regras de BarrasHorizontais que não dependem do Recharts, para testar à parte.
 */

// Plex Sans Condensed 11px. Estimativa pelo alto: siglas em caixa alta (CCHL,
// CCMN) são mais largas que a média e não podem sair cortadas.
export const LARGURA_CARACTERE = 6.2
const ROTULO_MIN = 44
const ROTULO_MAX = 156

/**
 * Decrescente pelo valor; categorias que não filtram (ex.: "Em branco") no fim.
 * Empates mantêm a ordem que veio da API.
 */
export function ordenarParaRanking(dados, { categoria, valor, podeFiltrar }) {
  return dados
    .map((d, i) => ({ d, i }))
    .sort((a, b) => {
      const fa = podeFiltrar(a.d[categoria]) ? 0 : 1
      const fb = podeFiltrar(b.d[categoria]) ? 0 : 1
      if (fa !== fb) return fa - fb
      return (Number(b.d[valor]) || 0) - (Number(a.d[valor]) || 0) || a.i - b.i
    })
    .map(({ d }) => d)
}

/** Largura do eixo de nomes: cabe o maior nome, entre 44 e 156 px (acima disso, quebra). */
export function larguraDoRotulo(nomes) {
  const maior = nomes.reduce((m, n) => Math.max(m, String(n ?? '').length), 0)
  return Math.min(ROTULO_MAX, Math.max(ROTULO_MIN, Math.ceil(maior * LARGURA_CARACTERE) + 12))
}

/** Quebra o nome em até duas linhas por palavra; o que não couber leva reticências. */
export function quebrarEmDuasLinhas(texto, porLinha) {
  if (texto.length <= porLinha) return [texto]
  const palavras = texto.split(/\s+/)
  let primeira = ''
  let i = 0
  while (i < palavras.length && (primeira ? `${primeira} ${palavras[i]}` : palavras[i]).length <= porLinha) {
    primeira = primeira ? `${primeira} ${palavras[i]}` : palavras[i]
    i++
  }
  if (!primeira) return [texto.slice(0, porLinha - 1) + '…']
  let segunda = palavras.slice(i).join(' ')
  if (segunda.length > porLinha) segunda = segunda.slice(0, porLinha - 1).trimEnd() + '…'
  return [primeira, segunda]
}
