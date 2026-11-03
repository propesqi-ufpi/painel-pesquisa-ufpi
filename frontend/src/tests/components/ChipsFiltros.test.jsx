import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ChipsFiltros from '../../components/ChipsFiltros'

function Pagina({ inicial = { area: ['Engenharias'], centro: ['CT', 'CCN'] } }) {
  const [area, setArea] = useState(inicial.area)
  const [centro, setCentro] = useState(inicial.centro)
  const campos = [
    { rotulo: 'Área', valor: area, alterar: setArea, opcoes: [{ value: 'Engenharias', label: 'Engenharias' }] },
    { rotulo: 'Centro', valor: centro, alterar: setCentro },
  ]
  return <ChipsFiltros campos={campos} onLimpar={() => { setArea([]); setCentro([]) }} />
}

describe('ChipsFiltros', () => {
  it('mostra um chip por valor ativo e anuncia a quantidade', () => {
    render(<Pagina />)
    const grupo = screen.getByRole('group', { name: 'Filtros ativos' })
    expect(grupo).toHaveTextContent('Área:Engenharias')
    expect(screen.getByRole('button', { name: 'Remover filtro Centro: CT' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('3 filtros ativos')
  })

  it('remover um chip tira só aquele valor e leva o foco ao chip seguinte', () => {
    render(<Pagina />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover filtro Centro: CT' }))
    expect(screen.queryByRole('button', { name: 'Remover filtro Centro: CT' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Remover filtro Centro: CCN' })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('2 filtros ativos')
  })

  it('remover o último chip da fila leva o foco a "Limpar filtros"', () => {
    render(<Pagina />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover filtro Centro: CCN' }))
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toHaveFocus()
  })

  it('remover o único chip esconde a faixa e anuncia que não há filtro', () => {
    render(<Pagina inicial={{ area: ['Engenharias'], centro: [] }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover filtro Área: Engenharias' }))
    expect(screen.queryByRole('group', { name: 'Filtros ativos' })).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum filtro ativo')
  })

  it('"Limpar filtros" remove tudo e a faixa some', () => {
    render(<Pagina />)
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.queryByRole('group', { name: 'Filtros ativos' })).toBeNull()
  })

  it('sem filtro ativo não ocupa espaço', () => {
    render(<Pagina inicial={{ area: [], centro: [] }} />)
    expect(screen.queryByRole('group')).toBeNull()
  })
})
