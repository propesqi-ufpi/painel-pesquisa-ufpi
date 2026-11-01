import { render, screen } from '@testing-library/react'
import TooltipGrafico from '../../components/TooltipGrafico'

const payload = [{ value: 50, color: '#1E3A5F', name: 'Total' }]

describe('TooltipGrafico', () => {
  it('não renderiza nada quando active é false', () => {
    const { container } = render(
      <TooltipGrafico active={false} payload={payload} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('não renderiza nada com payload vazio', () => {
    const { container } = render(
      <TooltipGrafico active={true} payload={[]} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('não renderiza nada sem payload', () => {
    const { container } = render(
      <TooltipGrafico active={true} label="2023" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renderiza label e valor quando active', () => {
    render(<TooltipGrafico active={true} payload={payload} label="2023" />)
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('exibe percentual quando total é passado', () => {
    render(
      <TooltipGrafico active={true} payload={payload} label="X" total={100} />
    )
    expect(screen.getByText('(50%)')).toBeInTheDocument()
  })

  it('não exibe percentual quando total não é passado', () => {
    render(<TooltipGrafico active={true} payload={payload} label="X" />)
    expect(screen.queryByText(/%/)).toBeNull()
  })

  it('usa formatarValor quando fornecido', () => {
    render(
      <TooltipGrafico
        active={true}
        payload={payload}
        label="X"
        formatarValor={(v) => `R$ ${v} Mi`}
      />
    )
    expect(screen.getByText(/R\$ 50 Mi/)).toBeInTheDocument()
  })

  it('renderiza múltiplos itens no payload', () => {
    const multi = [
      { value: 10, color: '#111', name: 'A' },
      { value: 20, color: '#222', name: 'B' },
    ]
    render(<TooltipGrafico active={true} payload={multi} label="Y" />)
    expect(screen.getByText('A:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('B:')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('percentual em pt-BR, com vírgula', () => {
    render(<TooltipGrafico active payload={[{ value: 1, name: 'A', color: '#111' }]} label="X" total={3} />)
    expect(screen.getByText('(33,3%)')).toBeInTheDocument()
  })

  it('milhar com ponto quando não há formatarValor', () => {
    render(<TooltipGrafico active payload={[{ value: 12345, name: 'A', color: '#111' }]} label="X" />)
    expect(screen.getByText('12.345')).toBeInTheDocument()
  })

  it('texto na cor do tema, não na cor da série', () => {
    render(<TooltipGrafico active payload={payload} label="2023" />)
    const valor = screen.getByText('50')
    expect(valor.closest('li').getAttribute('style')).toBeNull()
    expect(valor.closest('li').querySelector('[aria-hidden="true"]').style.background).not.toBe('')
  })

  it('em pizza (sem label) usa o nome da fatia como título e nomeSerie na linha', () => {
    const fatia = [{ value: 12, name: 'Pesquisa', payload: { fill: '#123456' } }]
    render(<TooltipGrafico active payload={fatia} total={48} nomeSerie="Projetos" />)
    expect(screen.getByText('Pesquisa')).toBeInTheDocument()
    expect(screen.getByText('Projetos:')).toBeInTheDocument()
    expect(screen.getByText('(25%)')).toBeInTheDocument()
  })
})
