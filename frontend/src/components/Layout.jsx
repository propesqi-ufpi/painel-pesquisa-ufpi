import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSidebarRecolhida } from '../utils/useSidebarRecolhida'

export default function Layout() {
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [recolhida, alternarRecolhida] = useSidebarRecolhida()

  return (
    <div className="flex h-screen bg-fundo">
      <Sidebar
        isOpen={sidebarAberta}
        onClose={() => setSidebarAberta(false)}
        recolhida={recolhida}
        onAlternarRecolhida={alternarRecolhida}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarAberta(true)} />
        {/* A página rola aqui. Páginas só de gráficos ocupam a tela a partir de lg;
            as com tabela rolam, e a tabela rola por dentro (ver index.css). */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
