import { Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import { lerCoresGrafico } from '../utils/coresGrafico'

function dataHoje() {
  const d = new Date()
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('-')
}

export default function BotaoExportarPNG({ refGrafico, nomeArquivo = 'grafico' }) {
  async function exportar() {
    if (!refGrafico?.current) return
    const canvas = await html2canvas(refGrafico.current, {
      useCORS: true,
      // Fundo do tema atual, para o PNG sair como aparece na tela.
      backgroundColor: lerCoresGrafico().superficie,
    })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${nomeArquivo}_${dataHoje()}.png`
    a.click()
  }

  return (
    <button
      onClick={exportar}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-borda rounded hover:bg-azul-suave transition-colors"
    >
      <Download className="w-3.5 h-3.5" aria-hidden="true" />
      PNG
    </button>
  )
}
