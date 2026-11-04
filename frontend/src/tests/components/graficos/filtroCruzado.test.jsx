import { render, screen, fireEvent } from '@testing-library/react'
import { barraClicavel, valorDaFatia } from '../../../components/graficos/barraClicavel'
import LegendaClicavel from '../../../components/graficos/LegendaClicavel'

function desenhar(shape, props) {
  return render(<svg>{shape({ x: 0, y: 0, width: 10, height: 20, fill: '#000', value: 7, index: 0, ...props })}</svg>)
}

describe('barraClicavel', () => {
  it('clique e Enter/Espaço alternam o valor da categoria', () => {
    const onAlternar = vi.fn()
    desenhar(barraClicavel({ categoria: 'centro', onAlternar }), { payload: { centro: 'CT', total: 7 } })
    const barra = screen.getByRole('button', { name: /CT: 7/ })
    expect(barra).toHaveAttribute('tabindex', '0')
    expect(barra).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(barra)
    fireEvent.keyDown(barra, { key: 'Enter' })
    fireEvent.keyDown(barra, { key: ' ' })
    fireEvent.keyDown(barra, { key: 'a' })
    expect(onAlternar).toHaveBeenCalledTimes(3)
    expect(onAlternar).toHaveBeenCalledWith('CT')
  })

  it('marca a barra selecionada e esmaece as outras', () => {
    const shape = barraClicavel({ categoria: 'centro', selecionados: ['CT'], onAlternar: vi.fn() })
    const { container } = desenhar(shape, { payload: { centro: 'CT' } })
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('path')).toHaveAttribute('fill-opacity', '1')

    const outra = desenhar(shape, { payload: { centro: 'CCA' } })
    expect(outra.container.querySelector('path')).toHaveAttribute('fill-opacity', '0.3')
  })

  it('categoria que não filtra não vira botão', () => {
    const shape = barraClicavel({ categoria: 'centro', onAlternar: vi.fn(), podeFiltrar: (v) => v !== 'Em branco' })
    desenhar(shape, { payload: { centro: 'Em branco' } })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('LegendaClicavel', () => {
  const payload = [{ value: 'Incubadora A', color: '#111' }, { value: 'Incubadora B', color: '#222' }]

  it('cada item é um botão que alterna o filtro', () => {
    const onAlternar = vi.fn()
    render(<LegendaClicavel payload={payload} selecionados={['Incubadora B']} onAlternar={onAlternar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Incubadora A' }))
    expect(onAlternar).toHaveBeenCalledWith('Incubadora A')
    expect(screen.getByRole('button', { name: 'Incubadora B' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('itens que não filtram ficam como texto', () => {
    render(<LegendaClicavel payload={[{ value: 'Em branco', color: '#333' }]} onAlternar={vi.fn()} podeFiltrar={(v) => v !== 'Em branco'} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Em branco')).toBeInTheDocument()
  })
})

describe('valorDaFatia', () => {
  it('lê o valor do payload ou do próprio dado', () => {
    expect(valorDaFatia({ payload: { campus: 'CCN' } }, 'campus')).toBe('CCN')
    expect(valorDaFatia({ campus: 'CCN' }, 'campus')).toBe('CCN')
    expect(valorDaFatia({ name: 'CCN' }, 'campus')).toBe('CCN')
  })
})
