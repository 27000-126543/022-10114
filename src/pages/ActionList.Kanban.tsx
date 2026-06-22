import React, { useState, useMemo } from 'react';
import { LayoutGrid, Search, FileDown, Users, Flag, GraduationCap, CheckCircle2, Target, Store, BookOpen, Inbox, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import KPICard from '@/components/common/KPICard';
import RemedialKanbanCard, { type ConfirmedRemedialItem, type RemedialStatus } from '@/components/business/RemedialKanbanCard';
import { useBusinessStore } from '@/store/businessStore';
import { remedialList, employees, stores, positions, complaints } from '@/data/mock';
import { useNavigate } from 'react-router-dom';

type GroupBy = 'priority' | 'store' | 'position';

const ensureFullData = (storeList: ConfirmedRemedialItem[]): ConfirmedRemedialItem[] => {
  return storeList.map(item => {
    if (item.employeeId && item.employeeName) return item;
    const sourceItem = remedialList.find(r => r.id === item.id);
    if (!sourceItem) return item;
    return {
      ...item,
      employeeId: sourceItem.employeeId,
      employeeName: sourceItem.employeeName,
      position: sourceItem.position,
      storeName: sourceItem.storeName,
      knowledgePoints: sourceItem.knowledgePoints,
      recommendedAction: sourceItem.recommendedAction,
      priority: sourceItem.priority,
    };
  });
};

const priorityGroups = [
  { key: 'high', label: '高优先级', color: 'text-semantic-danger', bg: 'bg-semantic-dangerLight' },
  { key: 'medium', label: '中优先级', color: 'text-semantic-warning', bg: 'bg-semantic-warningLight' },
  { key: 'low', label: '低优先级', color: 'text-semantic-success', bg: 'bg-semantic-successLight' },
];

const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="w-full h-1.5 rounded-full bg-neutral-border/50 overflow-hidden">
    <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} />
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-neutral-bg/50 flex items-center justify-center mb-3">
      <Inbox size={28} className="text-neutral-text-tertiary" />
    </div>
    <p className="text-sm text-neutral-text-tertiary">{message}</p>
  </div>
);

const GroupHeaderCard: React.FC<{
  label: string;
  count: number;
  completionRate: number;
  color: string;
  bg: string;
}> = ({ label, count, completionRate, color, bg }) => (
  <div className="rounded-xl bg-white shadow-card border border-neutral-border p-4 mb-4 sticky top-0 z-10">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', bg, color)} />
        <h3 className="text-sm font-bold text-neutral-text-primary">{label}</h3>
      </div>
      <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold', bg, color)}>
        {count} 人
      </span>
    </div>
    <div className="flex items-center justify-between gap-3">
      <ProgressBar value={completionRate} color={bg.replace('Light', '')} />
      <span className="text-[11px] font-bold text-neutral-text-secondary whitespace-nowrap">
        {completionRate}%
      </span>
    </div>
  </div>
);

