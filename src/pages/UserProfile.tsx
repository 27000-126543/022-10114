import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserPlus, MessageSquare, Award, AlertCircle, TrendingUp,
  CheckCircle2, XCircle, Clock, ChevronRight, FileText,
  ShoppingCart, RefreshCw, Calendar, MapPin, X, Send, Search,
} from 'lucide-react';
import { useMockData, employees, positions, stores, certificates, complaints, businessRecords, mentorships, examScores, knowledgePoints, trainingCourses } from '@/data/mock';
import type { Employee, KnowledgePoint, Mentorship, Certificate as CertType } from '@/data/types';
import HeatmapChart from '@/components/charts/HeatmapChart';
import DualAxisLineChart from '@/components/charts/DualAxisLineChart';
import DataTable from '@/components/common/DataTable';
import { cn } from '@/lib/utils';

const levelColors: Record<string, string> = {
  S: 'bg-gradient-rose-gold text-white',
  A: 'bg-semantic-successLight text-semantic-success',
  B: 'bg-semantic-infoLight text-semantic-info',
  C: 'bg-semantic-warningLight text-semantic-warning',
};

const tagVariantMap: Record<string, string> = {
  '金牌咨询师': 'rose',
  '金牌销冠': 'rose',
  '带教老师': 'info',
  '资深护师': 'info',
  '主刀医师': 'success',
  '副主任': 'success',
  '需关注': 'warning',
  '新人': 'danger',
  '新员工': 'danger',
};

const getTagVariant = (tag: string) => {
  for (const key of Object.keys(tagVariantMap)) {
    if (tag.includes(key)) return tagVariantMap[key];
  }
  return 'default';
};

const LevelBadge: React.FC<{ level: string }> = ({ level }) => (
  <span className={cn(
    'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shadow-sm',
    levelColors[level] || 'bg-neutral-border text-neutral-text-primary'
  )}>{level}</span>
);

const TagBadge: React.FC<{ tag: string }> = ({ tag }) => {
  const variant = getTagVariant(tag);
  const styles: Record<string, string> = {
    rose: 'bg-brand-rose-50 text-brand-rose-700 border border-brand-rose-200',
    success: 'bg-semantic-successLight text-semantic-success border border-semantic-success/30',
    info: 'bg-semantic-infoLight text-semantic-info border border-semantic-info/30',
    warning: 'bg-semantic-warningLight text-semantic-warning border border-semantic-warning/30',
    danger: 'bg-semantic-dangerLight text-semantic-danger border border-semantic-danger/30',
    default: 'bg-neutral-bg text-neutral-text-secondary border border-neutral-border',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-semibold',
      styles[variant]
    )}>{tag}</span>
  );
};

const SmallStat: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType; variant?: string }> = ({
  label, value, icon: Icon, variant = 'info'
}) => {
  const accentColors: Record<string, string> = {
    success: 'text-semantic-success',
    warning: 'text-semantic-warning',
    danger: 'text-semantic-danger',
    info: 'text-brand-indigo-500',
    rose: 'text-brand-rose-500',
  };
  return (
    <div className="rounded-widget p-3 bg-neutral-bg/60 border border-neutral-border">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={13} className={accentColors[variant]} strokeWidth={2} />}
        <span className="text-[10px] font-medium text-neutral-text-tertiary">{label}</span>
      </div>
      <div className={cn('text-lg font-bold tabular-nums', accentColors[variant])}>{value}</div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 relative',
      active
        ? 'text-brand-indigo-700 bg-white border border-b-0 border-neutral-border -mb-px'
        : 'text-neutral-text-tertiary hover:text-neutral-text-primary hover:bg-white/50'
    )}
  >
    {active && <span className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-rose-gold rounded-t-lg" />}
    {children}
  </button>
);

