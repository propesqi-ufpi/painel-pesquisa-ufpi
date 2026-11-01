import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarAberta, setSidebarAberta] = useState(false)

  return (
    <div className="flex h-screen bg-fundo">
      <Sidebar
        isOpen={sidebarAberta}
        onClose={() => setSidebarAberta(false)}
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