export default function ActionListKanban() {
  const navigate = useNavigate();
  const { confirmedRemedialList, openMentorshipForm, updateRemedialStatus } = useBusinessStore();
  const [groupBy, setGroupBy] = useState<GroupBy>('priority');
  const [searchTerm, setSearchTerm] = useState('');

  const fullList = useMemo(() => ensureFullData(confirmedRemedialList), [confirmedRemedialList]);

  const enrichedList = useMemo<ConfirmedRemedialItem[]>(() => {
    const mentorPool = employees.filter(e => e.level === 'S' || e.level === 'A');
    return fullList.map((item, idx) => {
      const mentor = mentorPool[idx % mentorPool.length];
      const emp = employees.find(e => e.id === item.employeeId);
      const complaint = complaints.find(c => c.employeeId === item.employeeId);
      const plan = useBusinessStore.getState().mentorshipPlans.find(p => p.menteeId === item.employeeId);
      const mentorEmp = plan ? employees.find(e => e.id === plan.mentorId) : null;

      return {
        ...item,
        relatedComplaintType: complaint?.type,
        level: emp?.level,
        mentorName: item.status !== 'pending' ? (mentorEmp?.name || mentor.name) : undefined,
        nextExamDate: item.status === 'scheduled' ? (plan?.nextExamDate?.slice(5) || `06-${String(25 + (idx % 5)).padStart(2, '0')}`) : undefined,
        examScore: item.status === 'completed' ? 85 + (idx % 15) : undefined,
      };
    });
  }, [fullList]);

  const stats = useMemo(() => {
    const list = enrichedList;
    const total = list.length;
    const highPriority = list.filter(i => i.priority === 'high').length;
    const scheduled = list.filter(i => i.status === 'scheduled').length;
    const completed = list.filter(i => i.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const estimatedRate = Math.min(100, completionRate + Math.round((scheduled / Math.max(1, total)) * 40));

    return { total, highPriority, scheduled, completed, completionRate, estimatedRate };
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    if (!searchTerm) return enrichedList;
    const term = searchTerm.toLowerCase();
    return enrichedList.filter(i =>
      i.employeeName.toLowerCase().includes(term) ||
      i.position.toLowerCase().includes(term) ||
      i.storeName.toLowerCase().includes(term)
    );
  }, [enrichedList, searchTerm]);

  const groups = useMemo(() => {
    if (groupBy === 'priority') {
      return priorityGroups.map(g => ({
        ...g,
        items: filteredList.filter(i => i.priority === g.key),
      }));
    }
    if (groupBy === 'store') {
      return stores.map(s => {
        const items = filteredList.filter(i => i.storeName === s.name);
        const completed = items.filter(i => i.status === 'completed').length;
        return {
          key: s.id,
          label: s.name,
          color: 'text-brand-indigo-700',
          bg: 'bg-brand-indigo-50',
          items,
          completionRate: items.length > 0 ? Math.round((completed / items.length) * 100) : 0,
        };
      });
    }
    return positions.map(p => {
      const items = filteredList.filter(i => i.position === p.name);
      const completed = items.filter(i => i.status === 'completed').length;
      return {
        key: p.id,
        label: p.name,
        color: 'text-brand-rose-600',
        bg: 'bg-brand-rose-50',
        items,
        completionRate: items.length > 0 ? Math.round((completed / items.length) * 100) : 0,
      };
    });
  }, [filteredList, groupBy]);

  const handleScheduleMentorship = (id: string) => {
    const item = enrichedList.find(i => i.id === id);
    if (!item) return;
    openMentorshipForm({
      menteeId: item.employeeId,
      preSelectedKnowledgePointIds: item.knowledgePoints.map(kp => kp.id),
      contextMeta: {
        projectName: item.relatedComplaintType,
        knowledgePointNames: item.knowledgePoints.map(kp => kp.name),
        source: 'action',
        sourceId: item.id,
      },
    });
  };

  const handleExport = () => {
    console.log('导出Excel:', enrichedList);
    const exportData = enrichedList.map(i => ({
      '员工姓名': i.employeeName,
      '岗位': i.position,
      '门店': i.storeName,
      '优先级': i.priority === 'high' ? '高' : i.priority === 'medium' ? '中' : '低',
      '缺口知识点': i.knowledgePoints.map(kp => kp.name).join('; '),
      '关联客诉': i.relatedComplaintType || '-',
      '建议动作': i.recommendedAction,
      '状态': i.status === 'pending' ? '未安排' : i.status === 'scheduled' ? '已安排' : '已完成',
      '带教导师': i.mentorName || '-',
      '考核日期': i.nextExamDate || '-',
    }));
    console.table(exportData);
  };

  const gridColsClass = groupBy === 'priority'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : groupBy === 'store'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5';

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-brand-rose-500" />
            <h2 className="text-lg font-bold font-serif text-brand-indigo-800">下周补训计划看板</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-neutral-bg/60 rounded-lg p-1">
              {[
                { key: 'priority' as GroupBy, label: '按优先级', icon: Flag },
                { key: 'store' as GroupBy, label: '按门店', icon: Store },
                { key: 'position' as GroupBy, label: '按岗位', icon: BookOpen },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setGroupBy(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150',
                    groupBy === key
                      ? 'bg-white text-brand-rose-700 shadow-sm'
                      : 'text-neutral-text-tertiary hover:text-neutral-text-primary'
                  )}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-widget border border-neutral-border bg-white">
              <Search size={13} className="text-neutral-text-tertiary" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索姓名/门店/岗位"
                className="text-xs w-40 bg-transparent outline-none placeholder:text-neutral-text-tertiary"
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-brand-indigo-700 bg-brand-indigo-50 border border-brand-indigo-100 hover:bg-brand-indigo-100 transition-colors"
            >
              <FileDown size={13} />
              导出Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <KPICard title="待补训总人数" value={stats.total} unit="人" variant="info" icon={Users} delay={0} />
        <KPICard title="高优先级" value={stats.highPriority} unit="人" variant="danger" icon={Flag} delay={50} />
        <KPICard title="已安排带教" value={stats.scheduled} unit="人" variant="warning" icon={GraduationCap} delay={100} />
        <KPICard title="已完成考核" value={stats.completed} unit="人" variant="success" icon={CheckCircle2} delay={150} />
        <KPICard title="本周预计完成率" value={stats.estimatedRate} format="percent" variant="info" icon={Target} delay={200} />
      </div>

      <div className={cn('grid gap-4', gridColsClass)}>
        {groups.map(group => {
          const completedCount = group.items.filter(i => i.status === 'completed').length;
          const completionRate = group.items.length > 0 ? Math.round((completedCount / group.items.length) * 100) : 0;

          return (
            <div key={group.key} className="min-h-[200px]">
              <GroupHeaderCard
                label={group.label}
                count={group.items.length}
                completionRate={completionRate}
                color={group.color}
                bg={group.bg}
              />
              {group.items.length === 0 ? (
                <EmptyState message="暂无补训人员" />
              ) : (
                <div className="space-y-3">
                  {group.items.map((item, idx) => (
                    <RemedialKanbanCard
                      key={item.id}
                      item={item}
                      index={idx}
                      onScheduleMentorship={handleScheduleMentorship}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
