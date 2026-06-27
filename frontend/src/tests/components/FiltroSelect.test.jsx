import { render, screen, fireEvent } from '@testing-library/react'
import FiltroSelect from '../../components/FiltroSelect'

const options = [
  { value: 'a', label: 'Opção A' },
  { value: 'b', label: 'Opção B' },
]

describe('FiltroSelect', () => {
  it('renderiza o label', () => {
    render(<FiltroSelect label="Centro" value={[]} onChange={() => {}} options={options} />)
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('mostra "Todos" no botão quando nenhuma opção está selecionada', () => {
    render(<FiltroSelect label="X" value={[]} onChange={() => {}} options={options} />)
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
  })

  it('abre o dropdown e exibe as opções ao clicar no botão', () => {
    render(<FiltroSelect label="X" value={[]} onChange={() => {}} options={options} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Opção A')).toBeInTheDocument()
    expect(screen.getByText('Opção B')).toBeInTheDocument()
  })

  it('exibe "Selecionar todos" no dropdown quando há opções', () => {
    render(<FiltroSelect label="X" value={[]} onChange={() => {}} options={options} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Selecionar todos')).toBeInTheDocument()
  })

  it('chama onChange com array ao clicar em uma opção', () => {
    const onChange = vi.fn()
    render(<FiltroSelect label="X" value={[]} onChange={onChange} options={options} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByLabelText('Opção A'))
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('chama onChange com todas as opções ao clicar em "Selecionar todos"', () => {
    const onChange = vi.fn()
    render(<FiltroSelect label="X" value={[]} onChange={onChange} options={options} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByLabelText('Selecionar todos'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('desabilita o botão quando disabled=true', () => {
    render(<FiltroSelect label="X" value={[]} onChange={() => {}} options={options} disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('não renderiza label quando prop não é passada', () => {
    const { container } = render(
      <FiltroSelect value={[]} onChange={() => {}} options={[]} />
    )
    expect(container.querySelector('label')).toBeNull()
  })

  it('mostra o label da opção quando exatamente uma está selecionada', () => {
    render(<FiltroSelect label="X" value={['b']} onChange={() => {}} options={options} />)
    expect(screen.getByRole('button', { name: /opção b/i })).toBeInTheDocument()
  })

  it('mostra "N selecionados" quando mais de uma opção está selecionada', () => {
    render(<FiltroSelect label="X" value={['a', 'b']} onChange={() => {}} options={options} />)
    expect(screen.getByRole('button', { name: /2 selecionados/i })).toBeInTheDocument()
  })
})
