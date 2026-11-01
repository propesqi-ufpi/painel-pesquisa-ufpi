import { valorExibicao } from './exibicao'

const COLLATOR = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

/** Próximo estado ao clicar no cabeçalho: crescente → decrescente → sem ordenação. */
export function proximaOrdem(atual, key) {
  if (!atual || atual.key !== key) return { key, dir: 'asc' }
  if (atual.dir === 'asc') return { key, dir: 'desc' }
  return null
}

function comparar(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return COLLATOR.compare(String(a), String(b))
}

/**
 * Linhas ordenadas pela coluna, sem mudar o array original.
 * Ordena pelo valor exibido (já limpo), ou por `coluna.sortValue(linha)` quando
 * a coluna precisa de outro critério (moeda, data). Vazios ficam sempre no fim.
 */
export function ordenarLinhas(linhas, colunas, ordem) {
  if (!ordem) return linhas
  const coluna = colunas.find((c) => c.key === ordem.key)
  if (!coluna) return linhas
  const valorDe = coluna.sortValue ?? ((linha) => valorExibicao(coluna, linha))
  const sinal = ordem.dir === 'desc' ? -1 : 1

  return linhas
    .map((linha, indice) => ({ linha, indice, valor: valorDe(linha) }))
    .sort((x, y) => {
      const xVazio = x.valor === null || x.valor === undefined || x.valor === ''
      const yVazio = y.valor === null || y.valor === undefined || y.valor === ''
      if (xVazio || yVazio) return xVazio === yVazio ? x.indice - y.indice : xVazio ? 1 : -1
      return sinal * comparar(x.valor, y.valor) || x.indice - y.indice
    })
    .map((item) => item.linha)
}
