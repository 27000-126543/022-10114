import React, { useState, useMemo } from 'react';
import {
  Search, Filter, UserCheck, Clock, CheckCircle2, Calendar,
  ChevronRight, Plus, BookOpen, Award, Store, Users,
  X, MessageSquare, GraduationCap, TrendingUp, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStore, type MentorshipPlan, type RemedialStatus } from '@/store/businessStore';
import { employees, stores, knowledgePoints } from '@/data/mock';
import KPICard from '@/components/common/KPICard';

const statusMap: Record<RemedialStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待安排', color: 'text-neutral-text-secondary', bg: 'bg-neutral-border' },
  scheduled: { label: '带教中', color: 'text-brand-rose-600', bg: 'bg-brand-rose-50 border-brand-rose-200' },
  completed: { label: '已完成', color: 'text-semantic-success', bg: 'bg-semantic-successLight border-semantic-success/30' },
};

function formatDate(iso: string): string {
  return iso.split('T')[0];
}

function formatDateShort(iso: string): string {
  return iso.slice(5, 10);
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.ceil((e - s) / 86400000);
}

const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = 'bg-gradient-rose-gold' }) => (
  <div className="w-full h-1.5 rounded-full bg-neutral-border/50 overflow-hidden">
    <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} />
  </div>
);

