import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus, CheckCircle2, Clock, AlertTriangle, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { employees, positions } from '@/data/mock';
import type { RemedialPriority, RemedialKnowledgePoint } from '@/data/types';

export type RemedialStatus = 'pending' | 'scheduled' | 'completed';

export interface ConfirmedRemedialItem {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  storeName: string;
  knowledgePoints: RemedialKnowledgePoint[];
  relatedComplaintType?: string;
  recommendedAction: string;
  priority: RemedialPriority;
  status: RemedialStatus;
  mentorName?: string;
  nextExamDate?: string;
  examScore?: number;
  level?: string;
}

interface RemedialKanbanCardProps {
  item: ConfirmedRemedialItem;
  index: number;
  onScheduleMentorship: (id: string) => void;
}

const priorityStyles: Record<RemedialPriority, string> = {
  high: 'bg-semantic-dangerLight text-semantic-danger border border-semantic-danger/30',
  medium: 'bg-semantic-warningLight text-semantic-warning border border-semantic-warning/30',
  low: 'bg-semantic-successLight text-semantic-success border border-semantic-success/30',
};

const priorityLabel: Record<RemedialPriority, string> = {
  high: '高优先',
  medium: '中优先',
  low: '低优先',
};

const actionTypeMap = (action: string): { label: string; cls: string; icon: React.ElementType } => {
  if (action.includes('补考') || action.includes('自学') || action.includes('重新')) {
    return { label: '重学', cls: 'bg-semantic-infoLight text-semantic-info', icon: BookOpen };
  }
  if (action.includes('带教')) {
    return { label: '带教', cls: 'bg-brand-rose-50 text-brand-rose-700 border border-brand-rose-200', icon: GraduationCap };
  }
  return { label: '重考', cls: 'bg-brand-purple-500/10 text-brand-purple-600', icon: Eye };
};

const levelColors: Record<string, string> = {
  S: 'bg-gradient-rose-gold text-white',
  A: 'bg-brand-indigo-100 text-brand-indigo-700',
  B: 'bg-brand-purple-100 text-brand-purple-600',
  C: 'bg-neutral-border text-neutral-text-secondary',
};

export default function RemedialKanbanCard({ item, index, onScheduleMentorship }: RemedialKanbanCardProps) {
  const navigate = useNavigate();
  const emp = employees.find(e => e.id === item.employeeId);
  const pos = positions.find(p => p.name === item.position);
  const action = actionTypeMap(item.recommendedAction);
  const ActionIcon = action.icon;

  const renderStatus = () => {
    switch (item.status) {
      case 'pending':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-text-tertiary">
              <Clock size={12} />
              <span className="text-[11px] font-medium">未安排</span>
            </div>
            <button
              onClick={() => onScheduleMentorship(item.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <UserPlus size={11} />
              安排带教
            </button>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-semantic-success">
              <CheckCircle2 size={12} />
              <span className="text-[11px] font-semibold">已安排</span>
              <span className="text-[11px] text-neutral-text-secondary">
                导师: {item.mentorName}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-pill bg-semantic-successLight text-semantic-success font-medium">
              考核: {item.nextExamDate}
            </span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-brand-indigo-700">
              <CheckCircle2 size={12} />
              <span className="text-[11px] font-bold">已完成</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-pill bg-brand-indigo-50 text-brand-indigo-700 font-bold">
              成绩: {item.examScore}分
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-white shadow-card border border-neutral-border overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={emp?.avatar}
              alt={item.employeeName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-text-primary">{item.employeeName}</span>
                {item.level && (
                  <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold', levelColors[item.level])}>
                    {item.level}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-px rounded font-medium" style={{ background: pos ? `${pos.color}18` : 'transparent', color: pos?.color }}>
                  {item.position}
                </span>
                <span className="text-[9px] text-neutral-text-tertiary">{item.storeName.slice(0, 5)}</span>
              </div>
            </div>
          </div>
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', priorityStyles[item.priority])}>
            <AlertTriangle size={9} />
            {priorityLabel[item.priority]}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {item.knowledgePoints.slice(0, 3).map((kp, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-semantic-warningLight/70 text-semantic-warning border border-semantic-warning/20 max-w-[130px] truncate">
                {kp.name.length > 10 ? kp.name.slice(0, 10) + '…' : kp.name}
              </span>
            ))}
            {item.knowledgePoints.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-neutral-border/70 text-neutral-text-primary">
                +{item.knowledgePoints.length - 3}
              </span>
            )}
          </div>

          {item.relatedComplaintType && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-semantic-dangerLight text-semantic-danger border border-semantic-danger/20">
                <AlertTriangle size={9} />
                {item.relatedComplaintType}
              </span>
            </div>
          )}

          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold', action.cls)}>
            <ActionIcon size={10} />
            {action.label}
          </span>
        </div>

        <div className="pt-3 border-t border-neutral-border/50 flex items-center justify-between">
          {renderStatus()}
          <button
            onClick={() => navigate(`/profile/${item.employeeId}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-brand-indigo-700 bg-brand-indigo-50 hover:bg-brand-indigo-100 transition-colors border border-brand-indigo-100"
          >
            <Eye size={11} />
            画像
          </button>
        </div>
      </div>
    </div>
  );
}
