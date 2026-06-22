import React, { useState } from 'react';
import { X, Eye, GraduationCap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RosePieChart, DualAxisLineChart } from '@/components/charts';
import StatBadge from '@/components/common/StatBadge';
import type { ProjectRowData } from './ProjectTopic.shared';
import { riskBadgeVariant } from './ProjectTopic.shared';
import { cn } from '@/lib/utils';
import { useBusinessStore } from '@/store';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  project: ProjectRowData | null;
  position?: string;
}

export default function DetailDrawer({ open, onClose, project, position }: DetailDrawerProps) {
  const navigate = useNavigate();
  const { openMentorshipForm } = useBusinessStore();
  const [tab, setTab] = useState<'business' | 'complaint' | 'training'>('business');
  if (!project) return null;

  const tabs = [
    { k: 'business' as const, l: '经营数据' },
    { k: 'complaint' as const, l: '客诉分析' },
    { k: 'training' as const, l: '培训建议' },
  ];

  const kpiCards = [
    { l: '成交量', v: project.volume, c: 'text-brand-indigo-700' },
    { l: '客诉率', v: `${project.complaintRate}%`, c: 'text-semantic-danger' },
    { l: '复购率', v: `${project.repurchaseRate}%`, c: 'text-semantic-success' },
  ];

  return (
    <>
      <div
        className={cn('fixed inset-0 bg-black/30 z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-[560px] z-50 bg-white shadow-2xl flex flex-col',
          'transition-transform duration-350 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="px-6 py-5 border-b border-neutral-border flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="font-serif text-section-title text-neutral-text-primary">{project.name}</h2>
              {project.isNew && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-rose-gold text-white">NEW</span>
              )}
              <StatBadge label="风险" value={project.riskLevel} variant={riskBadgeVariant(project.riskLevel)} size="sm" />
              {position && <StatBadge label="岗位" value={position} variant="rose" size="sm" />}
            </div>
            <div className="text-[13px] text-neutral-text-secondary tabular-nums">
              项目单价{' '}
              <span className="font-bold text-brand-rose-600 ml-1">
                ¥{project.amount ? Math.round(project.amount / Math.max(1, project.volume)) : project.amount.toLocaleString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-bg transition-colors">
            <X size={18} className="text-neutral-text-tertiary" strokeWidth={2} />
          </button>
        </header>

        <div className="flex border-b border-neutral-border px-4 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn('px-4 py-3 text-[13px] font-semibold relative transition-colors',
                tab === t.k ? 'text-brand-rose-600' : 'text-neutral-text-secondary hover:text-neutral-text-primary')}
            >
              {t.l}
              {tab === t.k && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-rose-gold rounded-t-full" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'business' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {kpiCards.map(m => (
                  <div key={m.l} className="rounded-widget border border-neutral-border p-3 text-center">
                    <div className={cn('text-kpi-sm font-bold tabular-nums mb-1', m.c)}>{m.v}</div>
                    <div className="text-[11px] text-neutral-text-tertiary">{m.l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-card border border-neutral-border overflow-hidden">
                <div className="px-4 py-3 bg-brand-indigo-50/40 border-b border-neutral-border/60">
                  <span className="font-serif text-card-title text-neutral-text-primary font-semibold">近3月趋势</span>
                </div>
                <DualAxisLineChart
                  xAxisData={project.recentTrend.map(t => t.date)}
                  leftSeries={[{ name: '成交量', data: project.recentTrend.map(t => t.volume) }]}
                  rightSeries={[
                    { name: '客诉率(%)', data: project.recentTrend.map(t => t.complaint), color: '#E05A5A' },
                    { name: '复购率(%)', data: project.recentTrend.map(t => t.repurchase), color: '#6FCF97' },
                  ]}
                  height={260}
                />
              </div>
            </div>
          )}

          {tab === 'complaint' && (
            <div className="rounded-card border border-neutral-border overflow-hidden">
              <RosePieChart data={project.complaintTypes} height={320} />
            </div>
          )}

          {tab === 'training' && (
            <div className="space-y-5">
              <div className="rounded-card border border-neutral-border overflow-hidden">
                <div className="px-4 py-3 bg-brand-indigo-50/40 border-b border-neutral-border/60">
                  <span className="font-serif text-card-title text-neutral-text-primary font-semibold">未掌握知识点排名</span>
                </div>
                <div className="p-4 space-y-3">
                  {project.weakKnowledge.map((k, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                        i === 0 ? 'bg-semantic-dangerLight text-semantic-danger'
                          : i === 1 ? 'bg-semantic-warningLight text-semantic-warning'
                          : 'bg-neutral-bg text-neutral-text-secondary')}>{i + 1}</span>
                      <span className="flex-1 text-[12px] text-neutral-text-primary truncate">{k.name}</span>
                      <div className="w-28 h-1.5 bg-neutral-border/40 rounded-pill overflow-hidden flex-shrink-0">
                        <div className="h-full rounded-pill bg-gradient-to-r from-semantic-warning to-semantic-danger"
                          style={{ width: `${k.failRate}%` }} />
                      </div>
                      <span className="text-[11px] font-bold tabular-nums text-semantic-danger w-12 text-right">{k.failRate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-card border border-neutral-border overflow-hidden">
                <div className="px-4 py-3 bg-brand-indigo-50/40 border-b border-neutral-border/60">
                  <span className="font-serif text-card-title text-neutral-text-primary font-semibold">未通过人员</span>
                </div>
                <div className="divide-y divide-neutral-border/60">
                  {project.failedEmployees.map((e, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-bg/40 transition-colors">
                      <img src={e.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${e.id}`)}
                      >
                        <div className="text-[12px] font-semibold text-neutral-text-primary hover:text-brand-rose-600 transition-colors">
                          {e.name}
                        </div>
                        <div className="text-[10px] text-neutral-text-tertiary">{e.position}</div>
                      </div>
                      <span className={cn('text-[12px] font-bold tabular-nums px-2 py-0.5 rounded',
                        e.score < 60 ? 'bg-semantic-dangerLight text-semantic-danger' : 'bg-semantic-warningLight text-semantic-warning')}>
                        {e.score}分
                      </span>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            console.log('重学课程:', e.name, e.id);
                            alert('已安排该员工重学课程');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-brand-rose-300 text-brand-rose-600 font-semibold hover:bg-brand-rose-50 transition-colors"
                        >
                          <RefreshCw size={10} />重学
                        </button>
                        <button
                          onClick={() => navigate(`/profile/${e.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-neutral-border text-neutral-text-secondary font-semibold hover:bg-neutral-bg transition-colors"
                        >
                          <Eye size={10} />查看
                        </button>
                        <button
                          onClick={() => openMentorshipForm({
                            menteeId: e.id,
                            preSelectedKnowledgePointIds: project.weakKnowledge.map(k => k.id),
                            contextMeta: {
                              projectName: project.name,
                              source: 'project',
                              sourceId: project.id,
                            },
                          })}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-brand-indigo-300 text-brand-indigo-600 font-semibold hover:bg-brand-indigo-50 transition-colors"
                        >
                          <GraduationCap size={10} />带教
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 rounded-card bg-gradient-rose-gold text-white font-bold shadow-sm hover:shadow-md transition-all ripple">
                生成该项目补训名单
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
