import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useGlobalStore } from '../../context/GlobalContext'

const AppShell = () => {
  const { sidebarCollapsed } = useGlobalStore()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-bg">
      <Sidebar />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: `calc(100vw - ${sidebarCollapsed ? 80 : 220}px)` }}
      >
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
