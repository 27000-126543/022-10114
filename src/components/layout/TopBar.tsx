import { useLocation } from 'react-router-dom'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useGlobalStore } from '../../context/GlobalContext'
import { cn } from '../../lib/utils'

const pathToBreadcrumb: Record<string, string> = {
  '/': '总览大屏',
  '/position': '岗位分析',
  '/project': '项目专题',
  '/complaint': '客诉关联',
  '/profile': '个人画像',
  '/action': '行动清单',
}

const timeRangeOptions = [
  { value: 'week' as const, label: '本周' },
  { value: 'month' as const, label: '本月' },
  { value: 'quarter' as const, label: '近3月' },
]

const storeOptions = [
  { value: 'all', label: '全部门店' },
  { value: 's001', label: '上海旗舰总院' },
  { value: 's002', label: '北京朝阳分院' },
  { value: 's003', label: '广州天河分院' },
  { value: 's004', label: '深圳南山分院' },
]

const TopBar = () => {
  const location = useLocation()
  const { currentUser, selectedStoreId, timeRange, setSelectedStoreId, setTimeRange } = useGlobalStore()

  const currentPageName = pathToBreadcrumb[location.pathname] || '首页'

  return (
    <header className="h-16 bg-white border-b border-neutral-border shadow-[0_2px_8px_rgba(30,58,95,0.04)] flex items-center px-6 gap-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-serif text-brand-indigo-800 text-sm text-neutral-text-tertiary">
          医美训考驾驶舱
        </span>
        <ChevronDown className="w-3 h-3 text-neutral-text-tertiary rotate-[-90deg]" />
        <span className="font-serif text-base font-semibold text-neutral-text-primary">
          {currentPageName}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="flex items-center bg-neutral-bg/50 rounded-pill p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={cn(
                'px-4 py-1.5 rounded-pill text-sm transition-all duration-200',
                timeRange === option.value
                  ? 'bg-white text-brand-indigo-700 font-medium shadow-sm border border-brand-rose-400/60 bg-brand-rose-50/40'
                  : 'text-neutral-text-secondary hover:text-neutral-text-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="appearance-none h-9 pl-4 pr-10 rounded-lg border border-neutral-border bg-white text-sm text-neutral-text-primary cursor-pointer hover:border-brand-indigo-200 focus:outline-none focus:border-brand-indigo-400 focus:ring-2 focus:ring-brand-indigo-100 transition-all"
          >
            {storeOptions.map((store) => (
              <option key={store.value} value={store.value}>
                {store.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-tertiary pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          title="搜索"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-text-secondary hover:bg-neutral-bg hover:text-brand-indigo-600 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          title="通知"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-neutral-text-secondary hover:bg-neutral-bg hover:text-brand-indigo-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-semantic-danger text-white text-[10px] font-medium flex items-center justify-center">
            3
          </span>
        </button>

        <div className="w-px h-6 bg-neutral-border mx-1" />

        <div className="flex items-center gap-2.5 pl-1 cursor-pointer hover:bg-neutral-bg rounded-lg py-1.5 pr-3 -mr-3 transition-colors">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-neutral-border"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-text-primary leading-tight">
              {currentUser.name}
            </span>
            <span className="text-xs text-neutral-text-tertiary leading-tight">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
