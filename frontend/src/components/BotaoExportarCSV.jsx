import { valorExibicao } from '../utils/exibicao'

function dataHoje() {
  const d = new Date()
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('-')
}

function escaparCelula(val) {
  const str = String(val ?? '')
  return str.includes(',') || str.includes('\n') || str.includes('"')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

export default function BotaoExportarCSV({ dados = [], nomeArquivo = 'export', colunas = [] }) {
  function exportar() {
    const header = colunas.map((c) => c.label).join(',')
    const linhas = dados.map((linha) =>
      colunas.map((c) => escaparCelula(valorExibicao(c, linha))).join(',')
    )
    const csv = [header, ...linhas].join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nomeArquivo}_${dataHoje()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportar}
      className="px-2 py-1 text-xs border border-borda rounded hover:bg-azul-suave transition-colors"
    >
      ⬇ CSV
    </button>
  )
}
