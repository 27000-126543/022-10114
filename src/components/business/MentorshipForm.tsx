import React, { useState, useEffect } from 'react';
import { X, UserCheck, CalendarDays, BookMarked, ClipboardList, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData as fetchMockData, knowledgePoints as defaultKps } from '@/data/mock';
import type { Employee, KnowledgePoint } from '@/data/types';
import { useBusinessStore } from '@/store';

interface MentorshipFormProps {
  menteeId?: string;
  onSubmit?: (data: {
    mentorId: string;
    knowledgePointIds: string[];
    startDate: string;
    nextExamDate: string;
    planNotes: string;
  }) => void;
  onCancel?: () => void;
}

const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const daysFromNow = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const criticalLevelMap: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '低', color: 'text-semantic-success', bg: 'bg-semantic-successLight' },
  2: { label: '中', color: 'text-semantic-warning', bg: 'bg-semantic-warningLight' },
  3: { label: '高', color: 'text-semantic-danger', bg: 'bg-semantic-dangerLight' },
};

export default function MentorshipForm({ menteeId: propMenteeId, onSubmit: propOnSubmit, onCancel: propOnCancel }: MentorshipFormProps) {
  const { mentorshipContext, addMentorshipPlan, closeMentorshipForm } = useBusinessStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>(defaultKps);
  const [loading, setLoading] = useState(true);
  const [mentorId, setMentorId] = useState('');
  const [selectedKps, setSelectedKps] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [nextExamDate, setNextExamDate] = useState(formatDate(daysFromNow(14)));
  const [planNotes, setPlanNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const menteeId = propMenteeId || mentorshipContext.menteeId;
  const isOpen = !!menteeId || mentorshipContext.open;
  const contextMeta = mentorshipContext.contextMeta;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const emps = await fetchMockData('employees');
      const kps = await fetchMockData('knowledgePoints');
      if (!mounted) return;
      setEmployees(emps);
      setKnowledgePoints(kps);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (mentorshipContext.open && mentorshipContext.preSelectedKnowledgePointIds.length > 0) {
      setSelectedKps(mentorshipContext.preSelectedKnowledgePointIds);
    }
  }, [mentorshipContext.open, mentorshipContext.preSelectedKnowledgePointIds]);

  useEffect(() => {
    if (mentorshipContext.open) {
      setMentorId('');
      setStartDate(formatDate(new Date()));
      setNextExamDate(formatDate(daysFromNow(14)));
      setPlanNotes('');
      setErrors({});
    }
  }, [mentorshipContext.open]);

  const mentors = employees.filter(e => e.level === 'S' || e.level === 'A');
  const mentee = employees.find(e => e.id === menteeId);

  const toggleKp = (id: string) => {
    setSelectedKps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!mentorId) errs.mentorId = '请选择带教导师';
    if (selectedKps.length === 0) errs.kps = '请至少选择1个知识点';
    if (!startDate) errs.startDate = '请选择开始日期';
    if (!nextExamDate) errs.nextExamDate = '请选择考核日期';
    if (new Date(nextExamDate) <= new Date(startDate)) errs.nextExamDate = '考核日期需晚于开始日期';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCancel = () => {
    if (propOnCancel) {
      propOnCancel();
    } else {
      closeMentorshipForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { mentorId, knowledgePointIds: selectedKps, startDate, nextExamDate, planNotes };
    if (propOnSubmit) {
      propOnSubmit(data);
    } else {
      addMentorshipPlan({ ...data, menteeId: menteeId || '', contextMeta });
      closeMentorshipForm();
    }
  };

  if (loading) {
    return (
      <div className="rounded-card bg-white shadow-card p-6 border border-neutral-border">
        <div className="animate-pulse-soft space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-10 bg-neutral-border/50 rounded-widget" />
          ))}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const showContextBanner = contextMeta && (contextMeta.projectName || contextMeta.complaintType);

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white shadow-card border border-neutral-border overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-brand-indigo-50 to-brand-rose-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-rose-gold flex items-center justify-center text-white">
            <UserCheck size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-serif text-section-title text-neutral-text-primary">一对一带教安排</h3>
            {mentee && <p className="text-caption text-neutral-text-secondary mt-0.5">学员：{mentee.name} · {employees.find(e => e.id === mentee.id)?.level}级</p>}
          </div>
        </div>
        <button type="button" onClick={handleCancel} className="w-8 h-8 rounded-full hover:bg-neutral-border/60 flex items-center justify-center text-neutral-text-secondary transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {showContextBanner && (
          <div className="flex items-center gap-2 px-4 py-3 bg-brand-indigo-50 border border-brand-indigo-200 rounded-[8px]">
            <Info size={16} className="text-brand-indigo-600 flex-shrink-0" />
            <span className="text-[13px] text-brand-indigo-700 font-medium">
              带教上下文：
              {contextMeta.projectName && <span>{contextMeta.projectName}</span>}
              {contextMeta.projectName && contextMeta.complaintType && <span className="mx-1">·</span>}
              {contextMeta.complaintType && <span>{contextMeta.complaintType}</span>}
              {contextMeta.projectName && <span className="mx-1">·</span>}
              <span>预选中 {selectedKps.length} 个知识点</span>
            </span>
          </div>
        )}
        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="text-body font-medium text-neutral-text-secondary pt-2.5 text-right">
            <span className="text-semantic-danger mr-1">*</span>选择导师
          </label>
          <div className="relative">
            <select
              value={mentorId}
              onChange={e => setMentorId(e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 text-body bg-white border rounded-[8px] transition-colors',
                'border-neutral-border focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none',
                errors.mentorId && 'border-semantic-danger'
              )}
            >
              <option value="">请选择导师（S/A 级）</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.level}] {m.name} · {m.positionId}
                </option>
              ))}
            </select>
            {errors.mentorId && <p className="text-caption text-semantic-danger mt-1">{errors.mentorId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="text-body font-medium text-neutral-text-secondary pt-2 text-right">
            <span className="text-semantic-danger mr-1">*</span>带教知识点
          </label>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-2 border border-neutral-border rounded-[8px] p-3 bg-neutral-bg/40">
              {knowledgePoints.map(kp => {
                const lvl = criticalLevelMap[kp.criticalLevel];
                const checked = selectedKps.includes(kp.id);
                return (
                  <label
                    key={kp.id}
                    className={cn(
                      'flex items-start gap-2.5 p-2.5 rounded-[8px] cursor-pointer transition-all border',
                      checked ? 'bg-brand-rose-50/80 border-brand-rose-300' : 'bg-white border-neutral-border hover:border-brand-indigo-200'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleKp(kp.id)}
                      className="mt-0.5 w-4 h-4 accent-brand-rose-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-body font-medium', checked ? 'text-neutral-text-primary' : 'text-neutral-text-primary')}>
                          {kp.name}
                        </span>
                        <span className={cn('text-caption px-1.5 py-0.5 rounded', lvl.bg, lvl.color)}>
                          关键级·{lvl.label}
                        </span>
                      </div>
                      <p className="text-caption text-neutral-text-tertiary mt-1">{kp.category}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.kps && <p className="text-caption text-semantic-danger mt-1">{errors.kps}</p>}
            <p className="text-caption text-neutral-text-tertiary mt-1.5 flex items-center gap-1">
              <BookMarked size={12} /> 已选 {selectedKps.length} 个知识点
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] md:grid-cols-[120px_1fr_1fr] items-start gap-4">
          <label className="text-body font-medium text-neutral-text-secondary pt-2.5 text-right">
            <span className="text-semantic-danger mr-1">*</span>开始日期
          </label>
          <div>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 text-body bg-white border rounded-[8px] transition-colors',
                  'border-neutral-border focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none',
                  errors.startDate && 'border-semantic-danger'
                )}
              />
            </div>
            {errors.startDate && <p className="text-caption text-semantic-danger mt-1">{errors.startDate}</p>}
          </div>
          <div className="md:pl-0 md:col-start-auto col-start-2 col-span-1">
            <label className="text-caption text-neutral-text-secondary mb-1 block font-medium">
              <span className="text-semantic-danger mr-1">*</span>下次考核日期
            </label>
            <div className="relative">
              <ClipboardList size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
              <input
                type="date"
                value={nextExamDate}
                onChange={e => setNextExamDate(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 text-body bg-white border rounded-[8px] transition-colors',
                  'border-neutral-border focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none',
                  errors.nextExamDate && 'border-semantic-danger'
                )}
              />
            </div>
            {errors.nextExamDate && <p className="text-caption text-semantic-danger mt-1">{errors.nextExamDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="text-body font-medium text-neutral-text-secondary pt-2.5 text-right">
            带教计划
          </label>
          <div>
            <textarea
              value={planNotes}
              onChange={e => setPlanNotes(e.target.value)}
              rows={4}
              placeholder="请描述详细的带教计划：包括每周带教频次、实操练习安排、考核方式等..."
              className="w-full px-4 py-3 text-body bg-white border border-neutral-border rounded-[8px] transition-colors focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg/40 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2 text-body font-medium text-neutral-text-secondary rounded-[8px] border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-body font-semibold text-white rounded-[8px] bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all active:scale-[0.98] ripple"
        >
          确认安排
        </button>
      </div>
    </form>
  );
}
