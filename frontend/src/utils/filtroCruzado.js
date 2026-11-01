/**
 * Filtro cruzado: clicar num elemento do gráfico liga ou desliga aquele valor
 * no filtro correspondente da página.
 *
 * O gráfico que origina o filtro não aplica o próprio filtro (como o `exc=` do
 * endpoint /filtros): ele continua mostrando todas as categorias, com as
 * selecionadas em destaque, e dá para somar ou tirar valores com novos cliques.
 */

const normalizar = (v) => String(v ?? '').trim().toLowerCase()

/** O valor está na seleção? Compara como o backend: sem caixa e sem espaços nas pontas. */
export function estaSelecionado(selecionados = [], valor) {
  const alvo = normalizar(valor)
  return selecionados.some((s) => normalizar(s) === alvo)
}

/** Liga ou desliga um valor na lista de selecionados. */
export function alternarValor(selecionados = [], valor) {
  if (valor === null || valor === undefined || valor === '') return selecionados
  if (estaSelecionado(selecionados, valor)) {
    return selecionados.filter((s) => normalizar(s) !== normalizar(valor))
  }
  return [...selecionados, String(valor)]
}

/** Filtros ativos sem a chave do próprio gráfico. */
export function semChave(filtros, chave) {
  const copia = { ...filtros }
  delete copia[chave]
  return copia
}

/** Opacidade de um elemento: esmaece os não selecionados quando há seleção. */
export function opacidade(selecionados = [], valor) {
  if (!selecionados.length) return 1
  return estaSelecionado(selecionados, valor) ? 1 : 0.3
}
