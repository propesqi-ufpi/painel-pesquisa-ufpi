import { limparTexto } from './exibicao'

/*
 * Chips dos filtros ativos: um por valor escolhido ("Área: Engenharias"). O
 * texto do chip é o rótulo limpo da opção (o mesmo do seletor); o valor bruto
 * continua sendo o que vai para a API.
 *
 * Campo: { rotulo, valor, alterar, opcoes?, tipo? }
 *   valor   array de valores (seleção múltipla) ou string (tipo: 'texto')
 *   alterar recebe o novo valor do campo (o setState da página)
 */

const normalizar = (v) => String(v ?? '').trim().toLowerCase()

/** Rótulo do valor nas opções; se o valor veio de um clique no gráfico e não está nelas, limpa o próprio valor. */
export function rotuloDoValor(opcoes = [], valor) {
  const exato = opcoes.find((o) => String(o.value) === String(valor))
  if (exato) return exato.label
  const parecido = opcoes.find((o) => normalizar(o.value) === normalizar(valor))
  if (parecido) return parecido.label
  return String(limparTexto(valor) ?? valor)
}

/**
 * Lista plana de chips. Um campo com mais de `maxPorCampo` valores vira um chip
 * só ("Nome: 12 selecionados"), que limpa o campo inteiro.
 */
export function montarChips(campos, { maxPorCampo = 3 } = {}) {
  const chips = []
  for (const campo of campos) {
    const { rotulo, valor, alterar, opcoes = [], tipo } = campo

    if (tipo === 'texto') {
      const texto = String(valor ?? '').trim()
      if (texto) chips.push({ id: `${rotulo}:texto`, rotulo, texto: `“${texto}”`, remover: () => alterar('') })
      continue
    }

    const valores = Array.isArray(valor) ? valor : []
    if (!valores.length) continue

    if (valores.length > maxPorCampo) {
      chips.push({ id: `${rotulo}:varios`, rotulo, texto: `${valores.length} selecionados`, remover: () => alterar([]) })
      continue
    }

    for (const v of valores) {
      chips.push({
        id: `${rotulo}:${v}`,
        rotulo,
        texto: rotuloDoValor(opcoes, v),
        remover: () => alterar(valores.filter((x) => String(x) !== String(v))),
      })
    }
  }
  return chips
}
