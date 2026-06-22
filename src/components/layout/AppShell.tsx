import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useGlobalStore } from '../../context/GlobalContext'
import MentorshipForm from '@/components/business/MentorshipForm'
import { useBusinessStore } from '@/store'
import { cn } from '@/lib/utils'

const AppShell = () => {
  const { sidebarCollapsed } = useGlobalStore()
  const { mentorshipContext, closeMentorshipForm } = useBusinessStore()

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

      {mentorshipContext.open && (
        <>
          <div
            className={cn('fixed inset-0 bg-black/40 z-50 transition-opacity duration-300')}
            onClick={closeMentorshipForm}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-2xl pointer-events-auto">
              <MentorshipForm />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AppShell
