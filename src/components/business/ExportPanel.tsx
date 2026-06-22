import React, { useState } from 'react';
import {
  X, FileSpreadsheet, FileDown, Eye, Calendar, Building2,
  FileBarChart, Users, FolderKanban, MessageCircleWarning, GraduationCap, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportPanelProps {
  onClose: () => void;
}

type ExportFormat = 'excel' | 'pdf';

const EXPORT_OPTIONS = [
  { key: 'kpi', label: 'KPI汇总', Icon: FileBarChart },
  { key: 'position', label: '岗位分析', Icon: Users },
  { key: 'project', label: '项目专题', Icon: FolderKanban },
  { key: 'complaint', label: '客诉分析', Icon: MessageCircleWarning },
  { key: 'remedial', label: '补训建议', Icon: GraduationCap },
  { key: 'certificate', label: '证书提醒', Icon: Award },
] as const;

const formatDate = (d: Date): string => d.toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d; };

export default function ExportPanel({ onClose }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [options, setOptions] = useState<string[]>(['kpi', 'position', 'certificate']);
  const [startDate, setStartDate] = useState(formatDate(monthStart()));
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [title, setTitle] = useState('月度培训简报');
  const [orgName, setOrgName] = useState('丽尚医美连锁集团');

  const toggleOption = (key: string) => {
    setOptions(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const handleExport = () => {
    alert(`已生成 ${format.toUpperCase()}：《${title}》\n时间范围：${startDate} ~ ${endDate}\n包含模块：${options.length}项\n机构：${orgName}`);
    onClose();
  };

  const handlePreview = () => {
    alert('预览功能暂未开放，即将展示 PDF 预览页');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-text-primary/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-[480px] max-w-[95vw] h-full bg-white shadow-[0_0_40px_rgba(30,58,95,0.18)] animate-slide-in-right flex flex-col"
      >
        <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between bg-gradient-to-r from-brand-rose-50/80 via-white to-brand-indigo-50/60 flex-shrink-0">
          <div>
            <h3 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <FileDown size={18} className="text-brand-rose-600" />
              月度简报导出
            </h3>
            <p className="text-caption text-neutral-text-secondary mt-0.5">一键生成多维度数据报告</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-border/60 flex items-center justify-center text-neutral-text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">导出格式</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'excel', label: 'Excel', Icon: FileSpreadsheet, desc: '.xlsx 可编辑表格', accent: '#6FCF97' },
                { key: 'pdf', label: 'PDF', Icon: FileBarChart, desc: '.pdf 精美排版报告', accent: '#E05A5A' },
              ] as const).map(({ key, label, Icon, desc, accent }) => {
                const checked = format === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={cn(
                      'relative p-4 rounded-card border-2 text-left transition-all',
                      checked
                        ? 'border-brand-rose-500 bg-gradient-to-br from-brand-rose-50/80 to-white shadow-card'
                        : 'border-neutral-border bg-white hover:border-brand-indigo-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${accent}15`, color: accent }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-neutral-text-primary">{label}</p>
                        <p className="text-caption text-neutral-text-tertiary mt-0.5">{desc}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        checked ? 'border-brand-rose-500 bg-brand-rose-500' : 'border-neutral-border bg-white'
                      )}
                    >
                      {checked && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">
              导出内容 <span className="text-caption text-neutral-text-tertiary ml-1">（已选 {options.length} 项）</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {EXPORT_OPTIONS.map(({ key, label, Icon }) => {
                const checked = options.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOption(key)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] border text-left transition-all',
                      checked
                        ? 'border-brand-indigo-300 bg-brand-indigo-50/80'
                        : 'border-neutral-border bg-white hover:bg-neutral-bg/50'
                    )}
                  >
                    <input type="checkbox" readOnly checked={checked} className="w-4 h-4 accent-brand-indigo-600" />
                    <Icon size={15} className={checked ? 'text-brand-indigo-700' : 'text-neutral-text-tertiary'} strokeWidth={2} />
                    <span className={cn('text-body font-medium', checked ? 'text-neutral-text-primary' : 'text-neutral-text-secondary')}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">时间范围</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
                  />
                </div>
                <p className="text-caption text-neutral-text-tertiary mt-1">开始</p>
              </div>
              <div>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
                  />
                </div>
                <p className="text-caption text-neutral-text-tertiary mt-1">结束</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2.5">
              {[
                { label: '本月', start: formatDate(monthStart()), end: formatDate(new Date()) },
                { label: '上月', start: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); return formatDate(d); })(), end: (() => { const d = new Date(); d.setDate(0); return formatDate(d); })() },
                { label: 'Q3', start: '2025-07-01', end: '2025-09-30' },
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => { setStartDate(q.start); setEndDate(q.end); }}
                  className="px-3 py-1 text-caption font-medium rounded-pill border border-neutral-border bg-white text-neutral-text-secondary hover:bg-brand-rose-50 hover:border-brand-rose-200 hover:text-brand-rose-700 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-body font-medium text-neutral-text-secondary mb-2 block">封面标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="请输入报告封面标题"
                className="w-full px-4 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-body font-medium text-neutral-text-secondary mb-2 block flex items-center gap-1.5">
                <Building2 size={14} className="text-neutral-text-tertiary" /> 机构名称
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="请输入机构名称"
                className="w-full px-4 py-2.5 text-body bg-white border border-neutral-border rounded-[8px] focus:border-brand-rose-500 focus:ring-2 focus:ring-brand-rose-500/20 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-body font-medium text-neutral-text-secondary mb-2 block">预览缩略图</label>
            <div className="rounded-card border border-neutral-border bg-gradient-to-br from-brand-indigo-50 via-white to-brand-rose-50 p-4">
              <div className="aspect-[210/297] rounded-[6px] bg-white border border-neutral-border shadow-inner-soft p-3.5">
                <div className="h-full flex flex-col">
                  <div className="h-1 rounded-pill bg-gradient-rose-gold w-2/3 mx-auto mt-2" />
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-indigo flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="h-3.5 w-28 bg-neutral-border/50 rounded mx-auto" />
                      <div className="h-4 w-36 bg-gradient-rose-gold/20 rounded mx-auto" />
                    </div>
                    <div className="pt-4 space-y-1.5 w-full px-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-2 items-center">
                          <div className={cn(
                            'w-3 h-3 rounded-sm',
                            i % 4 === 0 ? 'bg-semantic-danger' : i % 3 === 0 ? 'bg-semantic-warning' : i % 2 === 0 ? 'bg-brand-rose-400' : 'bg-brand-indigo-500'
                          )} />
                          <div className="h-2.5 bg-neutral-border/40 rounded flex-1" />
                          <div className="h-2.5 w-8 bg-neutral-border/40 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center pt-3 border-t border-neutral-border">
                    <div className="h-2 w-20 bg-neutral-border/40 rounded mx-auto" />
                    <div className="h-1.5 w-14 bg-neutral-border/30 rounded mx-auto mt-1" />
                  </div>
                </div>
              </div>
              <p className="text-caption text-neutral-text-tertiary text-center mt-2">
                共 {options.length} 个章节 · 约 {6 + options.length} 页
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-border bg-neutral-bg/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 px-4 py-2.5 text-body font-semibold text-brand-indigo-700 rounded-[8px] border border-brand-indigo-200 bg-white hover:bg-brand-indigo-50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Eye size={16} strokeWidth={2} /> 预览
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 px-4 py-2.5 text-body font-semibold text-white rounded-[8px] bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5 ripple"
            >
              <FileDown size={16} strokeWidth={2} /> 立即导出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
