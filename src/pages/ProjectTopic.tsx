import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeatmapChart } from '@/components/charts';
import DataTable from '@/components/common/DataTable';
import ProgressBar from '@/components/common/ProgressBar';
import StatBadge from '@/components/common/StatBadge';
import { useMockData } from '@/data/mock';
import type { Project, Position, Employee, KnowledgePoint, ExamScore, BusinessRecord, Complaint } from '@/data/types';
import { cn } from '@/lib/utils';
import DetailDrawer from './ProjectTopic.Drawer';
import {
  POSITION_NAMES, PROJECT_CATEGORIES, RISK_LEVELS, STATUS_FILTERS, SORT_OPTIONS,
  genHeatmapData, buildProjectRows, riskBadgeVariant, scoreVariant,
  type CategoryFilter, type RiskFilter, type StatusFilter, type ProjectRowData,
} from './ProjectTopic.shared';

function FilterChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-pill text-[12px] font-semibold transition-all duration-200 border whitespace-nowrap',
        active
          ? 'bg-gradient-rose-gold text-white border-transparent shadow-sm'
          : 'bg-white text-neutral-text-secondary border-neutral-border hover:border-brand-rose-300 hover:text-brand-rose-600'
      )}
    >
      {children}
    </button>
  );
}

function TrendArrow({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 tabular-nums text-[11px] font-semibold',
      pos ? 'text-semantic-danger' : 'text-semantic-success')}>
      {pos ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function ProjectTopic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kps, setKps] = useState<KnowledgePoint[]>([]);
  const [examScores, setExamScores] = useState<ExamScore[]>([]);
  const [businessRecords, setBusinessRecords] = useState<BusinessRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [category, setCategory] = useState<CategoryFilter>('全部');
  const [risk, setRisk] = useState<RiskFilter>('全部');
  const [status, setStatus] = useState<StatusFilter>('全部');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectRowData | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ps, ems, k, es, bs, cs] = await Promise.all([
        useMockData('projects'), useMockData('employees'), useMockData('knowledgePoints'),
        useMockData('examScores'), useMockData('businessRecords'), useMockData('complaints'),
      ]);
      setProjects(ps); setEmployees(ems); setKps(k); setExamScores(es);
      setBusinessRecords(bs); setComplaints(cs); setLoading(false);
    })();
  }, []);

  const projectRows = useMemo(() => {
    const all = buildProjectRows(projects, employees, examScores, businessRecords, complaints, kps);
    let filtered = all;
    if (category !== '全部') filtered = filtered.filter(p => p.category === category);
    if (risk !== '全部') filtered = filtered.filter(p => p.riskLevel === risk);
    if (search) filtered = filtered.filter(p => p.name.includes(search));
    if (status === '新项目优先') filtered = [...filtered].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (status === '高客诉优先') filtered = [...filtered].sort((a, b) => b.complaintRate - a.complaintRate);
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortBy.key as keyof ProjectRowData] as number;
      const bv = b[sortBy.key as keyof ProjectRowData] as number;
      return sortBy.order === 'asc' ? av - bv : bv - av;
    });
    return filtered;
  }, [projects, employees, examScores, businessRecords, complaints, kps, category, risk, status, search, sortBy]);

  const heatmapData = useMemo(() => genHeatmapData(projects), [projects]);
  const heatmapY = useMemo(() => projects.map(p => p.name), [projects]);

  const openDrawer = (row: ProjectRowData, pos?: string) => {
    setSelectedProject(row); setSelectedPosition(pos); setDrawerOpen(true);
  };

  const columns = [
    {
      key: 'name', title: '项目名称', width: 180,
      render: (r: ProjectRowData) => (
        <div className="flex items-center gap-2 min-w-0">
          {r.isNew && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-rose-gold text-white flex-shrink-0">NEW</span>}
          <span className="font-semibold text-[13px] text-neutral-text-primary truncate">{r.name}</span>
          <StatBadge label="" value={r.riskLevel} variant={riskBadgeVariant(r.riskLevel)} size="sm" />
        </div>
      ),
    },
    { key: 'trainingCount', title: '培训人次', width: 90, align: 'center' as const, sortable: true,
      render: (r: ProjectRowData) => <span className="tabular-nums font-medium">{r.trainingCount}</span> },
    {
      key: 'avgScore', title: '平均考核分', width: 160, sortable: true,
      render: (r: ProjectRowData) => (
        <div className="flex items-center gap-2">
          <span className={cn('text-[13px] font-bold tabular-nums w-11',
            scoreVariant(r.avgScore) === 'danger' ? 'text-semantic-danger'
              : scoreVariant(r.avgScore) === 'warning' ? 'text-semantic-warning' : 'text-semantic-success')}>{r.avgScore}</span>
          <div className="flex-1 h-1.5 bg-neutral-border/40 rounded-pill overflow-hidden">
            <div className={cn('h-full rounded-pill',
              r.avgScore < 70 ? 'bg-semantic-danger' : r.avgScore < 85 ? 'bg-semantic-warning' : 'bg-semantic-success')}
              style={{ width: `${r.avgScore}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'volume', title: '成交量', width: 130, sortable: true,
      render: (r: ProjectRowData) => (
        <div>
          <div className="text-[13px] font-semibold tabular-nums text-neutral-text-primary">{r.volume}</div>
          <div className="text-[10px] text-neutral-text-tertiary tabular-nums">¥{r.amount.toLocaleString()}</div>
        </div>
      ),
    },
    {
      key: 'complaintRate', title: '客诉率', width: 110, sortable: true,
      render: (r: ProjectRowData) => (
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-[13px] font-bold tabular-nums',
            r.complaintRate > 3 ? 'text-semantic-danger' : 'text-neutral-text-primary')}>{r.complaintRate}%</span>
          <TrendArrow value={r.complaintRateMom} />
        </div>
      ),
    },
    {
      key: 'repurchaseRate', title: '复购率', width: 110, sortable: true,
      render: (r: ProjectRowData) => (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold tabular-nums text-neutral-text-primary">{r.repurchaseRate}%</span>
          <TrendArrow value={r.repurchaseRateMom} />
        </div>
      ),
    },
    { key: 'coverage', title: '培训覆盖', width: 110,
      render: (r: ProjectRowData) => <ProgressBar value={r.coverage} variant="rose" height="sm" showValue /> },
    {
      key: 'action', title: '操作', width: 100, align: 'center' as const,
      render: (r: ProjectRowData) => (
        <button
          onClick={(e) => { e.stopPropagation(); openDrawer(r); }}
          className="px-3 py-1 text-[12px] font-bold text-brand-rose-600 hover:bg-brand-rose-50 rounded transition-colors"
        >
          查看诊断
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-full p-5 space-y-5">
      <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-neutral-text-tertiary flex-shrink-0" />
        <div className="flex flex-wrap items-center gap-2">
          {PROJECT_CATEGORIES.map(c => <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterChip>)}
        </div>
        <div className="w-px h-5 bg-neutral-border mx-1 hidden sm:block" />
        <div className="flex flex-wrap items-center gap-2">
          {RISK_LEVELS.map(r => <FilterChip key={r} active={risk === r} onClick={() => setRisk(r)}>{r}风险</FilterChip>)}
        </div>
        <div className="w-px h-5 bg-neutral-border mx-1 hidden sm:block" />
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map(s => <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</FilterChip>)}
        </div>
        <div className="flex-1 min-w-[200px]" />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-tertiary" strokeWidth={2} />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="按项目名搜索..."
            className="w-56 pl-9 pr-3 py-2 rounded-widget border border-neutral-border text-[12px] focus:outline-none focus:border-brand-rose-400 focus:ring-2 focus:ring-brand-rose-100 transition-all"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => {
              const idx = SORT_OPTIONS.findIndex(o => o.key === sortBy.key);
              setSortBy(SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length]);
            }}
            className={cn('px-3 py-2 rounded-widget text-[12px] font-semibold border transition-all inline-flex items-center gap-1',
              'bg-brand-indigo-50 border-brand-indigo-300 text-brand-indigo-700')}
          >
            {sortBy.label}
            {sortBy.order === 'asc' ? <SortAsc size={12} strokeWidth={2.5} /> : <SortDesc size={12} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <section className="rounded-card border border-neutral-border bg-white shadow-card p-5" style={{ minHeight: 420 }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">项目 × 岗位 培训覆盖矩阵</h2>
            <p className="text-[11px] text-neutral-text-tertiary mt-1 flex items-center gap-3">
              颜色越深覆盖率越高
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-semantic-danger inline-block" />
                <span className="text-semantic-danger font-semibold">红色&lt;60%需重点关注</span>
              </span>
            </p>
          </div>
          <span className="text-[11px] text-neutral-text-tertiary">共 {projects.length} 个项目 × {POSITION_NAMES.length} 个岗位</span>
        </div>
        {loading ? (
          <div className="h-[340px] bg-neutral-bg/60 rounded-widget animate-pulse-soft" />
        ) : (
          <HeatmapChart xCategories={POSITION_NAMES} yCategories={heatmapY} data={heatmapData} height={340} />
        )}
      </section>

      <section className="rounded-card border border-neutral-border bg-white shadow-card p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">项目经营关联表</h2>
            <p className="text-[11px] text-neutral-text-tertiary mt-1">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-semantic-dangerLight inline-block" />
                高客诉项目（客诉率&gt;3%）高亮显示
              </span>
            </p>
          </div>
          <span className="text-[11px] text-neutral-text-tertiary">共 {projectRows.length} 条记录</span>
        </div>
        <DataTable columns={columns} data={projectRows} loading={loading} rowKey="id" onRowClick={(r) => openDrawer(r)} />
      </section>

      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} project={selectedProject} position={selectedPosition} />
    </div>
  );
}
