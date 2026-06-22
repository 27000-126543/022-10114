import { create } from 'zustand'

type UserRole = '院长' | '店长' | '培训负责人'

interface CurrentUser {
  id: string
  name: string
  role: UserRole
  avatar: string
  storeId?: string
  storeName?: string
}

interface GlobalState {
  currentUser: CurrentUser
  selectedStoreId: string
  timeRange: 'week' | 'month' | 'quarter'
  sidebarCollapsed: boolean
  setCurrentUser: (user: CurrentUser) => void
  setSelectedStoreId: (id: string) => void
  setTimeRange: (range: 'week' | 'month' | 'quarter') => void
  toggleSidebar: () => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  currentUser: {
    id: 'u001',
    name: '张明远',
    role: '院长',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  selectedStoreId: 'all',
  timeRange: 'month',
  sidebarCollapsed: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedStoreId: (id) => set({ selectedStoreId: id }),
  setTimeRange: (range) => set({ timeRange: range }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
