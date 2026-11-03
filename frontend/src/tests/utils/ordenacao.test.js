import { ordenarLinhas, proximaOrdem } from '../../utils/ordenacao'

describe('proximaOrdem', () => {
  it('cicla crescente → decrescente → sem ordenação', () => {
    expect(proximaOrdem(null, 'a')).toEqual({ key: 'a', dir: 'asc' })
    expect(proximaOrdem({ key: 'a', dir: 'asc' }, 'a')).toEqual({ key: 'a', dir: 'desc' })
    expect(proximaOrdem({ key: 'a', dir: 'desc' }, 'a')).toBeNull()
  })

  it('outra coluna recomeça em crescente', () => {
    expect(proximaOrdem({ key: 'a', dir: 'desc' }, 'b')).toEqual({ key: 'b', dir: 'asc' })
  })
})

describe('ordenarLinhas', () => {
  const colunas = [
    { key: 'nome', tipo: 'pessoa' },
    { key: 'ano' },
    { key: 'valor', sortValue: (l) => Number(String(l.valor).replace(/\D/g, '')) },
  ]
  const linhas = [
    { nome: 'Prof. Dr. Zeca', ano: 2010, valor: 'R$ 900' },
    { nome: 'ÁUREA', ano: null, valor: 'R$ 1.000' },
    { nome: '#N/D', ano: 2009, valor: 'R$ 50' },
    { nome: 'bruno', ano: 2024, valor: 'R$ 50' },
  ]
  const nomes = (r) => r.map((l) => l.nome)

  it('sem ordem devolve o mesmo array', () => {
    expect(ordenarLinhas(linhas, colunas, null)).toBe(linhas)
  })

  it('ordena pelo valor exibido, com acento e caixa em pt-BR', () => {
    expect(nomes(ordenarLinhas(linhas, colunas, { key: 'nome', dir: 'asc' })))
      .toEqual(['ÁUREA', 'bruno', 'Prof. Dr. Zeca', '#N/D'])
  })

  it('vazios ficam no fim nas duas direções', () => {
    expect(nomes(ordenarLinhas(linhas, colunas, { key: 'nome', dir: 'desc' })))
      .toEqual(['Prof. Dr. Zeca', 'bruno', 'ÁUREA', '#N/D'])
    expect(ordenarLinhas(linhas, colunas, { key: 'ano', dir: 'desc' }).map((l) => l.ano))
      .toEqual([2024, 2010, 2009, null])
  })

  it('números em texto seguem a ordem numérica', () => {
    const r = ordenarLinhas([{ c: 'Sala 10' }, { c: 'Sala 9' }], [{ key: 'c' }], { key: 'c', dir: 'asc' })
    expect(r.map((l) => l.c)).toEqual(['Sala 9', 'Sala 10'])
  })

  it('usa sortValue quando a coluna define, e empates mantêm a ordem original', () => {
    expect(ordenarLinhas(linhas, colunas, { key: 'valor', dir: 'asc' }).map((l) => l.valor))
      .toEqual(['R$ 50', 'R$ 50', 'R$ 900', 'R$ 1.000'])
    expect(nomes(ordenarLinhas(linhas, colunas, { key: 'valor', dir: 'asc' })).slice(0, 2))
      .toEqual(['#N/D', 'bruno'])
  })

  it('não altera o array recebido', () => {
    const copia = [...linhas]
    ordenarLinhas(linhas, colunas, { key: 'ano', dir: 'asc' })
    expect(linhas).toEqual(copia)
  })
})
