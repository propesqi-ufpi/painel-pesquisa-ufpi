/*
 * Números como o leitor brasileiro espera: vírgula decimal, ponto de milhar.
 * Usados nos rótulos, na dica (tooltip) e na legenda dos gráficos.
 */

const INTEIRO = new Intl.NumberFormat('pt-BR')
const PERCENTUAL = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** 1234 → "1.234"; valores não numéricos voltam como texto. */
export function formatarNumero(valor) {
  if (valor == null || valor === '') return ''
  const n = Number(valor)
  return Number.isFinite(n) ? INTEIRO.format(n) : String(valor ?? '')
}

/**
 * Parte do total em percentual, com até uma casa: 0,32 → "32%", 0,325 → "32,5%".
 * Abaixo de 0,1% mostra "<0,1%" em vez de um "0%" enganoso.
 */
export function formatarPercentual(fracao) {
  const n = Number(fracao)
  if (!Number.isFinite(n)) return ''
  if (n > 0 && n < 0.001) return '<0,1%'
  return PERCENTUAL.format(n).replace(/\s/g, '')
}

/** Valor sobre total, já formatado; vazio se não houver total. */
export function percentualDe(valor, total) {
  const t = Number(total)
  if (!t) return ''
  return formatarPercentual(Number(valor) / t)
}
