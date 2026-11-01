import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BotaoExportarPNG from '../../components/BotaoExportarPNG'

describe('BotaoExportarPNG', () => {
  it('renderiza o botão com texto PNG', () => {
    render(<BotaoExportarPNG refGrafico={{ current: null }} nomeArquivo="grafico" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('button').textContent).toContain('PNG')
  })

  it('não lança erro quando refGrafico.current é null', () => {
    render(<BotaoExportarPNG refGrafico={{ current: null }} nomeArquivo="grafico" />)
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })

  it('chama html2canvas ao clicar com ref válida', async () => {
    const html2canvas = (await import('html2canvas')).default
    const div = document.createElement('div')
    render(<BotaoExportarPNG refGrafico={{ current: div }} nomeArquivo="grafico" />)
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(html2canvas).toHaveBeenCalledWith(div, expect.objectContaining({ useCORS: true, backgroundColor: expect.any(String) }))
    )
  })

  it('cria link de download com extensão .png', async () => {
    const html2canvas = (await import('html2canvas')).default
    html2canvas.mockResolvedValue({ toDataURL: () => 'data:image/png;base64,abc' })

    const div = document.createElement('div')
    const mockAnchor = { href: '', download: '', click: vi.fn() }

    // Use mockImplementation so only createElement('a') is intercepted
    const origCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...args) =>
      tag === 'a' ? mockAnchor : origCreate(tag, ...args)
    )

    render(<BotaoExportarPNG refGrafico={{ current: div }} nomeArquivo="meu_grafico" />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => expect(mockAnchor.click).toHaveBeenCalled())
    expect(mockAnchor.download).toMatch(/^meu_grafico_/)
    expect(mockAnchor.download).toMatch(/\.png$/)

    vi.restoreAllMocks()
  })
})
