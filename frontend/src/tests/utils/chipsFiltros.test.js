import { montarChips, rotuloDoValor } from '../../utils/chipsFiltros'

const OPCOES = [{ value: 'PROF. DR. JOAO SILVA', label: 'João Silva' }, { value: 'CT', label: 'CT' }]

describe('rotuloDoValor', () => {
  it('usa o rótulo limpo da opção', () => {
    expect(rotuloDoValor(OPCOES, 'PROF. DR. JOAO SILVA')).toBe('João Silva')
  })
  it('acha a opção mesmo com diferença de caixa e espaços (valor vindo do gráfico)', () => {
    expect(rotuloDoValor(OPCOES, ' ct ')).toBe('CT')
  })
  it('valor fora das opções aparece limpo', () => {
    expect(rotuloDoValor([], '  Engenharias  ')).toBe('Engenharias')
    expect(rotuloDoValor(undefined, 2021)).toBe('2021')
  })
})

describe('montarChips', () => {
  it('um chip por valor, com o rótulo do campo, e remover tira só aquele valor', () => {
    const alterar = vi.fn()
    const chips = montarChips([{ rotulo: 'Centro', valor: ['CT', 'CCN'], alterar, opcoes: OPCOES }])
    expect(chips.map((c) => `${c.rotulo}: ${c.texto}`)).toEqual(['Centro: CT', 'Centro: CCN'])
    chips[0].remover()
    expect(alterar).toHaveBeenCalledWith(['CCN'])
  })

  it('campos vazios não geram chip', () => {
    expect(montarChips([{ rotulo: 'Área', valor: [], alterar: vi.fn() }, { rotulo: 'Inventor', valor: '  ', alterar: vi.fn(), tipo: 'texto' }])).toEqual([])
  })

  it('mais de 3 valores no mesmo campo viram um chip só, que limpa o campo', () => {
    const alterar = vi.fn()
    const [chip, ...resto] = montarChips([{ rotulo: 'Nome', valor: ['a', 'b', 'c', 'd'], alterar }])
    expect(resto).toEqual([])
    expect(chip.texto).toBe('4 selecionados')
    chip.remover()
    expect(alterar).toHaveBeenCalledWith([])
  })

  it('filtro de texto vira chip entre aspas e remover esvazia o texto', () => {
    const alterar = vi.fn()
    const [chip] = montarChips([{ rotulo: 'Inventores', valor: 'silva', alterar, tipo: 'texto' }])
    expect(chip.texto).toBe('“silva”')
    chip.remover()
    expect(alterar).toHaveBeenCalledWith('')
  })

  it('remove por comparação de texto (anos numéricos guardados como string)', () => {
    const alterar = vi.fn()
    montarChips([{ rotulo: 'Ano', valor: [2020, '2021'], alterar }])[1].remover()
    expect(alterar).toHaveBeenCalledWith([2020])
  })
})
