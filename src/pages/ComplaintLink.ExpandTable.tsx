import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star, Eye, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { CompTypeRow } from './ComplaintLink.shared';
import { POS_MAP } from './ComplaintLink.shared';
import { useBusinessStore } from '@/store';

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 3 }, (_, i) => (
        <Star key={i} size={11} fill={i < n ? '#C9A96E' : 'none'}
          className={i < n ? 'text-brand-rose-500' : 'text-neutral-border'} strokeWidth={2} />
      ))}
    </span>
  );
}

const typeColLayout = 'flex items-center gap-3 px-4 py-3';

interface ExpandTableProps {
  rows: CompTypeRow[];
  initialOpen?: number[];
}

export default function ExpandTable({ rows, initialOpen = [0, 1] }: ExpandTableProps) {
  const navigate = useNavigate();
  const { openMentorshipForm } = useBusinessStore();
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set(initialOpen));
  const [expandedKps, setExpandedKps] = useState<Set<string>>(new Set());

  const toggleType = (i: number) => {
    const s = new Set(expandedTypes);
    if (s.has(i)) {
      s.delete(i);
    } else {
      s.add(i);
    }
    setExpandedTypes(s);
  };
  const toggleKp = (key: string) => {
    const s = new Set(expandedKps);
    if (s.has(key)) {
      s.delete(key);
    } else {
      s.add(key);
    }
    setExpandedKps(s);
  };

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className={cn(typeColLayout, 'bg-brand-indigo-50/50 rounded-widget border border-neutral-border text-[11px] font-bold text-neutral-text-secondary')}>
        <span className="w-4" />
        <span className="flex-1 min-w-0 truncate pl-1">客诉类型 / 知识点 / 员工</span>
        <span className="min-w-[60px] text-center">本月数</span>
        <span className="min-w-[60px] text-center">未解决</span>
        <span className="min-w-[60px] text-center">课程数</span>
        <span className="min-w-[60px] text-center">知识点</span>
        <span className="min-w-[60px] text-center">涉及员工</span>
      </div>

      {rows.map((row, ti) => {
        const typeOpen = expandedTypes.has(ti);
        return (
          <div key={ti} className="border border-neutral-border rounded-widget overflow-hidden">
            <div
              onClick={() => toggleType(ti)}
              className={cn(typeColLayout, 'bg-brand-indigo-50/30 hover:bg-brand-indigo-50/60 cursor-pointer transition-colors')}
            >
              {typeOpen
                ? <ChevronDown size={16} className="text-brand-rose-500 flex-shrink-0" strokeWidth={2.5} />
                : <ChevronRight size={16} className="text-neutral-text-tertiary flex-shrink-0" strokeWidth={2.5} />}
              <span className="font-semibold text-[13px] text-neutral-text-primary flex-1 min-w-0 truncate pl-1">{row.type}</span>
              <span className="text-[12px] tabular-nums text-brand-indigo-700 font-bold min-w-[60px] text-center">{row.monthCount}</span>
              <span className="text-[12px] tabular-nums text-semantic-danger font-bold min-w-[60px] text-center">{row.unresolved}</span>
              <span className="text-[12px] tabular-nums text-neutral-text-secondary min-w-[60px] text-center">{row.courseCount}</span>
              <span className="text-[12px] tabular-nums text-neutral-text-secondary min-w-[60px] text-center">{row.kpCount}</span>
              <span className="text-[12px] tabular-nums text-brand-rose-600 font-bold min-w-[60px] text-center">{row.empCount}</span>
            </div>

            {typeOpen && (
              <div className="pl-4 border-t border-neutral-border/60">
                {row.kps.map((kr, ki) => {
                  const kpKey = `${ti}-${ki}`;
                  const kpOpen = expandedKps.has(kpKey);
                  return (
                    <div key={ki} className="border-b border-neutral-border/40 last:border-b-0">
                      <div
                        onClick={() => toggleKp(kpKey)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-bg/50 cursor-pointer transition-colors pl-8"
                      >
                        {kpOpen
                          ? <ChevronDown size={14} className="text-brand-rose-500 flex-shrink-0" strokeWidth={2.5} />
                          : <ChevronRight size={14} className="text-neutral-text-tertiary flex-shrink-0" strokeWidth={2.5} />}
                        <Stars n={kr.kp.criticalLevel} />
                        <span className="text-[12px] text-neutral-text-primary flex-1 min-w-0 truncate">{kr.kp.name}</span>
                        <span className="text-[11px] tabular-nums text-semantic-danger font-bold min-w-[120px] text-right">{kr.failRate}%</span>
                        <span className="text-[11px] tabular-nums text-neutral-text-secondary font-semibold min-w-[80px] text-right mr-2">{kr.avgScore}分</span>
                      </div>
                      {kpOpen && (
                        <div className="pl-14 pr-4 pb-3 space-y-1">
                          {kr.emps.map((er, ei) => (
                            <div key={ei} className="flex items-center gap-3 px-3 py-2 rounded-widget bg-neutral-bg/70">
                              <img src={er.emp.avatar} className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-semibold text-neutral-text-primary">{er.emp.name}</div>
                                <div className="text-[10px] text-neutral-text-tertiary">
                                  {POS_MAP[er.emp.positionId] || er.emp.positionId} · {er.store.name}
                                </div>
                              </div>
                              <span className={cn('text-[11px] font-bold tabular-nums px-2 py-0.5 rounded',
                                er.lastScore < 60
                                  ? 'bg-semantic-dangerLight text-semantic-danger'
                                  : 'bg-semantic-warningLight text-semantic-warning')}>
                                {er.lastScore}分
                              </span>
                              <span className="text-[10px] text-semantic-danger font-semibold min-w-[60px] text-right">不及格×{er.failCount}</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => navigate(`/profile/${er.emp.id}`)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-brand-indigo-300 text-brand-indigo-600 font-bold hover:bg-brand-indigo-50 transition-colors"
                                >
                                  <Eye size={11} />画像
                                </button>
                                <button
                                  onClick={() => openMentorshipForm({
                                    menteeId: er.emp.id,
                                    preSelectedKnowledgePointIds: [kr.kp.id],
                                    contextMeta: {
                                      complaintType: row.type,
                                      knowledgePointNames: [kr.kp.name],
                                      source: 'complaint',
                                      sourceId: kr.kp.id,
                                    },
                                  })}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-brand-rose-300 text-brand-rose-600 font-bold hover:bg-brand-rose-50 transition-colors"
                                >
                                  <GraduationCap size={11} />带教
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