const PlanCard: React.FC<{
  plan: MentorshipPlan;
  onViewDetail: (plan: MentorshipPlan) => void;
}> = ({ plan, onViewDetail }) => {
  const mentor = employees.find(e => e.id === plan.mentorId);
  const mentee = employees.find(e => e.id === plan.menteeId);
  const store = stores.find(s => s.id === mentee?.storeId);
  const kps = plan.knowledgePointIds.map(id => knowledgePoints.find(k => k.id === id)).filter(Boolean);
  const status = statusMap[plan.status];
  const totalDays = daysBetween(plan.startDate, plan.nextExamDate);
  const passedDays = daysBetween(plan.startDate, new Date().toISOString());
  const progress = Math.min(100, Math.max(0, plan.status === 'completed' ? 100 : Math.round((passedDays / totalDays) * 100)));

  return (
    <div
      className="rounded-card border border-neutral-border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden card-hover cursor-pointer"
      onClick={() => onViewDetail(plan)}
    >
      <div className="px-4 py-3 bg-gradient-to-r from-neutral-bg/40 to-transparent border-b border-neutral-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-indigo/10 flex items-center justify-center">
            <GraduationCap size={14} className="text-brand-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-text-primary">{mentee?.name || '未知学员'}</p>
            <p className="text-[10px] text-neutral-text-tertiary flex items-center gap-1">
              <Store size={9} />{store?.name || '未知门店'}
            </p>
          </div>
        </div>
        <span className={cn('px-2 py-0.5 rounded-pill text-[10px] font-bold border', status.bg, status.color)}>
          {status.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <UserCheck size={12} className="text-brand-rose-500" />
          <span className="text-neutral-text-secondary">导师：</span>
          <span className="font-medium text-neutral-text-primary">{mentor?.name || '未指派'}</span>
          {mentor?.level && <span className="text-[10px] px-1.5 py-px rounded bg-brand-rose-50 text-brand-rose-600">{mentor.level}级</span>}
        </div>

        <div>
          <p className="text-[11px] text-neutral-text-tertiary mb-1.5 flex items-center gap-1">
            <BookOpen size={11} /> 带教知识点
          </p>
          <div className="flex flex-wrap gap-1">
            {kps.slice(0, 3).map(kp => (
              <span key={kp!.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-brand-indigo-50 text-brand-indigo-700 border border-brand-indigo-100/50 line-clamp-1 max-w-[120px]">
                {kp!.name}
              </span>
            ))}
            {kps.length > 3 && <span className="text-[9px] text-neutral-text-tertiary">+{kps.length - 3}</span>}
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-border/50 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-text-tertiary flex items-center gap-1">
              <Calendar size={10} /> {formatDateShort(plan.startDate)} ~ {formatDateShort(plan.nextExamDate)}
            </span>
            <span className="font-semibold text-brand-indigo-700">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {plan.examScore !== undefined && (
          <div className="flex items-center gap-1.5 pt-1">
            <Award size={12} className="text-semantic-success" />
            <span className="text-xs font-bold text-semantic-success">考核分：{plan.examScore}分</span>
          </div>
        )}

        {plan.progressNotes.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <MessageSquare size={12} className="text-brand-indigo-500" />
            <span className="text-[11px] text-neutral-text-secondary">{plan.progressNotes.length}条阶段备注</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 bg-neutral-bg/30 border-t border-neutral-border/40 flex items-center justify-between">
        <span className="text-[10px] text-neutral-text-tertiary">点击查看详情</span>
        <ChevronRight size={14} className="text-neutral-text-tertiary" />
      </div>
    </div>
  );
};

const PlanDetailDrawer: React.FC<{
  plan: MentorshipPlan | null;
  onClose: () => void;
}> = ({ plan, onClose }) => {
  const { addProgressNote, completeMentorship } = useBusinessStore();
  const [newNote, setNewNote] = useState('');
  const [examScore, setExamScore] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  if (!plan) return null;

  const mentor = employees.find(e => e.id === plan.mentorId);
  const mentee = employees.find(e => e.id === plan.menteeId);
  const store = stores.find(s => s.id === mentee?.storeId);
  const kps = plan.knowledgePointIds.map(id => knowledgePoints.find(k => k.id === id)).filter(Boolean);
  const status = statusMap[plan.status];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addProgressNote(plan.id, newNote.trim());
    setNewNote('');
  };

  const handleComplete = () => {
    const score = parseInt(examScore, 10);
    if (isNaN(score) || score < 0 || score > 100) return;
    completeMentorship(plan.id, score);
    setShowCompleteForm(false);
    setExamScore('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[420px] max-w-[92vw] h-full bg-white shadow-xl animate-slide-in-right flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-brand-rose-50/70 to-brand-indigo-50/50 flex-shrink-0">
          <div>
            <h3 className="font-serif text-section-title text-neutral-text-primary">带教进度详情</h3>
            <p className="text-caption text-neutral-text-secondary mt-0.5">{mentee?.name} 的带教计划</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-border/60 flex items-center justify-center text-neutral-text-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={mentee?.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              <div>
                <p className="text-sm font-bold text-neutral-text-primary">{mentee?.name}</p>
                <p className="text-[11px] text-neutral-text-tertiary">{store?.name}</p>
              </div>
            </div>
            <span className={cn('px-3 py-1 rounded-pill text-xs font-bold border', status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-neutral-bg/50 border border-neutral-border/60">
              <p className="text-[11px] text-neutral-text-tertiary mb-1">带教导师</p>
              <p className="text-sm font-semibold text-neutral-text-primary flex items-center gap-1.5">
                <UserCheck size={13} className="text-brand-rose-500" />
                {mentor?.name || '未指派'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-bg/50 border border-neutral-border/60">
              <p className="text-[11px] text-neutral-text-tertiary mb-1">考核日期</p>
              <p className="text-sm font-semibold text-neutral-text-primary flex items-center gap-1.5">
                <Calendar size={13} className="text-brand-indigo-500" />
                {formatDate(plan.nextExamDate)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-brand-indigo-50/40 border border-brand-indigo-100/60">
            <p className="text-xs font-semibold text-brand-indigo-700 mb-2 flex items-center gap-1.5">
              <BookOpen size={13} /> 带教知识点 ({kps.length}个)
            </p>
            <div className="space-y-1.5">
              {kps.map(kp => (
                <div key={kp!.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo-400" />
                  <span className="text-xs text-neutral-text-primary">{kp!.name}</span>
                </div>
              ))}
            </div>
          </div>

          {plan.planNotes && (
            <div>
              <p className="text-xs font-semibold text-neutral-text-secondary mb-2">带教计划</p>
              <p className="text-xs text-neutral-text-primary leading-relaxed whitespace-pre-wrap p-3 bg-neutral-bg/40 rounded-lg border border-neutral-border/50">
                {plan.planNotes}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-neutral-text-secondary flex items-center gap-1.5">
                <MessageSquare size={13} /> 阶段备注
              </p>
              <span className="text-[11px] text-neutral-text-tertiary">{plan.progressNotes.length}条</span>
            </div>

            {plan.progressNotes.length > 0 && (
              <div className="space-y-2.5 mb-4">
                {plan.progressNotes.map((note, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-brand-rose-400" />
                    <div className="p-3 rounded-lg bg-white border border-neutral-border/70 shadow-sm">
                      <p className="text-xs text-neutral-text-primary leading-relaxed">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {plan.status === 'scheduled' && (
              <div className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="添加阶段带教备注..."
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-neutral-border bg-white focus:border-brand-rose-400 focus:ring-2 focus:ring-brand-rose-400/20 outline-none resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className={cn(
                    'w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
                    newNote.trim()
                      ? 'text-white bg-brand-indigo-600 hover:bg-brand-indigo-700'
                      : 'text-white/70 bg-neutral-border cursor-not-allowed'
                  )}
                >
                  <Plus size={13} /> 添加备注
                </button>
              </div>
            )}
          </div>

          {plan.status === 'scheduled' && !showCompleteForm && (
            <button
              onClick={() => setShowCompleteForm(true)}
              className="w-full py-3 rounded-lg text-sm font-bold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> 完成带教并记录考核
            </button>
          )}

          {showCompleteForm && (
            <div className="p-4 rounded-lg bg-semantic-successLight/30 border border-semantic-success/30 space-y-3">
              <p className="text-sm font-semibold text-semantic-success flex items-center gap-2">
                <CheckCircle2 size={16} /> 完成带教
              </p>
              <div>
                <label className="text-xs font-medium text-neutral-text-secondary mb-1.5 block">考核分数</label>
                <input
                  type="number"
                  value={examScore}
                  onChange={e => setExamScore(e.target.value)}
                  placeholder="请输入考核分数（0-100）"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white focus:border-semantic-success focus:ring-2 focus:ring-semantic-success/20 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCompleteForm(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-neutral-text-secondary border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!examScore || parseInt(examScore, 10) < 0 || parseInt(examScore, 10) > 100}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-semibold transition-colors',
                    examScore && parseInt(examScore, 10) >= 0 && parseInt(examScore, 10) <= 100
                      ? 'text-white bg-semantic-success hover:bg-semantic-success/90'
                      : 'text-white/70 bg-neutral-border cursor-not-allowed'
                  )}
                >
                  确认完成
                </button>
              </div>
            </div>
          )}

          {plan.status === 'completed' && plan.examScore !== undefined && (
            <div className="p-4 rounded-lg bg-semantic-successLight/40 border border-semantic-success/30 text-center">
              <Award size={28} className="text-semantic-success mx-auto mb-2" />
              <p className="text-lg font-bold text-semantic-success">{plan.examScore}分</p>
              <p className="text-xs text-neutral-text-tertiary mt-1">带教完成 · 考核通过</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ActionListMentorship() {
  const { mentorshipPlans } = useBusinessStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterMentor, setFilterMentor] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<MentorshipPlan | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mentors = useMemo(() => {
    const mentorIds = new Set(mentorshipPlans.map(p => p.mentorId));
    return employees.filter(e => mentorIds.has(e.id));
  }, [mentorshipPlans]);

  const stats = useMemo(() => {
    const total = mentorshipPlans.length;
    const scheduled = mentorshipPlans.filter(p => p.status === 'scheduled').length;
    const completed = mentorshipPlans.filter(p => p.status === 'completed').length;
    const avgScore = completed > 0
      ? Math.round(mentorshipPlans.filter(p => p.status === 'completed' && p.examScore !== undefined).reduce((s, p) => s + (p.examScore || 0), 0) / completed)
      : 0;
    return { total, scheduled, completed, avgScore };
  }, [mentorshipPlans]);

  const filteredPlans = useMemo(() => {
    let list = mentorshipPlans;
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (filterStore !== 'all') {
      list = list.filter(p => {
        const emp = employees.find(e => e.id === p.menteeId);
        return emp?.storeId === filterStore;
      });
    }
    if (filterMentor !== 'all') list = list.filter(p => p.mentorId === filterMentor);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => {
        const mentee = employees.find(e => e.id === p.menteeId);
        const mentor = employees.find(e => e.id === p.mentorId);
        return mentee?.name.toLowerCase().includes(term) || mentor?.name.toLowerCase().includes(term);
      });
    }
    return list;
  }, [mentorshipPlans, filterStatus, filterStore, filterMentor, searchTerm]);

  if (mentorshipPlans.length === 0) {
    return (
      <div className="rounded-card border border-neutral-border bg-white shadow-card p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-bg/60 flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={32} className="text-neutral-text-tertiary" />
        </div>
        <h3 className="text-lg font-bold font-serif text-brand-indigo-800 mb-2">暂无带教计划</h3>
        <p className="text-sm text-neutral-text-secondary mb-6">
          先从补训名单中选择员工，安排带教计划
        </p>
        <div className="flex items-center justify-center gap-3 text-xs text-neutral-text-tertiary">
          <span className="flex items-center gap-1"><AlertCircle size={12} /> 补训名单 → 立即安排 → 生成带教计划</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="带教计划总数" value={stats.total} unit="个" variant="info" icon={GraduationCap} delay={0} />
        <KPICard title="带教进行中" value={stats.scheduled} unit="人" variant="warning" icon={Clock} delay={50} />
        <KPICard title="已完成带教" value={stats.completed} unit="人" variant="success" icon={CheckCircle2} delay={100} />
        <KPICard title="平均考核分" value={stats.avgScore} unit="分" variant="info" icon={TrendingUp} delay={150} />
      </div>

      <div className="rounded-card border border-neutral-border bg-white shadow-card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-widget bg-neutral-bg/60 border border-neutral-border">
              <Filter size={13} className="text-neutral-text-tertiary" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs bg-transparent outline-none text-neutral-text-secondary">
                <option value="all">全部状态</option>
                <option value="scheduled">带教中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            <select value={filterStore} onChange={e => setFilterStore(e.target.value)} className="text-xs px-3 py-2 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
              <option value="all">全部门店</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select value={filterMentor} onChange={e => setFilterMentor(e.target.value)} className="text-xs px-3 py-2 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
              <option value="all">全部导师</option>
              {mentors.map(m => <option key={m.id} value={m.id}>{m.name} [{m.level}]</option>)}
            </select>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-widget border border-neutral-border bg-white">
              <Search size={13} className="text-neutral-text-tertiary" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索学员/导师" className="text-xs w-32 bg-transparent outline-none placeholder:text-neutral-text-tertiary" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-text-tertiary">
            共 <b className="text-brand-rose-600">{filteredPlans.length}</b> 个计划
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan, idx) => (
          <div key={plan.id} style={{ animationDelay: `${idx * 40}ms` }}>
            <PlanCard plan={plan} onViewDetail={setSelectedPlan} />
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="rounded-card border border-neutral-border bg-white p-12 text-center">
          <Users size={32} className="text-neutral-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-neutral-text-tertiary">没有符合条件的带教计划</p>
        </div>
      )}

      <PlanDetailDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </div>
  );
}
