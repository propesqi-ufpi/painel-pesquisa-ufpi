import { cloneElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BarrasHorizontais from '../../../components/graficos/BarrasHorizontais'

// jsdom não mede layout: o ResponsiveContainer recebe um tamanho fixo.
vi.mock('recharts', async (original) => {
  const real = await original()
  return { ...real, ResponsiveContainer: ({ children }) => cloneElement(children, { width: 400, height: 300 }) }
})

const DADOS = [
  { centro: 'CT', total: 3 },
  { centro: 'Em branco', total: 40 },
  { centro: 'Centro de Ciências da Natureza', total: 12 },
]
const podeFiltrar = (v) => v !== 'Em branco'

describe('BarrasHorizontais', () => {
  it('cada barra filtrável é um botão, em ordem decrescente, e "Em branco" não filtra', () => {
    const onAlternar = vi.fn()
    render(<BarrasHorizontais dados={DADOS} categoria="centro" onAlternar={onAlternar} podeFiltrar={podeFiltrar} />)
    const barras = screen.getAllByRole('button')
    expect(barras.map((b) => b.getAttribute('aria-label').split(':')[0]))
      .toEqual(['Centro de Ciências da Natureza', 'CT'])
    fireEvent.click(barras[1])
    expect(onAlternar).toHaveBeenCalledWith('CT')
  })

  it('o valor vai formatado no rótulo acessível da barra', () => {
    render(
      <BarrasHorizontais
        dados={[{ centro: 'CT', valor_mi: 12.5 }]}
        categoria="centro"
        valor="valor_mi"
        onAlternar={vi.fn()}
        formatarValor={(v) => `R$ ${String(v).replace('.', ',')} Mi`}
      />,
    )
    expect(screen.getByRole('button', { name: /CT: R\$ 12,5 Mi/ })).toBeInTheDocument()
  })

  it('a área de rolagem é marcada para o PNG sair inteiro e respeita a altura máxima', () => {
    const { container } = render(<BarrasHorizontais dados={DADOS} categoria="centro" onAlternar={vi.fn()} alturaMax={120} />)
    const rolagem = container.querySelector('[data-rolagem-grafico]')
    expect(rolagem).toHaveStyle({ maxHeight: '120px' })
    expect(rolagem.firstChild).toHaveStyle({ height: `${DADOS.length * 30 + 8}px` })
  })

  it('sem dados, mostra aviso em vez de gráfico vazio', () => {
    render(<BarrasHorizontais dados={[]} categoria="centro" onAlternar={vi.fn()} />)
    expect(screen.getByText('Sem dados para os filtros escolhidos.')).toBeInTheDocument()
  })
})
