import React, { useState, useEffect } from 'react';
import {
  Users, Trophy, Filter, ArrowUpRight, ArrowDownRight,
  ChevronDown, Target, Stethoscope, AlertTriangle, AlertCircle,
  ShoppingCart, PieChart, LineChart, Handshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData as fetchMockData } from '@/data/mock';
import { RadarChart, DualAxisLineChart, ScatterChart } from '@/components/charts';
import type {
  Position, Employee, TrainingRecord, ExamScore, BusinessRecord, PositionId, Store,
} from '@/data/types';

type TabType = 'radar' | 'trend';
type PositionChip = 'all' | PositionId;

interface TrendSeriesItem {
  name: string;
  data: number[];
  color?: string;
  dashed?: boolean;
}

const WEEKS = Array.from({ length: 12 }, (_, i) => `W${14 + i}`);

function SeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const AVATAR_PLACEHOLDER = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

interface PositionStats {
  id: string;
  name: string;
  color: string;
  count: number;
  completion: number;
  passRate: number;
  avgScore: number;
  conversionRate: number;
  yoy: number;
}

interface RankedEmp {
  id: string;
  name: string;
  avatar: string;
  position: string;
  storeName: string;
  score: number;
  conversionRate: number;
  orderCount: number;
}

export default function PositionAnalysis() {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [examScores, setExamScores] = useState<ExamScore[]>([]);
  const [businessRecords, setBusinessRecords] = useState<BusinessRecord[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [activeChip, setActiveChip] = useState<PositionChip>('all');
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRankPos, setSelectedRankPos] = useState<string>('consultant');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [pos, emps, tr, es, br, sts] = await Promise.all([
        fetchMockData('positions'),
        fetchMockData('employees'),
        fetchMockData('trainingRecords'),
        fetchMockData('examScores'),
        fetchMockData('businessRecords'),
        fetchMockData('stores'),
      ]);
      if (!mounted) return;
      setPositions(pos);
      setEmployees(emps);
      setTrainingRecords(tr);
      setExamScores(es);
      setBusinessRecords(br);
      setStores(sts);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const POS_COLORS: Record<string, string> = {
    consultant: '#6366f1',
    nurse: '#22c55e',
    doctor: '#ef4444',
    reception: '#f59e0b',
    technician: '#06b6d4',
  };

  const chips: Array<{ key: PositionChip; label: string }> = [
    { key: 'all', label: '全选' },
    ...positions.map(p => ({ key: p.id as PositionId, label: p.name })),
  ];

  const filteredPositions = activeChip === 'all'
    ? positions
    : positions.filter(p => p.id === activeChip);

  const calcStats = (pos: Position): PositionStats => {
    const rand = SeededRandom(pos.id.charCodeAt(0) * 7 + 100);
    const posEmps = employees.filter(e => e.positionId === pos.id);
    const count = posEmps.length;
    const empIds = new Set(posEmps.map(e => e.id));

    const relevantTr = trainingRecords.filter(r => empIds.has(r.employeeId));
    const completion = relevantTr.length > 0
      ? Math.round(relevantTr.filter(r => r.status === 'completed').length / relevantTr.length * 100)
      : 70;

    const relevantEs = examScores.filter(s => empIds.has(s.employeeId));
    const passRate = relevantEs.length > 0
      ? Math.round(relevantEs.filter(s => s.passed).length / relevantEs.length * 100)
      : 78;
    const avgScore = relevantEs.length > 0
      ? +(relevantEs.reduce((s, e) => s + e.totalScore, 0) / relevantEs.length).toFixed(1)
      : 82.5;

    const relevantBr = businessRecords.filter(b => empIds.has(b.employeeId));
    const conversionRate = relevantBr.length > 0
      ? +(relevantBr.filter(b => b.consultationConverted).length / relevantBr.length * 100).toFixed(1)
      : 65.0;

    return {
      id: pos.id,
      name: pos.name,
      color: POS_COLORS[pos.id] || '#6366f1',
      count,
      completion,
      passRate,
      avgScore,
      conversionRate,
      yoy: +((rand() - 0.35) * 18).toFixed(1),
    };
  };

  const positionStats: PositionStats[] = filteredPositions.map(calcStats);

  const radarIndicators = [
    { name: '学习完成率', max: 100 },
    { name: '考核通过率', max: 100 },
    { name: '实操达标率', max: 100 },
    { name: '客户满意度', max: 100 },
    { name: '合规达标率', max: 100 },
  ];

  const RADAR_DIMS = ['学习完成率', '考核通过率', '实操达标率', '客户满意度', '合规达标率'];

  const genRadarData = (seed: number, base: number) => {
    const rand = SeededRandom(seed);
    return RADAR_DIMS.map((_, i) =>
      Math.min(100, Math.max(55, Math.round(base + (rand() - 0.5) * 20 + i)))
    );
  };

  const radarSeries = positions.map((p, idx) => ({
    name: p.name,
    data: genRadarData(idx * 13 + 10, 72 + idx * 2),
    color: POS_COLORS[p.id],
  })).filter((_, idx) =>
    activeChip === 'all' ? true : positions[idx].id === activeChip
  );

  const genTrendData = (seed: number, count: number, base: number, variance: number) => {
    const rand = SeededRandom(seed);
    const data: number[] = [];
    let val = base;
    for (let i = 0; i < count; i++) {
      const delta = (rand() - 0.5) * variance;
      val = Math.max(55, Math.min(98, val + delta));
      data.push(+val.toFixed(1));
    }
    return data;
  };

  const trendLeftSeries = positions.map((p, idx) => ({
    name: `${p.name}通过率`,
    data: genTrendData(idx * 17 + 200, 12, 75 + idx * 2, 6),
    color: POS_COLORS[p.id],
  })).filter((_, idx) =>
    activeChip === 'all' ? true : positions[idx].id === activeChip
  );

  const trendRightSeries: TrendSeriesItem[] = [];

  const selectedRankPosition = positions.find(p => p.id === selectedRankPos);

  const rankList: RankedEmp[] = (() => {
    const rand = SeededRandom(999);
    const posEmps = employees.filter(e => e.positionId === selectedRankPos);
    return posEmps.slice(0, 5).map((emp, idx) => {
      const store = stores.find(s => s.id === emp.storeId);
      const empEs = examScores.filter(s => s.employeeId === emp.id);
      const score = empEs.length > 0
        ? +(empEs.reduce((s, e) => s + e.totalScore, 0) / empEs.length).toFixed(1)
        : +(80 + rand() * 18).toFixed(1);
      const empBr = businessRecords.filter(b => b.employeeId === emp.id);
      const conv = empBr.length > 0
        ? +(empBr.filter(b => b.consultationConverted).length / empBr.length * 100).toFixed(1)
        : +(60 + rand() * 30).toFixed(1);
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar || `${AVATAR_PLACEHOLDER}${emp.id}`,
        position: selectedRankPosition?.name || '',
        storeName: store?.name || '',
        score,
        conversionRate: conv,
        orderCount: Math.floor(5 + rand() * 50) + idx * 3,
      };
    }).sort((a, b) => b.score - a.score);
  })();

  const consultantPoints = (() => {
    const rand = SeededRandom(1234);
    const consultants = employees.filter(e => e.positionId === 'consultant');
    const pts: Array<{ x: number; y: number; value: number; size: number; label: string; id: string }> = [];
    consultants.slice(0, 28).forEach(c => {
      const empEs = examScores.filter(s => s.employeeId === c.id);
      const score = empEs.length > 0
        ? +(empEs.reduce((s, e) => s + e.totalScore, 0) / empEs.length).toFixed(1)
        : 60 + Math.round(rand() * 35);
      const empBr = businessRecords.filter(b => b.employeeId === c.id);
      const conv = empBr.length > 0
        ? +(empBr.filter(b => b.consultationConverted).length / empBr.length * 100).toFixed(1)
        : 25 + Math.round(rand() * 60);
      const dealAmount = empBr.reduce((s, b) => s + b.dealAmount, 0) / 1000;
      pts.push({
        x: Math.max(60, Math.min(100, score)),
        y: Math.max(20, Math.min(90, conv)),
        value: +(180 + rand() * 420).toFixed(0),
        size: +dealAmount.toFixed(0),
        label: c.name,
        id: c.id,
      });
    });
    return pts;
  })();

  const nursePoints = (() => {
    const rand = SeededRandom(5678);
    const nurses = employees.filter(e => e.positionId === 'nurse');
    const pts: Array<{ x: number; y: number; value: number; size: number; label: string; id: string }> = [];
    nurses.slice(0, 24).forEach(n => {
      const empEs = examScores.filter(s => s.employeeId === n.id);
      const score = empEs.length > 0
        ? +(empEs.reduce((s, e) => s + e.totalScore, 0) / empEs.length).toFixed(1)
        : 68 + Math.round(rand() * 30);
      const empBr = businessRecords.filter(b => b.employeeId === n.id);
      const abnormal = empBr.length > 0
        ? +(empBr.filter(b => b.postopAbnormal).length / empBr.length * 100).toFixed(2)
        : +(0.8 + rand() * 9).toFixed(2);
      pts.push({
        x: Math.max(65, Math.min(98, score)),
        y: Math.max(0.5, Math.min(14, abnormal)),
        value: +(85 + rand() * 100).toFixed(0),
        size: empBr.length + Math.round(rand() * 10),
        label: n.name,
        id: n.id,
      });
    });
    return pts;
  })();

  const Skeleton = ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-3 animate-pulse-soft">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-10 bg-neutral-border/40 rounded-widget" />
      ))}
    </div>
  );

  const CircleProgress = ({ value, color, size = 80 }: { value: number; color: string; size?: number }) => {
    const r = size / 2 - 8;
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(30,58,95,0.08)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
    );
  };

  return (
    <div className="min-h-full p-5 lg:p-6 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-page-title text-neutral-text-primary tracking-tight flex items-center gap-2.5">
          <Users size={26} className="text-brand-indigo-600" />
          岗位能力分析
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map(c => {
            const active = activeChip === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveChip(c.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-pill text-caption font-medium transition-all border',
                  active
                    ? 'bg-gradient-rose-gold text-white border-transparent shadow-sm'
                    : 'bg-white border-neutral-border text-neutral-text-secondary hover:bg-brand-indigo-50 hover:border-brand-indigo-200 hover:text-brand-indigo-700'
                )}
              >
                {c.label}
              </button>
            );
          })}
          <div className="w-px h-6 bg-neutral-border/70 mx-1 hidden sm:block" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-indigo-50 border border-brand-indigo-200/60 text-caption font-medium text-brand-indigo-700">
            <Filter size={12} /> 共 {filteredPositions.length} 个岗位
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {loading ? (
          Array.from({ length: Math.min(5, filteredPositions.length || 5) }).map((_, i) => (
            <div key={i} className="rounded-card bg-white shadow-card border border-neutral-border p-5 h-[220px] animate-pulse-soft">
              <div className="space-y-3">
                <div className="h-5 w-24 bg-neutral-border/50 rounded" />
                <div className="flex items-center justify-center my-3">
                  <div className="w-20 h-20 rounded-full bg-neutral-border/50" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-neutral-border/40 rounded" />
                  <div className="h-8 bg-neutral-border/40 rounded" />
                  <div className="h-8 bg-neutral-border/40 rounded" />
                </div>
                <div className="h-4 w-28 bg-neutral-border/40 rounded ml-auto" />
              </div>
            </div>
          ))
        ) : (
          positionStats.map((ps, idx) => (
            <div
              key={ps.id}
              className="rounded-card bg-white shadow-card border border-neutral-border p-5 card-hover card-rose-accent animate-fade-in-up overflow-hidden relative"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: ps.color }} />
                    <h3 className="text-body font-semibold text-neutral-text-primary">{ps.name}</h3>
                  </div>
                  <p className="text-caption text-neutral-text-tertiary">在职 {ps.count} 人</p>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-2 mb-4">
                <CircleProgress value={ps.completion} color={ps.color} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-kpi-sm font-bold tabular-nums text-neutral-text-primary">{ps.completion}%</span>
                  <span className="text-caption text-neutral-text-tertiary">完成率</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="text-center p-1.5 rounded-[6px] bg-neutral-bg/60">
                  <p className="text-caption text-neutral-text-tertiary mb-0.5">通过率</p>
                  <p className="text-body font-bold tabular-nums text-brand-indigo-700">{ps.passRate}%</p>
                </div>
                <div className="text-center p-1.5 rounded-[6px] bg-neutral-bg/60">
                  <p className="text-caption text-neutral-text-tertiary mb-0.5">平均分</p>
                  <p className="text-body font-bold tabular-nums text-brand-rose-700">{ps.avgScore}</p>
                </div>
                <div className="text-center p-1.5 rounded-[6px] bg-neutral-bg/60">
                  <p className="text-caption text-neutral-text-tertiary mb-0.5">转化率</p>
                  <p className="text-body font-bold tabular-nums text-semantic-success">{ps.conversionRate}%</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-1 border-t border-neutral-border/60">
                <span className="text-caption text-neutral-text-tertiary">同比</span>
                {ps.yoy >= 0 ? (
                  <ArrowUpRight size={14} className="text-semantic-success" strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight size={14} className="text-semantic-danger" strokeWidth={2.5} />
                )}
                <span className={cn(
                  'text-caption font-semibold tabular-nums',
                  ps.yoy >= 0 ? 'text-semantic-success' : 'text-semantic-danger'
                )}>
                  {ps.yoy >= 0 ? '+' : ''}{ps.yoy}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        <div className="lg:col-span-8 rounded-card bg-white shadow-card border border-neutral-border overflow-hidden animate-fade-in-up">
          <div className="px-5 pt-4 pb-3 border-b border-neutral-border flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <PieChart size={18} className="text-brand-indigo-600" />
              多维度能力对比分析
            </h2>
            <div className="inline-flex p-1 bg-neutral-bg/70 rounded-pill border border-neutral-border">
              <button
                onClick={() => setActiveTab('radar')}
                className={cn(
                  'px-4 py-1.5 rounded-pill text-caption font-semibold transition-all inline-flex items-center gap-1.5',
                  activeTab === 'radar'
                    ? 'bg-white text-brand-rose-700 shadow-sm'
                    : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                )}
              >
                <Target size={13} /> 能力雷达图
              </button>
              <button
                onClick={() => setActiveTab('trend')}
                className={cn(
                  'px-4 py-1.5 rounded-pill text-caption font-semibold transition-all inline-flex items-center gap-1.5',
                  activeTab === 'trend'
                    ? 'bg-white text-brand-rose-700 shadow-sm'
                    : 'text-neutral-text-secondary hover:text-neutral-text-primary'
                )}
              >
                <LineChart size={13} /> 通过率趋势
              </button>
            </div>
          </div>
          <div className="p-5">
            {activeTab === 'radar' ? (
              loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Skeleton lines={4} />
                </div>
              ) : (
                <RadarChart
                  indicators={radarIndicators}
                  series={radarSeries}
                  height={400}
                  loading={loading}
                />
              )
            ) : (
              loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Skeleton lines={4} />
                </div>
              ) : (
                <DualAxisLineChart
                  xAxisData={WEEKS}
                  leftSeries={trendLeftSeries}
                  rightSeries={trendRightSeries}
                  leftUnit="%"
                  rightUnit=""
                  title=""
                  height={400}
                  loading={loading}
                />
              )
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2">
              <Trophy size={18} className="text-brand-rose-600" />
              Top 员工排行榜
            </h2>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-neutral-border bg-white text-caption font-medium text-neutral-text-secondary hover:bg-neutral-bg transition-colors"
              >
                {selectedRankPosition?.name || '选择岗位'}
                <ChevronDown size={12} className={cn('transition-transform', dropdownOpen && 'rotate-180')} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-20 w-36 bg-white rounded-card border border-neutral-border shadow-card-hover overflow-hidden animate-fade-in-up">
                  {positions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedRankPos(p.id); setDropdownOpen(false); }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-body transition-colors flex items-center gap-2',
                        selectedRankPos === p.id ? 'bg-brand-rose-50/70 text-brand-rose-700 font-medium' : 'hover:bg-neutral-bg text-neutral-text-secondary'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: POS_COLORS[p.id] }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <Skeleton lines={5} />
          ) : rankList.length === 0 ? (
            <div className="py-12 text-center text-neutral-text-tertiary text-body">
              该岗位暂无员工数据
            </div>
          ) : (
            <div className="space-y-3">
              {rankList.map((emp, idx) => (
                <div
                  key={emp.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-[10px] border transition-all',
                    idx === 0
                      ? 'border-brand-rose-300/60 bg-gradient-to-br from-brand-rose-50/60 via-white to-white'
                      : 'border-neutral-border hover:border-brand-indigo-200/60 hover:bg-neutral-bg/30'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <img src={emp.avatar} alt="" className="w-11 h-11 rounded-full bg-neutral-border/50 object-cover" />
                    {idx < 3 && (
                      <div className={cn(
                        'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm',
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                          : 'bg-gradient-to-br from-amber-500 to-amber-700'
                      )}>
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-body font-semibold text-neutral-text-primary truncate">{emp.name}</p>
                    </div>
                    <p className="text-caption text-neutral-text-tertiary truncate">{emp.storeName}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-caption text-neutral-text-tertiary">考核分</p>
                      <p className={cn(
                        'text-body font-bold tabular-nums',
                        idx === 0 ? 'text-brand-rose-700' : 'text-brand-indigo-700'
                      )}>
                        {emp.score}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-caption text-neutral-text-tertiary flex items-center gap-0.5 justify-end">
                        <Handshake size={10} /> 转化
                      </p>
                      <p className="text-body font-bold tabular-nums text-semantic-success">{emp.conversionRate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-caption text-neutral-text-tertiary flex items-center gap-0.5 justify-end">
                        <ShoppingCart size={10} /> 客单
                      </p>
                      <p className="text-body font-bold tabular-nums text-neutral-text-primary">{emp.orderCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <div className="rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2 mb-1">
                <Target size={18} className="text-brand-indigo-600" />
                咨询师 - 转化能力分析
              </h2>
              <p className="text-caption text-neutral-text-tertiary">考核得分 × 实际转化率 · 点大小=成交量 · 颜色深浅=客单价</p>
            </div>
            <div className="text-right p-2.5 rounded-[8px] bg-semantic-warningLight border border-semantic-warning/30 max-w-[180px]">
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={14} className="text-semantic-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-caption font-semibold text-semantic-warning mb-0.5">⚠ 纸上谈兵警示</p>
                  <p className="text-caption text-neutral-text-secondary leading-snug">右下象限：高考核分但实际转化率偏低</p>
                </div>
              </div>
            </div>
          </div>
          <ScatterChart
            points={consultantPoints}
            xLabel="面诊考核分"
            yLabel="实际转化率"
            xUnit="分"
            yUnit="%"
            quadrantLines={{ x: 80, y: 60 }}
            colorRange={['#8DA8D2', '#C9A96E']}
            height={380}
            loading={loading}
          />
        </div>

        <div className="rounded-card bg-white shadow-card border border-neutral-border p-5 animate-fade-in-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-section-title text-neutral-text-primary flex items-center gap-2 mb-1">
                <Stethoscope size={18} className="text-brand-rose-600" />
                护士 - 操作规范分析
              </h2>
              <p className="text-caption text-neutral-text-tertiary">规范考核分 × 术后异常率 · 点大小=操作量 · 颜色深浅=达标分</p>
            </div>
            <div className="text-right p-2.5 rounded-[8px] bg-semantic-dangerLight border border-semantic-danger/30 max-w-[180px]">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={14} className="text-semantic-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-caption font-semibold text-semantic-danger mb-0.5">🔴 高风险操作</p>
                  <p className="text-caption text-neutral-text-secondary leading-snug">右上象限：考核分低且异常率偏高</p>
                </div>
              </div>
            </div>
          </div>
          <ScatterChart
            points={nursePoints}
            xLabel="操作规范考核分"
            yLabel="术后回访异常率"
            xUnit="分"
            yUnit="%"
            quadrantLines={{ x: 85, y: 5 }}
            colorRange={['#F4A9A9', '#6BC5A9']}
            height={380}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
