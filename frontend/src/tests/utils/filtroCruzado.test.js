import { alternarValor, estaSelecionado, opacidade, semChave } from '../../utils/filtroCruzado'

describe('filtroCruzado', () => {
  it('alternarValor liga e desliga, comparando sem caixa e espaços', () => {
    expect(alternarValor([], 'CT')).toEqual(['CT'])
    expect(alternarValor(['CT'], 'CCA')).toEqual(['CT', 'CCA'])
    expect(alternarValor(['CT', 'CCA'], ' ct ')).toEqual(['CCA'])
  })

  it('alternarValor guarda anos como texto, igual ao FiltroSelect', () => {
    expect(alternarValor([], 2024)).toEqual(['2024'])
    expect(alternarValor(['2024'], 2024)).toEqual([])
  })

  it('alternarValor ignora valor vazio', () => {
    const lista = ['CT']
    expect(alternarValor(lista, null)).toBe(lista)
    expect(alternarValor(lista, '')).toBe(lista)
  })

  it('estaSelecionado não casa trechos', () => {
    expect(estaSelecionado(['CT'], 'CTT')).toBe(false)
    expect(estaSelecionado(['CT'], 'ct')).toBe(true)
  })

  it('semChave tira só o filtro do próprio gráfico, sem mudar o original', () => {
    const filtros = { centro: ['CT'], area: ['Engenharias'] }
    expect(semChave(filtros, 'centro')).toEqual({ area: ['Engenharias'] })
    expect(filtros).toEqual({ centro: ['CT'], area: ['Engenharias'] })
  })

  it('opacidade esmaece só quando há seleção', () => {
    expect(opacidade([], 'CT')).toBe(1)
    expect(opacidade(['CT'], 'CT')).toBe(1)
    expect(opacidade(['CT'], 'CCA')).toBeLessThan(1)
  })
})