const EmployeeSwitcher: React.FC<{ currentId: string; onSelect: (id: string) => void; list: Employee[] }> = ({
  currentId, onSelect, list,
}) => (
  <div className="rounded-card border border-neutral-border bg-white shadow-card overflow-hidden mb-4">
    <div className="px-4 py-3 border-b border-neutral-border/60 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-indigo/10 flex items-center justify-center">
          <UserPlus size={15} className="text-brand-indigo-600" />
        </div>
        <span className="text-sm font-semibold text-neutral-text-primary">切换员工</span>
      </div>
      <span className="text-[11px] text-neutral-text-tertiary">共 {list.length} 人</span>
    </div>
    <div className="max-h-[320px] overflow-y-auto p-2">
      <div className="space-y-1">
        {list.slice(0, 20).map((emp) => {
          const active = emp.id === currentId;
          const pos = positions.find(p => p.id === emp.positionId);
          return (
            <button
              key={emp.id}
              onClick={() => onSelect(emp.id)}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-150 text-left group',
                active
                  ? 'bg-gradient-to-r from-brand-rose-50 to-brand-rose-50/40 border border-brand-rose-200 shadow-sm'
                  : 'hover:bg-brand-indigo-50/40 border border-transparent'
              )}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className={cn(
                    'w-9 h-9 rounded-full object-cover border-2',
                    active ? 'border-brand-rose-400' : 'border-white shadow-sm'
                  )}
                />
                <div className="absolute -bottom-0.5 -right-0.5">
                  <LevelBadge level={emp.level} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-semibold truncate',
                    active ? 'text-brand-rose-700' : 'text-neutral-text-primary'
                  )}>{emp.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-px rounded" style={{
                    background: pos ? `${pos.color}15` : 'transparent',
                    color: pos?.color,
                  }}>{pos?.name}</span>
                  <span className="text-[10px] text-neutral-text-tertiary flex items-center gap-0.5 truncate">
                    <MapPin size={9} />
                    {stores.find(s => s.id === emp.storeId)?.name.slice(0, 5)}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className={cn(
                'flex-shrink-0 transition-colors',
                active ? 'text-brand-rose-500' : 'text-neutral-text-tertiary group-hover:text-neutral-text-secondary'
              )} />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const MentorshipForm: React.FC<{ open: boolean; onClose: () => void; employee: Employee | null }> = ({ open, onClose, employee }) => {
  const [mentorId, setMentorId] = useState('');
  const [kpIds, setKpIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const mentors = employees.filter(e => (e.level === 'S' || e.level === 'A') && e.storeId === employee?.storeId);
  const targetKps = knowledgePoints.slice(0, 12);

  if (!open || !employee) return null;

  const toggleKp = (id: string) => {
    setKpIds(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    console.log('提交带教申请:', { menteeId: employee.id, mentorId, kpIds, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-card shadow-card-hover w-[560px] max-h-[85vh] overflow-hidden border border-neutral-border animate-slide-in-right">
        <div className="px-5 py-4 border-b border-neutral-border/60 flex items-center justify-between bg-gradient-to-r from-brand-rose-50/50 to-transparent">
          <div>
            <h3 className="text-section-title font-bold text-brand-indigo-800 font-serif">安排一对一带教</h3>
            <p className="text-caption text-neutral-text-tertiary mt-0.5">为 <span className="text-brand-rose-600 font-semibold">{employee.name}</span> 制定专属提升计划</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/80 flex items-center justify-center text-neutral-text-tertiary hover:text-neutral-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div>
            <label className="block text-sm font-medium text-neutral-text-primary mb-2">选择导师</label>
            <select
              value={mentorId}
              onChange={e => setMentorId(e.target.value)}
              className="w-full rounded-widget border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose-400/50 focus:border-brand-rose-400 bg-white"
            >
              <option value="">请选择导师</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name} - {positions.find(p => p.id === m.positionId)?.name} ({m.level}级)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-primary mb-2">选择知识点</label>
            <div className="grid grid-cols-2 gap-2">
              {targetKps.map(kp => (
                <button
                  key={kp.id}
                  onClick={() => toggleKp(kp.id)}
                  className={cn(
                    'text-left p-2.5 rounded-widget border text-[11px] transition-all duration-150',
                    kpIds.includes(kp.id)
                      ? 'border-brand-rose-400 bg-brand-rose-50 text-brand-rose-700'
                      : 'border-neutral-border bg-white hover:border-brand-indigo-200 text-neutral-text-secondary'
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <span className={cn(
                      'mt-0.5 w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center',
                      kpIds.includes(kp.id) ? 'bg-gradient-rose-gold border-transparent' : 'border-neutral-border'
                    )}>
                      {kpIds.includes(kp.id) && <CheckCircle2 size={10} className="text-white" />}
                    </span>
                    <span className="line-clamp-2 leading-relaxed">{kp.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-primary mb-2">带教备注</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="请输入带教计划和注意事项..."
              className="w-full rounded-widget border border-neutral-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-rose-400/50 focus:border-brand-rose-400"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-neutral-border/60 bg-neutral-bg/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-text-secondary bg-white border border-neutral-border hover:bg-neutral-bg transition-colors"
          >取消</button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 ripple"
          >
            <Send size={14} />确认安排
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserProfile() {
  const { userId = 'emp-001' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [topTab, setTopTab] = useState<'heatmap' | 'line'>('heatmap');
  const [bottomTab, setBottomTab] = useState<'weaklist' | 'mentorship'>('weaklist');
  const [mentorOpen, setMentorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWeak, setSelectedWeak] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [currentUserId]);

  useEffect(() => {
    setCurrentUserId(userId || 'emp-001');
  }, [userId]);

  const employee = employees.find(e => e.id === currentUserId) || employees[0];
  const position = positions.find(p => p.id === employee.positionId);
  const store = stores.find(s => s.id === employee.storeId);

  const hireMonths = useMemo(() => {
    const hire = new Date(employee.hireDate);
    const diff = Date.now() - hire.getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return months >= 12 ? `${Math.floor(months / 12)}年${months % 12}个月` : `${months}个月`;
  }, [employee]);

  const empExamScores = examScores.filter(s => s.employeeId === employee.id);
  const totalExams = empExamScores.length;
  const examStats = useMemo(() => {
    if (empExamScores.length === 0) return { max: 0, min: 0, avg: 0 };
    const scores = empExamScores.map(s => s.totalScore);
    return {
      max: Math.max(...scores),
      min: Math.min(...scores),
      avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
    };
  }, [empExamScores]);

  const empCertificates = certificates.filter(c => c.employeeId === employee.id);
  const empComplaints = complaints.filter(c => c.employeeId === employee.id && (Date.now() - new Date(c.date).getTime()) < 90 * 24 * 3600 * 1000);
  const empBusiness = businessRecords.filter(b => b.employeeId === employee.id && (Date.now() - new Date(b.date).getTime()) < 90 * 24 * 3600 * 1000);

  const heatmapData = useMemo(() => {
    const yCats = knowledgePoints.slice(0, 20);
    const xCats = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (5 - i) * 14);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const data: [number, number, number][] = [];
    for (let yi = 0; yi < yCats.length; yi++) {
      for (let xi = 0; xi < xCats.length; xi++) {
        const base = 55 + Math.floor(Math.sin((yi + xi) * 0.5) * 20) + yi % 3 * 5;
        data.push([xi, yi, Math.max(30, Math.min(100, base + Math.floor(Math.random() * 15) - 5))]);
      }
    }
    return { xCats, yCats: yCats.map(k => k.name), data };
  }, [employee.id]);

  const weakCells = useMemo(() => {
    const yLen = 20, xLen = 6;
    const weak: Array<{ yi: number; xi: number; kp: KnowledgePoint; count: number; recentScores: number[] }> = [];
    for (let yi = 0; yi < yLen; yi++) {
      let consec = 0;
      const recent = [];
      for (let xi = xLen - 1; xi >= 0; xi--) {
        const idx = yi * xLen + xi;
        const score = heatmapData.data[idx]?.[2] || 0;
        recent.unshift(score);
        if (score < 70) consec++;
        else break;
      }
      if (consec >= 3) {
        weak.push({
          yi,
          xi: xLen - consec,
          kp: knowledgePoints[yi],
          count: consec,
          recentScores: recent.slice(0, 3),
        });
      }
    }
    return weak;
  }, [heatmapData.data]);

  const lineData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const selfScores = months.map(() => 60 + Math.floor(Math.random() * 35));
    const avgScores = months.map(() => 72 + Math.floor(Math.random() * 12));
    return { months, selfScores, avgScores };
  }, [employee.id]);

  const empMentorships = mentorships.filter(m => m.menteeId === employee.id);
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter(e =>
      e.name.includes(searchTerm) ||
      e.id.includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const businessStats = useMemo(() => {
    const converted = empBusiness.filter(b => b.consultationConverted);
    const total = converted.reduce((s, b) => s + b.dealAmount, 0);
    const repurchases = converted.filter(b => b.repurchaseFlag).length;
    return { orders: converted.length, total, repurchases };
  }, [empBusiness]);

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="h-[360px] bg-white rounded-card animate-pulse-soft" />
          <div className="h-[400px] bg-white rounded-card animate-pulse-soft" />
        </div>
        <div className="col-span-7 space-y-4">
          <div className="h-[340px] bg-white rounded-card animate-pulse-soft" />
          <div className="h-[300px] bg-white rounded-card animate-pulse-soft" />
        </div>
        <div className="col-span-2 space-y-4">
          <div className="h-[200px] bg-white rounded-card animate-pulse-soft" />
          <div className="h-[200px] bg-white rounded-card animate-pulse-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EmployeeSwitcher currentId={currentUserId} list={filteredEmployees} onSelect={(id) => {
        setCurrentUserId(id);
        navigate(`/profile/${id}`);
      }} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="rounded-card border border-neutral-border bg-white shadow-card p-5 card-hover card-rose-accent animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-rose-gold opacity-70 animate-pulse-soft" />
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="relative w-[80px] h-[80px] rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-neutral-text-primary font-serif">{employee.name}</h2>
                <LevelBadge level={employee.level} />
              </div>
              <p className="text-sm text-brand-indigo-600 font-medium mb-2">{position?.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-neutral-text-tertiary mb-4">
                <MapPin size={11} />
                <span>{store?.name}</span>
                <span className="mx-1">·</span>
                <Calendar size={11} />
                <span>入职 {hireMonths}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                {employee.tags.map((t, i) => <TagBadge key={i} tag={t} />)}
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mb-5">
                <SmallStat label="总考核" value={totalExams} icon={FileText} variant="info" />
                <SmallStat label="最高分" value={examStats.max} icon={TrendingUp} variant="success" />
                <SmallStat label="最低分" value={examStats.min} icon={AlertCircle} variant="danger" />
                <SmallStat label="平均分" value={examStats.avg} icon={Award} variant="rose" />
              </div>
              <div className="w-full space-y-2">
                <button
                  onClick={() => setMentorOpen(true)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 ripple"
                >
                  <UserPlus size={15} />安排一对一带教
                </button>
                <button
                  onClick={() => console.log('发送提醒给', employee.name)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-brand-indigo-700 bg-brand-indigo-50 border border-brand-indigo-100 hover:bg-brand-indigo-100/80 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={15} />发送提醒消息
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-neutral-border bg-white shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-border/60">
              <div className="flex items-center gap-2">
                <Search size={13} className="text-neutral-text-tertiary" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="搜索员工姓名/工号"
                  className="w-full text-xs bg-transparent outline-none placeholder:text-neutral-text-tertiary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-7 space-y-4">
          <div className="rounded-card border border-neutral-border bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <div className="px-5 pt-3 border-b border-neutral-border/60 flex items-end gap-1 bg-gradient-to-b from-neutral-bg/40 to-transparent">
              <TabButton active={topTab === 'heatmap'} onClick={() => setTopTab('heatmap')}>知识掌握热力图</TabButton>
              <TabButton active={topTab === 'line'} onClick={() => setTopTab('line')}>考核轨迹曲线</TabButton>
            </div>
            <div className="p-5">
              {topTab === 'heatmap' ? (
                <div>
                  <HeatmapChart
                    xCategories={heatmapData.xCats}
                    yCategories={heatmapData.yCats}
                    data={heatmapData.data}
                    height={360}
                  />
                  <div className="mt-4 flex items-center justify-center gap-5 text-[11px] text-neutral-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded" style={{ background: '#27AE60' }} />90分以上
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded" style={{ background: '#F2C94C' }} />75-89分
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded" style={{ background: '#F2994A' }} />60-74分
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded animate-breath" style={{ background: '#E05A5A' }} />60分以下
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <DualAxisLineChart
                    xAxisData={lineData.months}
                    leftSeries={[{ name: '考核总分数', data: lineData.selfScores, color: '#416EB4' }]}
                    rightSeries={[{ name: '岗位平均分', data: lineData.avgScores, color: '#C9A96E', dashed: true }]}
                    leftUnit="分数"
                    rightUnit="平均分"
                    height={360}
                  />
                  <div className="mt-2 flex items-center justify-center gap-6 text-[11px] text-neutral-text-tertiary">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-semantic-success flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                      <span>带教培训日期</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-gradient-rose-gold" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                      <span>重大考核节点</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-card border border-neutral-border bg-white shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '160ms' }}>
            <div className="px-5 pt-3 border-b border-neutral-border/60 flex items-end justify-between bg-gradient-to-b from-neutral-bg/40 to-transparent">
              <div className="flex items-end gap-1">
                <TabButton active={bottomTab === 'weaklist'} onClick={() => setBottomTab('weaklist')}>连续低分知识点</TabButton>
                <TabButton active={bottomTab === 'mentorship'} onClick={() => setBottomTab('mentorship')}>历史带教记录</TabButton>
              </div>
              {bottomTab === 'weaklist' && selectedWeak.length > 0 && (
                <button
                  onClick={() => {
                    console.log('批量安排带教:', selectedWeak);
                    setMentorOpen(true);
                  }}
                  className="mb-2.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                >
                  <UserPlus size={13} />批量安排带教 ({selectedWeak.length})
                </button>
              )}
            </div>
            <div className="p-4">
              {bottomTab === 'weaklist' ? (
                <div>
                  <DataTable
                    columns={[
                      {
                        key: 'name', title: '知识点名称',
                        render: (row) => (
                          <div>
                            <div className="text-sm font-medium text-neutral-text-primary line-clamp-1">{row.kp.name}</div>
                            <div className="text-[10px] text-neutral-text-tertiary mt-0.5">{row.kp.category}</div>
                          </div>
                        ),
                      },
                      { key: 'category', title: '类别', width: 80, render: (row) => (
                        <span className="text-[10px] px-2 py-0.5 rounded-pill bg-brand-indigo-50 text-brand-indigo-700 font-medium">{row.kp.category}</span>
                      )},
                      {
                        key: 'count', title: '连续低分', width: 90, align: 'center',
                        render: (row) => (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-semantic-dangerLight text-semantic-danger animate-breath">
                            <AlertCircle size={10} />连续{row.count}次
                          </span>
                        ),
                      },
                      {
                        key: 'scores', title: '最近3次得分', width: 150,
                        render: (row) => (
                          <div className="flex items-center gap-1.5">
                            {row.recentScores.map((s: number, i: number) => (
                              <span key={i} className={cn(
                                'w-8 h-6 rounded flex items-center justify-center text-[10px] font-bold tabular-nums',
                                s >= 90 ? 'bg-semantic-successLight text-semantic-success' :
                                s >= 75 ? 'bg-semantic-warningLight text-semantic-warning' :
                                'bg-semantic-dangerLight text-semantic-danger'
                              )}>{s}</span>
                            ))}
                          </div>
                        ),
                      },
                      {
                        key: 'action', title: '建议动作', width: 120,
                        render: () => (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-brand-rose-50 text-brand-rose-700 border border-brand-rose-200">
                            <RefreshCw size={10} />安排带教
                          </span>
                        ),
                      },
                    ]}
                    data={weakCells.map((w, i) => ({ ...w, id: `weak-${i}` }))}
                    selectable
                    selectedKeys={selectedWeak}
                    onSelectChange={setSelectedWeak}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {empMentorships.length === 0 ? (
                    <div className="py-10 text-center text-neutral-text-tertiary text-sm">暂无带教记录</div>
                  ) : (
                    <div className="relative pl-6">
                      <div className="absolute left-[9px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-brand-rose-300 via-brand-indigo-200 to-transparent rounded-full" />
                      {empMentorships.map(m => {
                        const mentor = employees.find(e => e.id === m.mentorId);
                        const statusMap = {
                          completed: { label: '已通过', variant: 'success', Icon: CheckCircle2, color: 'text-semantic-success' },
                          ongoing: { label: '进行中', variant: 'info', Icon: Clock, color: 'text-semantic-info' },
                          pending: { label: '未通过', variant: 'danger', Icon: XCircle, color: 'text-semantic-danger' },
                        };
                        const st = statusMap[m.status as keyof typeof statusMap];
                        return (
                          <div key={m.id} className="relative mb-5 last:mb-0">
                            <div className={cn(
                              'absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center',
                              m.status === 'completed' ? 'bg-semantic-success' :
                              m.status === 'ongoing' ? 'bg-semantic-info animate-pulse-soft' : 'bg-semantic-danger'
                            )}>
                              <st.Icon size={11} className="text-white" strokeWidth={3} />
                            </div>
                            <div className="rounded-widget border border-neutral-border bg-white p-4 card-hover hover:border-brand-rose-200/60 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <img src={mentor?.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-neutral-text-primary">{mentor?.name}</span>
                                      <span className="text-[10px] text-neutral-text-tertiary">导师</span>
                                    </div>
                                    <p className="text-xs text-neutral-text-secondary mt-0.5 line-clamp-1">
                                      {m.knowledgePointIds.slice(0, 2).map(id => knowledgePoints.find(k => k.id === id)?.name).join('、')}
                                    </p>
                                  </div>
                                </div>
                                <span className={cn(
                                  'flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-[10px] font-bold',
                                  m.status === 'completed' ? 'bg-semantic-successLight text-semantic-success' :
                                  m.status === 'ongoing' ? 'bg-semantic-infoLight text-semantic-info' : 'bg-semantic-dangerLight text-semantic-danger'
                                )}>
                                  <st.Icon size={11} />{st.label}
                                </span>
                              </div>
                              <div className="mt-3 pt-3 border-t border-neutral-border/50 flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-3 text-neutral-text-tertiary">
                                  <span className="flex items-center gap-1"><Calendar size={10} />{m.startDate} → {m.nextExamDate}</span>
                                </div>
                                {m.status === 'ongoing' && (
                                  <span className="text-brand-rose-600 font-medium flex items-center gap-1">
                                    <Clock size={10} />下次考核: {m.nextExamDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-border/50">
              <Award size={15} className="text-brand-rose-500" />
              <h4 className="text-sm font-bold text-neutral-text-primary">证书持有</h4>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {empCertificates.length === 0 ? (
                <div className="text-xs text-neutral-text-tertiary text-center py-4">暂无证书记录</div>
              ) : (
                empCertificates.map((c) => {
                  const dte = c.daysToExpiry;
                  const badge = dte < 30
                    ? { label: `${dte}天后到期`, cls: 'bg-semantic-dangerLight text-semantic-danger animate-breath' }
                    : dte < 60
                    ? { label: `${dte}天后到期`, cls: 'bg-semantic-warningLight text-semantic-warning' }
                    : dte < 90
                    ? { label: `${dte}天后到期`, cls: 'bg-semantic-warningLight/60 text-semantic-warning' }
                    : { label: '有效', cls: 'bg-semantic-successLight text-semantic-success' };
                  return (
                    <div key={c.id} className="rounded-widget border border-neutral-border/60 p-2.5 hover:border-brand-rose-200 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-text-primary line-clamp-1">{c.name}</p>
                          <p className="text-[10px] text-neutral-text-tertiary mt-0.5">{c.issueDate}</p>
                        </div>
                        <span className={cn('flex-shrink-0 px-1.5 py-0.5 rounded-pill text-[9px] font-bold', badge.cls)}>{badge.label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '140ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-border/50">
              <AlertCircle size={15} className="text-semantic-danger" />
              <h4 className="text-sm font-bold text-neutral-text-primary">关联客诉</h4>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-pill bg-semantic-dangerLight text-semantic-danger font-bold">{empComplaints.length}起</span>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {empComplaints.length === 0 ? (
                <div className="text-xs text-neutral-text-tertiary text-center py-4">近3月无客诉</div>
              ) : (
                empComplaints.map(c => (
                  <div key={c.id} className="rounded-widget border border-semantic-danger/20 bg-semantic-dangerLight/40 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        'text-[9px] px-1.5 py-px rounded font-bold',
                        c.severity === '重大' ? 'bg-semantic-danger text-white' :
                        c.severity === '严重' ? 'bg-semantic-dangerLight text-semantic-danger' :
                        'bg-semantic-warningLight text-semantic-warning'
                      )}>{c.severity}</span>
                      <span className="text-[9px] text-neutral-text-tertiary">{c.date}</span>
                    </div>
                    <p className="text-[11px] font-medium text-neutral-text-primary">{c.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-border/50">
              <ShoppingCart size={15} className="text-brand-indigo-500" />
              <h4 className="text-sm font-bold text-neutral-text-primary">关联业绩</h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] text-neutral-text-tertiary">成交单数</span>
                <span className="text-sm font-bold tabular-nums text-brand-indigo-600">{businessStats.orders} <span className="text-[10px] font-normal text-neutral-text-tertiary">单</span></span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] text-neutral-text-tertiary">总金额</span>
                <span className="text-sm font-bold tabular-nums text-brand-rose-600">¥{businessStats.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] text-neutral-text-tertiary">复购数</span>
                <span className="text-sm font-bold tabular-nums text-semantic-success flex items-center gap-1">
                  <RefreshCw size={11} />{businessStats.repurchases}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MentorshipForm open={mentorOpen} onClose={() => setMentorOpen(false)} employee={employee} />
    </div>
  );
}
