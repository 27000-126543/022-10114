import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RemedialPriority, RemedialKnowledgePoint, RemedialListItem } from '@/data/types';
import { remedialList } from '@/data/mock';

export type RemedialStatus = 'pending' | 'scheduled' | 'completed';

export interface MentorshipContextMeta {
  projectName?: string;
  complaintType?: string;
  knowledgePointNames?: string[];
  source: 'project' | 'complaint' | 'profile' | 'action';
  sourceId?: string;
}

export interface MentorshipContext {
  open: boolean;
  menteeId: string;
  preSelectedKnowledgePointIds: string[];
  contextMeta: MentorshipContextMeta | null;
}

export interface ConfirmedRemedialItem {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  storeName: string;
  knowledgePoints: RemedialKnowledgePoint[];
  recommendedAction: string;
  priority: RemedialPriority;
  status: RemedialStatus;
  mentorId?: string;
  startDate?: string;
  nextExamDate?: string;
}

export interface MentorshipPlan {
  id: string;
  menteeId: string;
  mentorId: string;
  knowledgePointIds: string[];
  startDate: string;
  nextExamDate: string;
  planNotes: string;
  createdAt: string;
  contextMeta?: MentorshipContextMeta | null;
}

interface BusinessState {
  mentorshipContext: MentorshipContext;
  confirmedRemedialList: ConfirmedRemedialItem[];
  mentorshipPlans: MentorshipPlan[];
}

interface BusinessActions {
  openMentorshipForm: (payload: {
    menteeId: string;
    preSelectedKnowledgePointIds: string[];
    contextMeta: MentorshipContextMeta;
  }) => void;
  closeMentorshipForm: () => void;
  confirmRemedialItems: (ids: string[]) => void;
  removeRemedialItem: (id: string) => void;
  addMentorshipPlan: (data: Omit<MentorshipPlan, 'id' | 'createdAt'>) => void;
  updateRemedialStatus: (id: string, status: RemedialStatus) => void;
}

const initialMentorshipContext: MentorshipContext = {
  open: false,
  menteeId: '',
  preSelectedKnowledgePointIds: [],
  contextMeta: null,
};

export const useBusinessStore = create<BusinessState & BusinessActions>()(
  persist(
    (set, get) => ({
      mentorshipContext: initialMentorshipContext,
      confirmedRemedialList: [],
      mentorshipPlans: [],

      openMentorshipForm: (payload) => {
        set({
          mentorshipContext: {
            open: true,
            menteeId: payload.menteeId,
            preSelectedKnowledgePointIds: payload.preSelectedKnowledgePointIds,
            contextMeta: payload.contextMeta,
          },
        });
      },

      closeMentorshipForm: () => {
        set({
          mentorshipContext: initialMentorshipContext,
        });
      },

      confirmRemedialItems: (ids) => {
        const { confirmedRemedialList } = get();
        const existingIds = new Set(confirmedRemedialList.map(item => item.id));
        const newItems = ids
          .filter(id => !existingIds.has(id))
          .map(id => {
            const sourceItem = remedialList.find(r => r.id === id);
            if (!sourceItem) {
              return {
                id,
                employeeId: '',
                employeeName: '',
                position: '',
                storeName: '',
                knowledgePoints: [],
                recommendedAction: '',
                priority: 'medium' as RemedialPriority,
                status: 'pending' as RemedialStatus,
              };
            }
            return {
              id: sourceItem.id,
              employeeId: sourceItem.employeeId,
              employeeName: sourceItem.employeeName,
              position: sourceItem.position,
              storeName: sourceItem.storeName,
              knowledgePoints: sourceItem.knowledgePoints,
              recommendedAction: sourceItem.recommendedAction,
              priority: sourceItem.priority,
              status: 'pending' as RemedialStatus,
            };
          });
        set({
          confirmedRemedialList: [...confirmedRemedialList, ...newItems],
        });
      },

      removeRemedialItem: (id) => {
        set((state) => ({
          confirmedRemedialList: state.confirmedRemedialList.filter(item => item.id !== id),
        }));
      },

      addMentorshipPlan: (data) => {
        const newPlan: MentorshipPlan = {
          ...data,
          id: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          mentorshipPlans: [...state.mentorshipPlans, newPlan],
          confirmedRemedialList: state.confirmedRemedialList.map(item =>
            item.employeeId === data.menteeId
              ? { ...item, status: 'scheduled' as RemedialStatus, mentorId: data.mentorId, startDate: data.startDate, nextExamDate: data.nextExamDate }
              : item
          ),
        }));
      },

      updateRemedialStatus: (id, status) => {
        set((state) => ({
          confirmedRemedialList: state.confirmedRemedialList.map(item =>
            item.id === id ? { ...item, status } : item
          ),
        }));
      },
    }),
    {
      name: 'business_store',
      partialize: (state) => ({
        confirmedRemedialList: state.confirmedRemedialList,
        mentorshipPlans: state.mentorshipPlans,
      }),
    }
  )
);
