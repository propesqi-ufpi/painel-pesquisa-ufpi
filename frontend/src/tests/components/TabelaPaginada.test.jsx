import { render, screen, fireEvent } from '@testing-library/react'
import TabelaPaginada from '../../components/TabelaPaginada'

const colunas = [
  { key: 'nome',  label: 'NOME' },
  { key: 'valor', label: 'VALOR' },
]

const dados = [
  { nome: 'Item A', valor: '100' },
  { nome: 'Item B', valor: '200' },
]

describe('TabelaPaginada', () => {
  it('renderiza headers corretos', () => {
    render(<TabelaPaginada colunas={colunas} dados={dados} />)
    expect(screen.getByText('NOME')).toBeInTheDocument()
    expect(screen.getByText('VALOR')).toBeInTheDocument()
  })

  it('renderiza dados corretamente', () => {
    render(<TabelaPaginada colunas={colunas} dados={dados} />)
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('mostra emptyMessage quando dados vazio', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={[]}
        emptyMessage="Sem registros"
      />
    )
    expect(screen.getByText('Sem registros')).toBeInTheDocument()
  })

  it('mostra mensagem padrão quando dados vazio e sem emptyMessage', () => {
    render(<TabelaPaginada colunas={colunas} dados={[]} />)
    expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument()
  })

  it('botão Anterior chama onAnterior', () => {
    const onAnterior = vi.fn()
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={2}
        totalPaginas={3}
        onAnterior={onAnterior}
        onProxima={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Anterior'))
    expect(onAnterior).toHaveBeenCalledTimes(1)
  })

  it('botão Próxima chama onProxima', () => {
    const onProxima = vi.fn()
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={1}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={onProxima}
      />
    )
    fireEvent.click(screen.getByText('Próxima'))
    expect(onProxima).toHaveBeenCalledTimes(1)
  })

  it('botão Anterior desabilitado na página 1', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={1}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={vi.fn()}
      />
    )
    expect(screen.getByText('Anterior')).toBeDisabled()
  })

  it('botão Próxima desabilitado na última página', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={3}
        totalPaginas={3}
        onAnterior={vi.fn()}
        onProxima={vi.fn()}
      />
    )
    expect(screen.getByText('Próxima')).toBeDisabled()
  })

  it('exibe indicador de página corretamente', () => {
    render(
      <TabelaPaginada
        colunas={colunas}
        dados={dados}
        pagina={2}
        totalPaginas={5}
      />
    )
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  it('col.render é chamado quando fornecido', () => {
    const colunasComRender = [
      { key: 'nome', label: 'NOME', render: (v) => `[${v}]` },
    ]
    render(<TabelaPaginada colunas={colunasComRender} dados={[{ nome: 'Teste' }]} />)
    expect(screen.getByText('[Teste]')).toBeInTheDocument()
  })

  it('mostra travessão para vazio e erro de planilha, com o bruto no tooltip', () => {
    render(<TabelaPaginada colunas={colunas} dados={[{ nome: '#N/D', valor: null }]} />)
    const vazios = screen.getAllByLabelText('Não informado')
    expect(vazios).toHaveLength(2)
    expect(vazios[0].closest('td')).toHaveAttribute('title', '#N/D')
    expect(vazios[1].closest('td')).not.toHaveAttribute('title')
  })

  it('coluna de pessoas exibe o nome sem títulos e guarda o original no tooltip', () => {
    const cols = [{ key: 'coordenador', label: 'COORDENADOR', tipo: 'pessoas' }]
    render(<TabelaPaginada colunas={cols} dados={[{ coordenador: 'PROF. DR. ANA DE SOUSA' }]} />)
    const celula = screen.getByText('Ana de Sousa')
    expect(celula).toHaveAttribute('title', 'PROF. DR. ANA DE SOUSA')
  })

  describe('ordenação pelo cabeçalho', () => {
    const cols = [{ key: 'nome', label: 'NOME' }, { key: 'ano', label: 'ANO', ordenavel: false }]
    const linhas = [{ nome: 'Carla' }, { nome: 'ana' }, { nome: null }, { nome: 'Bruno' }]
    const ordemNaTela = () => screen.getAllByRole('row').slice(1).map((tr) => tr.cells[0].textContent)

    it('clique alterna crescente, decrescente e ordem original', () => {
      render(<TabelaPaginada colunas={cols} dados={linhas} />)
      const th = screen.getByRole('columnheader', { name: /NOME/ })
      const botao = screen.getByRole('button', { name: /NOME/ })
      expect(th).toHaveAttribute('aria-sort', 'none')

      fireEvent.click(botao)
      expect(th).toHaveAttribute('aria-sort', 'ascending')
      expect(ordemNaTela()).toEqual(['ana', 'Bruno', 'Carla', '—'])

      fireEvent.click(botao)
      expect(th).toHaveAttribute('aria-sort', 'descending')
      expect(ordemNaTela()).toEqual(['Carla', 'Bruno', 'ana', '—'])

      fireEvent.click(botao)
      expect(th).toHaveAttribute('aria-sort', 'none')
      expect(ordemNaTela()).toEqual(['Carla', 'ana', '—', 'Bruno'])
    })

    it('ordemInicial já abre ordenada e o clique segue o ciclo dali', () => {
      render(<TabelaPaginada colunas={cols} dados={linhas} ordemInicial={{ key: 'nome', dir: 'asc' }} />)
      const th = screen.getByRole('columnheader', { name: /NOME/ })
      expect(th).toHaveAttribute('aria-sort', 'ascending')
      expect(ordemNaTela()).toEqual(['ana', 'Bruno', 'Carla', '—'])

      fireEvent.click(screen.getByRole('button', { name: /NOME/ }))
      expect(th).toHaveAttribute('aria-sort', 'descending')
    })

    it('coluna com ordenavel: false não tem botão', () => {
      render(<TabelaPaginada colunas={cols} dados={linhas} />)
      expect(screen.queryByRole('button', { name: /ANO/ })).not.toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'ANO' })).not.toHaveAttribute('aria-sort')
    })
  })
})
