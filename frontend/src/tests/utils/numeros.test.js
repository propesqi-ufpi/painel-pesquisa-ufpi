import { formatarNumero, formatarPercentual, percentualDe } from '../../utils/numeros'

describe('formatarNumero', () => {
  it('usa ponto de milhar', () => {
    expect(formatarNumero(1234567)).toBe('1.234.567')
  })
  it('aceita texto numérico e devolve texto não numérico como está', () => {
    expect(formatarNumero('42')).toBe('42')
    expect(formatarNumero('n/d')).toBe('n/d')
    expect(formatarNumero(null)).toBe('')
  })
})

describe('formatarPercentual', () => {
  it('vírgula decimal e até uma casa', () => {
    expect(formatarPercentual(0.325)).toBe('32,5%')
    expect(formatarPercentual(0.32)).toBe('32%')
    expect(formatarPercentual(1)).toBe('100%')
  })
  it('valor muito pequeno não vira 0%', () => {
    expect(formatarPercentual(0.0004)).toBe('<0,1%')
    expect(formatarPercentual(0)).toBe('0%')
  })
  it('vazio para valor inválido', () => {
    expect(formatarPercentual(NaN)).toBe('')
  })
})

describe('percentualDe', () => {
  it('calcula sobre o total', () => {
    expect(percentualDe(1, 3)).toBe('33,3%')
  })
  it('vazio sem total', () => {
    expect(percentualDe(1, 0)).toBe('')
    expect(percentualDe(1, undefined)).toBe('')
  })
})
