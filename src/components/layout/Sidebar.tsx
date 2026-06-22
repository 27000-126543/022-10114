import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  AlertTriangle,
  UserCircle2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useGlobalStore } from '../../context/GlobalContext'
import { cn } from '../../lib/utils'

const navItems = [
  { id: 'dashboard', label: '总览大屏', icon: LayoutDashboard, path: '/' },
  { id: 'position', label: '岗位分析', icon: Users, path: '/position' },
  { id: 'project', label: '项目专题', icon: FolderKanban, path: '/project' },
  { id: 'complaint', label: '客诉关联', icon: AlertTriangle, path: '/complaint' },
  { id: 'profile', label: '个人画像', icon: UserCircle2, path: '/profile' },
  { id: 'action', label: '行动清单', icon: ClipboardList, path: '/action' },
]

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, sidebarCollapsed, toggleSidebar } = useGlobalStore()

  const handleNavClick = (path: string) => {
    if (path === '/profile') {
      navigate('/profile', { state: { employeeId: 'e001' } })
    } else {
      navigate(path)
    }
  }

  return (
    <aside
      className={cn(
        'relative h-screen bg-white border-r border-neutral-border flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-[80px]' : 'w-[220px]'
      )}
    >
      <div className={cn('flex items-center justify-center h-16 border-b border-neutral-border', sidebarCollapsed ? 'px-2' : 'px-5')}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-indigo flex items-center justify-center flex-shrink-0">
            <span className="text-white font-serif font-bold text-sm">医</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif font-bold text-brand-indigo-800 text-base whitespace-nowrap">
                医美训考驾驶舱
              </span>
              <div className="h-[2px] w-full bg-gradient-rose-gold rounded-full mt-0.5" />
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-text-secondary transition-all duration-200 relative group',
                    'hover:bg-brand-indigo-50 hover:text-brand-indigo-700',
                    isActive && 'bg-brand-indigo-50 text-brand-indigo-700 font-medium',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-brand-rose-300 via-brand-rose-500 to-brand-rose-700 rounded-r-full" />
                  )}
                  {!isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-brand-rose-300 via-brand-rose-500 to-brand-rose-700 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-brand-indigo-600')} />
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('border-t border-neutral-border p-3', sidebarCollapsed ? 'px-2' : 'px-4')}>
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          className="w-full flex items-center justify-center p-2 mb-2 rounded-lg text-neutral-text-tertiary hover:bg-brand-indigo-50 hover:text-brand-indigo-600 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-neutral-bg/60 hover:bg-brand-indigo-50/50 transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-neutral-text-primary truncate">
                {currentUser.name}
              </span>
              <span className="text-xs text-neutral-text-tertiary truncate">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
