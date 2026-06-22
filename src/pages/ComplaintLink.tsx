import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DualAxisLineChart } from '@/components/charts';
import DataTable from '@/components/common/DataTable';
import KPICard from '@/components/common/KPICard';
import ProgressBar from '@/components/common/ProgressBar';
import StatBadge from '@/components/common/StatBadge';
import { useMockData } from '@/data/mock';
import type { Project, Employee, KnowledgePoint, Complaint, Store } from '@/data/types';
import { cn } from '@/lib/utils';
import ExpandTable from './ComplaintLink.ExpandTable';
import {
  WEEKS, buildTypeRows, severityBadge,
} from './ComplaintLink.shared';

function FilterChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-pill text-[11px] font-semibold transition-all duration-200 border whitespace-nowrap',
        active
          ? 'bg-gradient-rose-gold text-white border-transparent shadow-sm'
          : 'bg-white text-neutral-text-secondary border-neutral-border hover:border-brand-rose-300 hover:text-brand-rose-600'
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold',
      resolved ? 'bg-semantic-successLight text-semantic-success' : 'bg-semantic-warningLight text-semantic-warning')}>
      {resolved ? '已解决' : '处理中'}
    </span>
  );
}

export default function ComplaintLink() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kps, setKps] = useState<KnowledgePoint[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [severityFilter, setSeverityFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [catFilter, setCatFilter] = useState('全部');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [cs, ps, es, ks, ss] = await Promise.all([
        useMockData('complaints'), useMockData('projects'), useMockData('employees'),
        useMockData('knowledgePoints'), useMockData('stores'),
      ]);
      setComplaints(cs); setProjects(ps); setEmployees(es); setKps(ks); setStores(ss);
      setLoading(false);
    })();
  }, []);

  const typeRows = useMemo(() => buildTypeRows(complaints, kps, employees, stores), [complaints, kps, employees, stores]);

  const top5Projects = useMemo(() => {
    const rnd = (seed: number) => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
    return projects.map((p, i) => {
      const rand = rnd(i * 11 + p.id.length);
      const vol = 30 + Math.floor(rand() * 120);
      const rate = +(1 + rand() * 6).toFixed(2);
      return { ...p, volume: vol, complaintRate: rate, amount: p.price * vol };
    }).sort((a, b) => b.complaintRate - a.complaintRate).slice(0, 5);
  }, [projects]);

  const weekComplaints = [22, 18, 25, 20, 14, 11, 8, 9];
  const weekTraining = [45, 52, 60, 78, 95, 110, 125, 130];
  const isTrainingEffective = weekComplaints[0] > weekComplaints[weekComplaints.length - 1]
    && weekTraining[0] < weekTraining[weekTraining.length - 1];

  const monthTotal = complaints.length;
  const majorCount = complaints.filter(c => c.severity === '重大').length;
  const resolvedRate = monthTotal > 0 ? +(complaints.filter(c => c.resolved).length / monthTotal * 100).toFixed(1) : 0;
  const linkedRate = monthTotal > 0 ? +(complaints.filter(c => c.relatedKnowledgeGapIds.length > 0).length / monthTotal * 100).toFixed(1) : 0;

  const complaintListData = useMemo(() => {
    let list = complaints.map(c => {
      const p = projects.find(x => x.id === c.projectId);
      const e = employees.find(x => x.id === c.employeeId);
      const kpNames = c.relatedKnowledgeGapIds
        .slice(0, 2)
        .map(id => kps.find(k => k.id === id)?.name)
        .filter(Boolean)
        .join('、');
      return {
        id: c.id, date: c.date, projectName: p?.name || '-', projectCat: p?.category || '',
        type: c.type, severity: c.severity, empName: e?.name || '-',
        empAvatar: e?.avatar, kp: kpNames || '未关联', resolved: c.resolved,
      };
    });
    if (severityFilter !== '全部') list = list.filter(x => x.severity === severityFilter);
    if (statusFilter !== '全部') list = list.filter(x => (statusFilter === '已解决' ? x.resolved : !x.resolved));
    if (catFilter !== '全部') list = list.filter(x => x.projectCat === catFilter);
    return list;
  }, [complaints, projects, employees, kps, severityFilter, statusFilter, catFilter]);

  const listColumns = [
    { key: 'date', title: '日期', width: 110, render: (r: any) => <span className="tabular-nums">{r.date}</span> },
    { key: 'projectName', title: '项目', width: 110, render: (r: any) => <span className="font-medium">{r.projectName}</span> },
    { key: 'type', title: '类型', width: 110 },
    {
      key: 'severity', title: '严重程度', width: 90, align: 'center' as const,
      render: (r: any) => <StatBadge label="" value={r.severity} variant={severityBadge(r.severity) as any} size="sm" />,
    },
    {
      key: 'empName', title: '责任员工', width: 140,
      render: (r: any) => (
        <span className="inline-flex items-center gap-2 min-w-0">
          {r.empAvatar && <img src={r.empAvatar} className="w-6 h-6 rounded-full flex-shrink-0" />}
          <span className="truncate">{r.empName}</span>
        </span>
      ),
    },
    { key: 'kp', title: '关联知识点', width: 200, render: (r: any) => <span className="text-[11px] text-neutral-text-secondary">{r.kp}</span> },
    {
      key: 'resolved', title: '状态', width: 90, align: 'center' as const,
      render: (r: any) => <StatusBadge resolved={r.resolved} />,
    },
    {
      key: 'action', title: '操作', width: 110, align: 'center' as const,
      render: () => (
        <span className="inline-flex gap-2">
          <button className="text-[11px] font-bold text-brand-indigo-600 hover:underline">详情</button>
          <button className="text-[11px] font-bold text-brand-rose-600 hover:underline">关联培训</button>
        </span>
      ),
    },
  ];

  const rankColors = ['#C9A96E', '#416EB4', '#678BC3', '#8DA8D2', 'rgba(30,58,95,0.2)'];

  if (loading) {
    return (
      <div className="min-h-full p-5 space-y-5">
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-card bg-white border border-neutral-border shadow-card animate-pulse-soft" />
          ))}
        </div>
        <div className="h-[600px] rounded-card bg-white border border-neutral-border shadow-card animate-pulse-soft" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-5 space-y-5">
      <div className="grid grid-cols-4 gap-5">
        <KPICard title="本月客诉总量" value={monthTotal} format="number" variant="info" icon={AlertCircle} momChange={-8.4} delay={0} />
        <KPICard title="重大客诉量" value={majorCount} format="number" variant="danger" momChange={-22.3} delay={60} />
        <div className="relative rounded-card p-5 shadow-card border border-neutral-border bg-gradient-kpi-success animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-caption text-neutral-text-secondary font-medium">客诉解决率</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-kpi font-bold tabular-nums text-neutral-text-primary tracking-tight">{resolvedRate}</span>
            <span className="text-body text-neutral-text-secondary font-medium">%</span>
          </div>
          <ProgressBar value={resolvedRate} variant="success" height="sm" />
        </div>
        <div className="relative rounded-card p-5 shadow-card border border-neutral-border bg-gradient-kpi-info animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-caption text-neutral-text-secondary font-medium">培训关联覆盖率</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-kpi font-bold tabular-nums text-neutral-text-primary tracking-tight">{linkedRate}</span>
            <span className="text-body text-neutral-text-secondary font-medium">%</span>
          </div>
          <ProgressBar value={linkedRate} variant="rose" height="sm" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-7 rounded-card border border-neutral-border bg-white shadow-card p-5 min-h-[500px]">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">客诉类型 → 知识点缺口 → 需补训人员</h2>
              <p className="text-[11px] text-neutral-text-tertiary mt-1">点击行展开下一级详情</p>
            </div>
            <span className="text-[11px] text-neutral-text-tertiary">{typeRows.length} 类客诉</span>
          </div>
          <ExpandTable rows={typeRows} />
        </section>

        <section className="col-span-5 flex flex-col gap-5">
          <div className="rounded-card border border-neutral-border bg-white shadow-card p-5">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">Top 5 高客诉项目</h2>
              <span className="text-[11px] text-neutral-text-tertiary">点击跳转项目专题</span>
            </div>
            <div className="space-y-2.5">
              {top5Projects.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/project')}
                  className={cn(
                    'relative rounded-widget overflow-hidden cursor-pointer transition-all hover:shadow-md',
                    i === 0
                      ? 'bg-gradient-to-r from-semantic-danger/8 via-white to-white border border-semantic-danger/30 p-4'
                      : 'bg-neutral-bg/30 border border-neutral-border/60 p-3'
                  )}
                  style={i === 0 ? { borderLeft: '4px solid #E05A5A' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white',
                        i === 0 ? 'w-10 h-10 text-xl' : 'w-7 h-7 text-[13px]'
                      )}
                      style={{ backgroundColor: rankColors[i] }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={cn('font-semibold text-neutral-text-primary truncate', i === 0 ? 'text-[15px]' : 'text-[13px]')}>{p.name}</div>
                      {i === 0 && (
                        <div className="text-[11px] text-neutral-text-tertiary mt-1">
                          成交量 <span className="tabular-nums font-semibold text-brand-indigo-600">{p.volume}</span>
                          <span className="mx-1.5 opacity-40">|</span>
                          总金额 <span className="tabular-nums font-semibold text-brand-rose-600">¥{p.amount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={cn('font-bold tabular-nums text-semantic-danger', i === 0 ? 'text-xl' : 'text-[14px]')}>
                        {p.complaintRate}%
                      </div>
                      <div className="text-[10px] text-neutral-text-tertiary">客诉率</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-neutral-border bg-white shadow-card p-5 flex-1">
            <div className="flex items-end justify-between mb-2">
              <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">客诉量 vs 相关培训完成量</h2>
              {isTrainingEffective
                ? <span className="text-[11px] font-bold text-semantic-success">✓ 培训有效</span>
                : <span className="text-[11px] font-bold text-semantic-danger">! 培训效果待验证</span>}
            </div>
            <p className={cn('text-[10px] mb-3', isTrainingEffective ? 'text-semantic-success' : 'text-semantic-danger')}>
              {isTrainingEffective
                ? '近8周培训完成量持续上升，客诉量呈下降趋势，相关性显著'
                : '客诉与培训量相关性不明显，建议调整培训内容侧重'}
            </p>
            <DualAxisLineChart
              xAxisData={WEEKS}
              leftSeries={[{ name: '客诉数量', data: weekComplaints, color: '#E05A5A' }]}
              rightSeries={[{ name: '培训完成人次', data: weekTraining, color: '#C9A96E' }]}
              leftUnit="件" rightUnit="人次" height={220}
            />
          </div>
        </section>
      </div>

      <section className="rounded-card border border-neutral-border bg-white shadow-card p-5">
        <div className="flex flex-wrap items-end justify-between mb-4 gap-3">
          <div>
            <h2 className="font-serif text-section-title text-neutral-text-primary font-semibold">客诉时间趋势明细</h2>
            <p className="text-[11px] text-neutral-text-tertiary mt-1">共 {complaintListData.length} 条记录</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={statusFilter === '全部'} onClick={() => setStatusFilter('全部')}>全部状态</FilterChip>
            <FilterChip active={statusFilter === '已解决'} onClick={() => setStatusFilter('已解决')}>已解决</FilterChip>
            <FilterChip active={statusFilter === '处理中'} onClick={() => setStatusFilter('处理中')}>处理中</FilterChip>
            <div className="w-px h-5 bg-neutral-border mx-1 hidden sm:block" />
            <FilterChip active={severityFilter === '全部'} onClick={() => setSeverityFilter('全部')}>全部程度</FilterChip>
            <FilterChip active={severityFilter === '一般'} onClick={() => setSeverityFilter('一般')}>一般</FilterChip>
            <FilterChip active={severityFilter === '严重'} onClick={() => setSeverityFilter('严重')}>严重</FilterChip>
            <FilterChip active={severityFilter === '重大'} onClick={() => setSeverityFilter('重大')}>重大</FilterChip>
            <div className="w-px h-5 bg-neutral-border mx-1 hidden sm:block" />
            <FilterChip active={catFilter === '全部'} onClick={() => setCatFilter('全部')}>全部项目</FilterChip>
            {['皮肤', '注射', '手术', '仪器'].map(c => (
              <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</FilterChip>
            ))}
          </div>
        </div>
        <DataTable columns={listColumns} data={complaintListData} rowKey="id" loading={loading} />
      </section>
    </div>
  );
}
