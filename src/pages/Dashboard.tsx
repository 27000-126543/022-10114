import React, { useState, useEffect } from 'react';
import {
  BookOpen, FileCheck, Handshake, AlertOctagon, Repeat2,
  RefreshCw, Users, Sparkles, Clock, TrendingUp, TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData as fetchMockData } from '@/data/mock';
import { KPICard, WarningCard, ProgressBar } from '@/components/common';
import { DualAxisLineChart, GroupedBarChart } from '@/components/charts';
import { ExportPanel } from '@/components/business';
import type { DashboardKPI, WarningItem, Project, Employee, TrainingRecord, Store } from '@/data/types';

const WEEKS = Array.from({ length: 12 }, (_, i) => `W${14 + i}`);

const POSITIONS_ORDER: Array<{ id: string; name: string; color: string }> = [
  { id: 'consultant', name: '咨询师', color: '#6366f1' },
  { id: 'nurse', name: '护士', color: '#22c55e' },
  { id: 'doctor', name: '医师', color: '#ef4444' },
  { id: 'reception', name: '前台', color: '#f59e0b' },
  { id: 'technician', name: '技师', color: '#06b6d4' },
];

function SeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [updateTime, setUpdateTime] = useState('');
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [k, w, proj, emps, sts, tr] = await Promise.all([
        fetchMockData('kpi'),
        fetchMockData('warnings'),
        fetchMockData('projects'),
        fetchMockData('employees'),
        fetchMockData('stores'),
        fetchMockData('trainingRecords'),
      ]);
      if (!mounted) return;
      setKpi(k);
      setWarnings(w);
      setProjects(proj);
      setEmployees(emps);
      setStores(sts);
      setTrainingRecords(tr);
      const now = new Date();
      setUpdateTime(`${now.getMonth() + 1}-${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const newProjects = projects.filter(p => p.isNew);

  const dangerWarnings = warnings.filter(w => w.type === 'danger').sort((a, b) => a.priority - b.priority);
  const warningWarnings = warnings.filter(w => w.type === 'warning').sort((a, b) => a.priority - b.priority);
  const sortedWarnings = [...dangerWarnings, ...warningWarnings];

  const genSeriesData = (seed: number, count: number, min: number, max: number, smooth = true) => {
    const rand = SeededRandom(seed);
    const data: number[] = [];
    let val = (min + max) / 2;
    for (let i = 0; i < count; i++) {
      const delta = (rand() - 0.5) * (max - min) * 0.12;
      val = Math.max(min, Math.min(max, val + delta));
      if (!smooth && i > 0 && Math.abs(val - data[i - 1]) > (max - min) * 0.2) {
        val = (val + data[i - 1]) / 2;
      }
      data.push(+(val.toFixed(1)));
    }
    return data;
  };

  const leftSeries = [
    { name: '平均考核分', data: genSeriesData(1, 12, 78, 92), color: '#1E3A5F' },
  ];

  const rightSeries = [
    { name: '面诊转化率', data: genSeriesData(2, 12, 60, 76), color: '#C9A96E' },
    { name: '客户复购率', data: genSeriesData(3, 12, 28, 42), color: '#8B7EC8' },
    { name: '客诉率', data: genSeriesData(4, 12, 1.2, 3.0), color: '#E05A5A', dashed: true },
  ];

  const storeNames = stores.map(s => s.name.replace(/北京|上海|广州|深圳|院/g, ''));
  const storeGroups = [
    { name: '学习完成率', data: genSeriesData(10, 4, 70, 92), color: '#416EB4' },
    { name: '考试通过率', data: genSeriesData(11, 4, 68, 90), color: '#C9A96E' },
    { name: '客诉率', data: genSeriesData(12, 4, 1.0, 3.2), color: '#8B7EC8' },
  ];

  const calcPositionCompletion = (posId: string) => {
    const posEmps = employees.filter(e => e.positionId === posId);
    if (posEmps.length === 0) return 0;
    const empIds = new Set(posEmps.map(e => e.id));
    const relevant = trainingRecords.filter(r => empIds.has(r.employeeId));
    if (relevant.length === 0) return 0;
    const completed = relevant.filter(r => r.status === 'completed').length;
    return Math.round((completed / relevant.length) * 100);
  };

  const positionBars = POSITIONS_ORDER.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    completion: calcPositionCompletion(p.id),
    count: employees.filter(e => e.positionId === p.id).length,
  }));

  const genProgressSegments = (seed: number, total: number) => {
    const rand = SeededRandom(seed);
    const completed = Math.floor(total * (0.35 + rand() * 0.25));
    const inProgress = Math.floor((total - completed) * (0.3 + rand() * 0.4));
    return {
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
    };
  };

  return (
    <div className="min-h-full p-5 lg:p-6 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-page-title text-neutral-text-primary tracking-tight">总览大屏</h1>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-gradient-rose-gold/10 border border-brand-rose-300/50 text-caption font-medium text-brand-rose-700">
            <Sparkles size={12} />
            实时数据
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-indigo-50 border border-brand-indigo-200/60 text-caption font-medium text-brand-indigo-700">
            <Clock size={12} />
            更新于 {updateTime || '--:--'}
          </span>
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 rounded-[8px] text-body font-medium bg-white border border-neutral-border shadow-sm hover:bg-brand-rose-50 hover:border-brand-rose-300/60 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> 导出简报
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-card bg-white shadow-card border border-neutral-border p-5 h-[140px] animate-pulse-soft">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full bg-neutral-border/50" />
                <div className="h-4 w-24 bg-neutral-border/50 rounded" />
                <div className="h-9 w-28 bg-neutral-border/50 rounded" />
                <div className="h-3 w-20 bg-neutral-border/50 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          <KPICard
            title="培训完成率"
            value={kpi.trainingCompletionRate}
            format="percent"
            momChange={kpi.momChange.trainingCompletionRate}
            variant="success"
            icon={BookOpen}
            delay={0}
          />
          <KPICard
            title="平均考核分"
            value={kpi.avgExamScore}
            format="score"
            momChange={kpi.momChange.avgExamScore}
            variant="info"
            icon={FileCheck}
            delay={60}
          />
          <KPICard
            title="面诊转化率"
            value={kpi.consultationConversionRate}
            format="percent"
            momChange={kpi.momChange.consultationConversionRate}
            variant="warning"
            icon={Handshake}
            delay={120}
          />
          <KPICard
            title="客诉率"
            value={kpi.complaintRate}
            format="percent"
            momChange={kpi.momChange.complaintRate}
            variant="danger"
            icon={AlertOctagon}
            delay={180}
          />
          <KPICard
            title="客户复购率"
            value={kpi.repurchaseRate}
            format="percent"
            momChange={kpi.momChange.repurchaseRate}
            variant="success"
            icon={Repeat2}
            delay={240}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-8 rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <DualAxisLineChart
            xAxisData={WEEKS}
            leftSeries={leftSeries}
            rightSeries={rightSeries}
            leftUnit="分"
            rightUnit="%"
            title="培训表现与经营指标关联趋势"
            height={340}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-4 rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <GroupedBarChart
            categories={storeNames}
            groups={storeGroups}
            title="四门门店数据对比"
            unit="%"
            height={340}
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-7 rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <AlertOctagon size={18} className="text-semantic-danger" />
              风险预警
            </h2>
            <span className="text-caption text-neutral-text-tertiary">
              共 {sortedWarnings.length} 条待处理
            </span>
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse-soft">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[88px] bg-neutral-border/40 rounded-card" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedWarnings.map(w => (
                <WarningCard
                  key={w.id}
                  type={w.type}
                  category={w.category}
                  title={w.title}
                  description={w.description}
                  relatedRoute={w.relatedRoute}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <Users size={18} className="text-brand-indigo-600" />
              新项目培训覆盖进度
            </h2>
          </div>
          {loading ? (
            <div className="space-y-6 animate-pulse-soft">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-32 bg-neutral-border/50 rounded" />
                  <div className="h-7 bg-neutral-border/40 rounded-pill" />
                  <div className="flex justify-between">
                    <div className="h-3 w-28 bg-neutral-border/40 rounded" />
                    <div className="h-3 w-16 bg-neutral-border/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {newProjects.map((proj, idx) => {
                const total = employees.filter(e => ['doctor', 'technician', 'nurse', 'consultant'].includes(e.positionId)).length;
                const segs = genProgressSegments(100 + idx, total);
                const progressPct = Math.round(((segs.completed + segs.inProgress * 0.5) / total) * 100);
                return (
                  <div key={proj.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2 py-0.5 text-caption font-semibold rounded',
                          proj.riskLevel === '高' ? 'bg-semantic-dangerLight text-semantic-danger'
                            : proj.riskLevel === '中' ? 'bg-semantic-warningLight text-semantic-warning'
                            : 'bg-semantic-successLight text-semantic-success'
                        )}>
                          {proj.category}
                        </span>
                        <span className="text-body font-semibold text-neutral-text-primary">{proj.name}</span>
                      </div>
                      <span className={cn(
                        'text-body font-bold tabular-nums',
                        progressPct >= 70 ? 'text-semantic-success'
                          : progressPct >= 40 ? 'text-semantic-warning' : 'text-semantic-danger'
                      )}>
                        {progressPct}%
                      </span>
                    </div>
                    <ProgressBar segments={segs} height="lg" />
                    <div className="flex items-center gap-4 text-caption text-neutral-text-secondary pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#6FCF97' }} />
                        已完成 <b className="tabular-nums text-neutral-text-primary">{segs.completed}</b>人
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#416EB4' }} />
                        进行中 <b className="tabular-nums text-neutral-text-primary">{segs.inProgress}</b>人
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-neutral-border/70" />
                        未开始 <b className="tabular-nums text-neutral-text-primary">{segs.notStarted}</b>人
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
            <FileCheck size={18} className="text-brand-rose-600" />
            各岗位培训完成率总览
          </h2>
          <div className="flex items-center gap-4 text-caption text-neutral-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <TrendingUp size={12} className="text-semantic-success" /> 上升
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingDown size={12} className="text-semantic-danger" /> 下降
            </span>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4 animate-pulse-soft">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-4 bg-neutral-border/50 rounded" />
                <div className="flex-1 h-5 bg-neutral-border/40 rounded-pill" />
                <div className="w-14 h-4 bg-neutral-border/50 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {positionBars.map((p, idx) => {
              const rand = SeededRandom(200 + idx);
              const trend = +((rand() - 0.45) * 8).toFixed(1);
              const isUp = trend >= 0;
              return (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-20 flex-shrink-0 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-body font-medium text-neutral-text-primary">{p.name}</span>
                  </div>
                  <div className="flex-1 relative h-7 rounded-pill bg-neutral-border/50 overflow-hidden">
                    <div
                      className="h-full rounded-pill transition-all duration-700 ease-out relative"
                      style={{
                        width: `${p.completion}%`,
                        background: `linear-gradient(90deg, ${p.color}CC, ${p.color})`,
                      }}
                    >
                      <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-white/40 to-transparent" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-end pr-3 text-caption font-semibold text-neutral-text-primary/90 drop-shadow-sm">
                      {p.count}人
                    </div>
                  </div>
                  <div className="w-16 flex items-center justify-end gap-1 flex-shrink-0">
                    <span className="text-kpi-sm font-bold tabular-nums text-neutral-text-primary">
                      {p.completion}
                      <span className="text-caption font-medium text-neutral-text-secondary">%</span>
                    </span>
                    <span className={cn(
                      'text-caption font-medium inline-flex items-center',
                      isUp ? 'text-semantic-success' : 'text-semantic-danger'
                    )}>
                      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {Math.abs(trend)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  );
}
