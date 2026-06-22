import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReviewComment } from '@/data/types';
import { reviewComments as defaultComments } from '@/data/mock';

interface CommentStore {
  comments: ReviewComment[];
  draft: {
    content: string;
    attachments: string[];
    mentions: string[];
  } | null;
  addComment: (comment: Omit<ReviewComment, 'id' | 'createdAt'>) => void;
  saveDraft: (draft: { content: string; attachments: string[]; mentions: string[] }) => void;
  clearDraft: () => void;
}

export const useCommentStore = create<CommentStore>()(
  persist(
    (set) => ({
      comments: defaultComments,
      draft: null,
      addComment: (comment) =>
        set((state) => ({
          comments: [
            {
              ...comment,
              id: `cmt-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.comments,
          ],
        })),
      saveDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: 'comments_store',
    }
  )
);
