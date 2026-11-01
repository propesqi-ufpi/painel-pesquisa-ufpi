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
        <main className="flex-1 overflow-hidden p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
