/**
 * Limpeza de valores na exibição.
 *
 * Nada aqui altera o dado: a API e o banco continuam com o valor da planilha.
 * As funções só decidem como o valor aparece na tela, no CSV exportado e nos
 * rótulos dos filtros. O valor bruto continua sendo o que vai para a API.
 */

export const VAZIO = '—'

const ERRO_EXCEL_TOKEN = String.raw`#(?:nome\?|name\?|n\/d|n\/a|ref!|valor!|value!|div\/0!|nulo!|null!|n[úu]m!|despejar!|spill!)`
const ERRO_EXCEL = new RegExp(`^${ERRO_EXCEL_TOKEN}$`, 'i')
const ERRO_EXCEL_NO_MEIO = new RegExp(ERRO_EXCEL_TOKEN, 'gi')

const PLACEHOLDERS = new Set([
  '-', '--', '---', '—', '–', '.', '?',
  'n/a', 'n/d', 'n/i', 's/n', 's/i',
  'nan', 'none', 'null', 'undefined',
  'não informado', 'nao informado', 'não se aplica', 'nao se aplica',
  'sem informação', 'sem informacao',
])

/** Normaliza espaços (inclui NBSP e quebras de linha) e a forma Unicode. */
function normalizarEspacos(texto) {
  return String(texto).normalize('NFC').replace(/[\s\u00a0\u2007\u202f]+/g, ' ').trim()
}

/**
 * Valor pronto para exibir, ou null quando é vazio, placeholder ou erro do Excel.
 * Números passam sem mudança (NaN vira null).
 */
export function limparTexto(valor) {
  if (valor === null || valor === undefined) return null
  if (typeof valor === 'number') return Number.isNaN(valor) ? null : valor
  if (typeof valor === 'boolean') return valor
  const texto = normalizarEspacos(valor)
  if (!texto || PLACEHOLDERS.has(texto.toLowerCase()) || ERRO_EXCEL.test(texto)) return null
  return texto
}

/* ---------- nomes de pessoas ---------- */

// Prof., Profa., Profª, Prof.ª, Professor(a), Dr., Dra., Drª, Doutor(a),
// M.Sc., MSc, Me., Ma., Mestre, Mestra, Esp., Especialista, PhD, Ph.D.
// "Me" e "Ma" só contam com ponto, para não comer nomes como "Ma Long".
const TITULO = String.raw`(?:prof(?:essora?|a|ª|\.ª)?|dr(?:a|ª)?|doutora?|m\.?\s?sc|m[ea]\.|mestr[ea]|esp\.|especialista|ph\.?\s?d)`
const RE_TITULOS_INICIO = new RegExp(String.raw`^(?:${TITULO}\.?\s+)+`, 'i')
const RE_TITULO_FIM = /,?\s+(?:dr(?:a|ª)?|ph\.?\s?d|m\.?\s?sc)\.?$/i
// Separadores entre pessoas: ";" e "/" sempre; " e " e "," só quando vem um título
// logo depois ("Maria e Silva" e "Silva, João" continuam sendo uma pessoa só).
const RE_SEPARA_PESSOAS = new RegExp(
  String.raw`\s*[;/]\s*|(?:\s+e|\s*,)\s+(?=${TITULO}\.?\s+\p{L})`,
  'iu',
)

const PARTICULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di', 'du', 'del', 'van', 'von'])
const ROMANOS = new Set(['ii', 'iii', 'iv'])

function titulacaoDe(trecho) {
  const t = trecho.toLowerCase()
  if (/\bdr|doutor|ph\.?\s?d/.test(t)) return 'Doutor(a)'
  if (/\bm[ea]\.|m\.?\s?sc|mestr/.test(t)) return 'Mestre(a)'
  if (/\besp/.test(t)) return 'Especialista'
  return null
}

/** Caixa de nome em pt-BR. Só mexe em nomes todos em maiúsculas ou todos em minúsculas. */
function caixaNome(nome) {
  if (nome !== nome.toUpperCase() && nome !== nome.toLowerCase()) return nome
  return nome
    .toLowerCase()
    .split(' ')
    .map((palavra, i) => {
      if (i > 0 && PARTICULAS.has(palavra)) return palavra
      if (i > 0 && ROMANOS.has(palavra)) return palavra.toUpperCase()
      return palavra.replace(/(^|[-'’])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())
    })
    .join(' ')
}

/** Uma pessoa: nome sem títulos acadêmicos e a titulação encontrada. */
export function limparNome(valor) {
  let nome = limparTexto(valor)
  if (nome === null || typeof nome !== 'string') return { nome, titulacao: null }

  let titulacao = null
  // O espaço extra deixa o regex consumir um título solto no fim ("Prof. Dr.").
  const inicio = `${nome} `.match(RE_TITULOS_INICIO)
  if (inicio) {
    titulacao = titulacaoDe(inicio[0])
    nome = `${nome} `.slice(inicio[0].length)
  }
  const fim = nome.match(RE_TITULO_FIM)
  if (fim) {
    titulacao = titulacao || titulacaoDe(fim[0])
    nome = nome.slice(0, fim.index)
  }
  nome = nome.trim()
  return { nome: nome ? caixaNome(nome) : null, titulacao }
}

/** Campo com uma ou mais pessoas. Devolve a lista já limpa, sem vazios. */
export function limparPessoas(valor) {
  const texto = limparTexto(valor)
  if (texto === null || typeof texto !== 'string') return []
  // Tira erros de planilha antes de separar: "#N/D" e "#DIV/0!" têm barra.
  return texto.replace(ERRO_EXCEL_NO_MEIO, ' ').split(RE_SEPARA_PESSOAS).map(limparNome).filter((p) => p.nome)
}

/** Pessoas para exibir numa célula: nomes limpos separados por "; ". */
export function formatarPessoas(valor) {
  const pessoas = limparPessoas(valor)
  return pessoas.length ? pessoas.map((p) => p.nome).join('; ') : null
}

/* ---------- integração com tabelas e filtros ---------- */

const POR_TIPO = {
  pessoa: (v) => limparNome(v).nome,
  pessoas: formatarPessoas,
}

/**
 * Valor de uma coluna de tabela já limpo. A coluna pode declarar `tipo`:
 * 'pessoa' (um nome) ou 'pessoas' (lista de nomes). Sem tipo, só limpa vazios.
 */
export function valorExibicao(coluna, linha) {
  const bruto = linha?.[coluna.key]
  const limpar = POR_TIPO[coluna.tipo] ?? limparTexto
  return limpar(bruto)
}

const COLLATOR = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' })

/**
 * Opções de um FiltroSelect. O rótulo sai limpo e o `value` continua sendo o
 * valor bruto, que é o que a API compara. Valores vazios ou com erro de planilha
 * ficam fora da lista.
 */
export function opcoesFiltro(valores = [], { tipo } = {}) {
  const limpar = POR_TIPO[tipo] ?? limparTexto
  return valores
    .map((v) => ({ value: String(v), label: limpar(v) }))
    .filter((o) => o.label !== null && o.label !== '')
    .map((o) => ({ ...o, label: String(o.label) }))
    .sort((a, b) => COLLATOR.compare(a.label, b.label))
}
