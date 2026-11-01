import { larguraDoRotulo, ordenarParaRanking, quebrarEmDuasLinhas } from '../../utils/barrasHorizontais'

describe('ordenarParaRanking', () => {
  const sempre = () => true
  it('ordena do maior para o menor e mantém a ordem original nos empates', () => {
    const dados = [{ c: 'A', t: 2 }, { c: 'B', t: 9 }, { c: 'C', t: 2 }, { c: 'D', t: '5' }]
    expect(ordenarParaRanking(dados, { categoria: 'c', valor: 't', podeFiltrar: sempre }).map((d) => d.c))
      .toEqual(['B', 'D', 'A', 'C'])
  })

  it('manda para o fim o que não filtra, mesmo sendo o maior', () => {
    const dados = [{ c: 'Em branco', t: 50 }, { c: 'CT', t: 3 }, { c: 'CCN', t: 7 }]
    const podeFiltrar = (v) => v !== 'Em branco'
    expect(ordenarParaRanking(dados, { categoria: 'c', valor: 't', podeFiltrar }).map((d) => d.c))
      .toEqual(['CCN', 'CT', 'Em branco'])
  })

  it('não altera o array recebido', () => {
    const dados = [{ c: 'A', t: 1 }, { c: 'B', t: 2 }]
    ordenarParaRanking(dados, { categoria: 'c', valor: 't', podeFiltrar: sempre })
    expect(dados.map((d) => d.c)).toEqual(['A', 'B'])
  })
})

describe('larguraDoRotulo', () => {
  it('siglas curtas ganham eixo estreito, com mínimo', () => {
    expect(larguraDoRotulo(['CT', 'CCN'])).toBe(44)
    expect(larguraDoRotulo(['CCHL', 'CCMN'])).toBeGreaterThanOrEqual(4 * 6.2)
  })
  it('nomes longos param no máximo (e quebram em duas linhas)', () => {
    expect(larguraDoRotulo(['Ciências Exatas e da Terra', null])).toBe(156)
  })
})

describe('quebrarEmDuasLinhas', () => {
  it('cabe numa linha: não mexe', () => {
    expect(quebrarEmDuasLinhas('Engenharias', 20)).toEqual(['Engenharias'])
  })
  it('quebra por palavra', () => {
    expect(quebrarEmDuasLinhas('Ciências Exatas e da Terra', 16)).toEqual(['Ciências Exatas', 'e da Terra'])
  })
  it('o que passa de duas linhas leva reticências', () => {
    expect(quebrarEmDuasLinhas('Centro de Ciências da Natureza Campus Ministro Petrônio Portella', 20))
      .toEqual(['Centro de Ciências', 'da Natureza Campus…'])
  })
  it('palavra única maior que a linha é cortada', () => {
    expect(quebrarEmDuasLinhas('Otorrinolaringologia', 10)).toEqual(['Otorrinol…'])
  })
})
