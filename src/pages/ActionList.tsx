import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Search, Bell, FileDown, UserPlus, Send, Eye,
  ChevronDown, Calendar, Clock, Paperclip, MessageSquare,
  Award, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, Download, Loader2, Printer,
  FileText, FolderKanban, FileSpreadsheet,
  ChevronLeft, ChevronRight, Home, X,
  Target, Flag, Users, Store, BookOpen,
} from 'lucide-react';
import {
  remedialList, reviewComments, certificates, employees,
  positions, stores, projects, useMockData,
} from '@/data/mock';
import type { RemedialPriority, RemedialListItem, ReviewComment, Certificate } from '@/data/types';
import DataTable from '@/components/common/DataTable';
import KPICard from '@/components/common/KPICard';
import { cn } from '@/lib/utils';

const priorityStyles: Record<RemedialPriority, string> = {
  high: 'bg-semantic-dangerLight text-semantic-danger border border-semantic-danger/30',
  medium: 'bg-semantic-warningLight text-semantic-warning border border-semantic-warning/30',
  low: 'bg-semantic-successLight text-semantic-success border border-semantic-success/30',
};
const priorityLabel: Record<RemedialPriority, string> = { high: '高优先', medium: '中优先', low: '低优先' };

const actionTypeMap = (action: string): { label: string; cls: string } => {
  if (action.includes('补考') || action.includes('自学') || action.includes('重新')) return { label: '复训', cls: 'bg-semantic-infoLight text-semantic-info' };
  if (action.includes('带教')) return { label: '带教', cls: 'bg-brand-rose-50 text-brand-rose-700 border border-brand-rose-200' };
  return { label: '重考', cls: 'bg-brand-purple-500/10 text-brand-purple-600' };
};

const TopNav: React.FC<{
  active: string; onChange: (k: string) => void; items: Array<{ key: string; label: string; icon: React.ElementType; badge?: number }>;
}> = ({ active, onChange, items }) => (
  <div className="rounded-card border border-neutral-border bg-white shadow-card overflow-hidden mb-4">
    <div className="px-2 pt-2 flex items-end gap-1 bg-gradient-to-b from-neutral-bg/40 to-transparent border-b border-neutral-border/50">
      {items.map(({ key, label, icon: Icon, badge }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'relative px-5 py-3 flex items-center gap-2 text-sm font-medium rounded-t-lg transition-all duration-200',
              isActive
                ? 'text-brand-indigo-700 bg-white border border-b-0 border-neutral-border -mb-px'
                : 'text-neutral-text-tertiary hover:text-neutral-text-primary hover:bg-white/50'
            )}
          >
            {isActive && <span className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-rose-gold rounded-t-lg" />}
            <Icon size={15} className={isActive ? 'text-brand-rose-500' : ''} />
            <span>{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className={cn(
                'px-1.5 py-px rounded-full text-[10px] font-bold',
                isActive ? 'bg-gradient-rose-gold text-white' : 'bg-semantic-dangerLight text-semantic-danger'
              )}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

const CommentEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [publishing, setPublishing] = useState(false);
  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => { console.log('发布批注:', { target, content }); setContent(''); setPublishing(false); }, 600);
  };
  return (
    <div className="rounded-card border border-neutral-border bg-white shadow-card p-5 mb-4 card-rose-accent">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-rose-gold flex items-center justify-center text-white font-bold">院</div>
        <div>
          <p className="text-sm font-semibold text-neutral-text-primary">王院长</p>
          <p className="text-[11px] text-neutral-text-tertiary">发布复盘批注</p>
        </div>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        placeholder="输入复盘批注内容，可使用 @员工 进行提醒..."
        className="w-full rounded-widget border border-neutral-border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-rose-400/50 focus:border-brand-rose-400 placeholder:text-neutral-text-tertiary"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select value={target} onChange={e => setTarget(e.target.value)} className="text-xs rounded-widget border border-neutral-border px-3 py-1.5 bg-white text-neutral-text-secondary focus:outline-none focus:border-brand-rose-400">
            <option value="all">@全员</option>
            <option value="store">@指定门店</option>
            <option value="position">@指定岗位</option>
            <option value="project">@项目组</option>
          </select>
          <button onClick={() => console.log('添加附件')} className="flex items-center gap-1 px-3 py-1.5 text-xs text-neutral-text-tertiary hover:text-brand-indigo-600 hover:bg-brand-indigo-50 rounded-widget transition-colors">
            <Paperclip size={13} />添加附件
          </button>
        </div>
        <button
          onClick={handlePublish}
          disabled={!content.trim() || publishing}
          className={cn(
            'px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200',
            content.trim() && !publishing
              ? 'text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'text-white/70 bg-neutral-border cursor-not-allowed'
          )}
        >
          {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          {publishing ? '发布中...' : '发布批注'}
        </button>
      </div>
    </div>
  );
};

const ExportPanel: React.FC = () => {
  const [month, setMonth] = useState('2024-06');
  const [scope, setScope] = useState<string[]>(['kpi', 'training', 'exam']);
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'pptx'>('pdf');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true); setProgress(0); setGenerated(false);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setGenerating(false); setGenerated(true); return 100; }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  const toggleScope = (k: string) => {
    setScope(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  };

  const history = [
    { id: 1, date: '2024-05-01', author: '王院长', size: '3.2MB' },
    { id: 2, date: '2024-04-01', author: '王院长', size: '2.8MB' },
    { id: 3, date: '2024-03-01', author: '李总监', size: '3.5MB' },
    { id: 4, date: '2024-02-01', author: '王院长', size: '2.6MB' },
    { id: 5, date: '2024-01-02', author: '王院长', size: '2.9MB' },
    { id: 6, date: '2023-12-01', author: '李总监', size: '3.1MB' },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7 space-y-4">
        <div className="rounded-card border border-neutral-border bg-white shadow-card p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-border/50">
            <FileSpreadsheet size={18} className="text-brand-rose-500" />
            <h3 className="text-section-title font-bold font-serif text-brand-indigo-800">月度培训经营简报 · 导出配置</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text-primary mb-2">选择月份</label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full rounded-widget border border-neutral-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-rose-400/50 focus:border-brand-rose-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text-primary mb-2">报告模块</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: 'kpi', label: 'KPI 总览数据', icon: Target },
                  { k: 'training', label: '培训完成情况', icon: BookOpen },
                  { k: 'exam', label: '考试成绩分析', icon: FileText },
                  { k: 'complaint', label: '客诉关联分析', icon: AlertTriangle },
                  { k: 'certificate', label: '证书持有情况', icon: Award },
                  { k: 'remedial', label: '整改计划进度', icon: Flag },
                ].map(({ k, label, icon: Icon }) => (
                  <button
                    key={k}
                    onClick={() => toggleScope(k)}
                    className={cn(
                      'text-left p-3 rounded-widget border transition-all duration-150 flex items-center gap-2.5',
                      scope.includes(k)
                        ? 'border-brand-rose-400 bg-brand-rose-50 text-brand-rose-700'
                        : 'border-neutral-border bg-white hover:border-brand-indigo-200 text-neutral-text-secondary'
                    )}
                  >
                    <span className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
                      scope.includes(k) ? 'bg-gradient-rose-gold border-transparent' : 'border-neutral-border'
                    )}>
                      {scope.includes(k) && <CheckCircle2 size={12} className="text-white" />}
                    </span>
                    <Icon size={14} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text-primary mb-2">导出格式</label>
              <div className="flex items-center gap-2">
                {(['pdf', 'xlsx', 'pptx'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      'px-4 py-2 rounded-widget text-xs font-semibold border transition-all duration-150 uppercase',
                      format === f
                        ? 'bg-gradient-indigo text-white border-transparent shadow-sm'
                        : 'bg-white border-neutral-border text-neutral-text-secondary hover:border-brand-indigo-200'
                    )}
                  >
                    {f === 'pdf' ? <FileText size={14} /> : f === 'xlsx' ? <FileSpreadsheet size={14} /> : <Printer size={14} />}
                    <span className="ml-1.5">{f}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || scope.length === 0}
              className={cn(
                'w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200',
                generating || scope.length === 0
                  ? 'bg-neutral-border text-white/70 cursor-not-allowed'
                  : 'text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5'
              )}
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" />生成中... {Math.floor(Math.min(progress, 100))}%</>
              ) : generated ? (
                <><Download size={16} />下载 {month} 简报.{format}</>
              ) : (
                <><FileDown size={16} />生成并导出简报</>
              )}
            </button>
            {generating && (
              <div className="h-2 rounded-pill bg-neutral-border/50 overflow-hidden">
                <div className="h-full bg-gradient-rose-gold rounded-pill transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-card border border-neutral-border bg-white shadow-card p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-border/50">
            <FolderKanban size={16} className="text-brand-indigo-500" />
            <h3 className="text-sm font-bold text-neutral-text-primary">历史导出记录</h3>
          </div>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-widget hover:bg-brand-indigo-50/40 border border-transparent hover:border-brand-indigo-100 transition-all duration-150">
                <div className="w-10 h-10 rounded-lg bg-gradient-indigo/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-brand-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-text-primary">{h.date} 月度培训经营简报.pdf</p>
                  <p className="text-[10px] text-neutral-text-tertiary">生成人: {h.author} · {h.size}</p>
                </div>
                <button onClick={() => console.log('下载', h.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-widget text-xs font-semibold text-brand-indigo-700 bg-brand-indigo-50 hover:bg-brand-indigo-100 transition-colors">
                  <Download size={12} />下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-5">
        <div className="rounded-card border border-neutral-border bg-white shadow-card p-5 sticky top-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-border/50">
            <h3 className="text-sm font-bold text-neutral-text-primary flex items-center gap-2">
              <Eye size={15} className="text-brand-rose-500" />实时预览
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-pill bg-brand-indigo-50 text-brand-indigo-700 font-medium">缩小版</span>
          </div>
          <div className="border border-neutral-border rounded-lg p-4 bg-neutral-bg/30 aspect-[3/4] overflow-hidden">
            <div className="text-center mb-3">
              <div className="text-[11px] font-bold font-serif text-brand-indigo-800">{month} 月度培训经营简报</div>
              <div className="w-12 h-0.5 bg-gradient-rose-gold mx-auto mt-1 rounded-full" />
            </div>
            <div className="space-y-2">
              {scope.includes('kpi') && (
                <div className="bg-white rounded p-2 border border-neutral-border/50">
                  <div className="text-[8px] font-semibold text-neutral-text-primary mb-1">KPI总览</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="text-[7px] bg-semantic-successLight/50 rounded p-1"><span className="block text-[10px] font-bold text-semantic-success">87.5%</span><span className="text-neutral-text-tertiary">培训完成率</span></div>
                    <div className="text-[7px] bg-brand-rose-50 rounded p-1"><span className="block text-[10px] font-bold text-brand-rose-600">82.3分</span><span className="text-neutral-text-tertiary">考试平均分</span></div>
                  </div>
                </div>
              )}
              {scope.includes('training') && (
                <div className="bg-white rounded p-2 border border-neutral-border/50">
                  <div className="text-[8px] font-semibold text-neutral-text-primary mb-1">培训模块</div>
                  <div className="h-12 bg-gradient-to-br from-brand-indigo-100/50 to-brand-rose-100/50 rounded flex items-end gap-0.5 px-1 pb-0.5">
                    {Array.from({length:12}).map((_,i)=>(
                      <div key={i} className="flex-1 bg-gradient-to-t from-brand-indigo-500 to-brand-indigo-300 rounded-t" style={{height:`${40+Math.sin(i)*25}%`}} />
                    ))}
                  </div>
                </div>
              )}
              {scope.includes('exam') && (
                <div className="bg-white rounded p-2 border border-neutral-border/50">
                  <div className="text-[8px] font-semibold text-neutral-text-primary mb-1">考试分析</div>
                  <div className="flex items-center justify-between text-[7px] text-neutral-text-tertiary">
                    <span>通过人数 <b className="text-semantic-success">186</b></span>
                    <span>未通过 <b className="text-semantic-danger">14</b></span>
                    <span>通过率 <b className="text-brand-rose-600">93%</b></span>
                  </div>
                </div>
              )}
              {scope.includes('complaint') && (
                <div className="bg-white rounded p-2 border border-neutral-border/50">
                  <div className="text-[8px] font-semibold text-neutral-text-primary mb-1">客诉关联</div>
                  <div className="text-[7px] text-semantic-danger flex items-center gap-1"><AlertTriangle size={9} />本月共8起，较上月减少2起</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ActionList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('remedial');
  const [selectedRemedial, setSelectedRemedial] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [commentTarget, setCommentTarget] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [calendarView, setCalendarView] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());

  const filteredRemedial = useMemo(() => {
    let list = remedialList as (RemedialListItem & { id: string })[];
    if (filterPriority !== 'all') list = list.filter(r => r.priority === filterPriority);
    if (filterStore !== 'all') list = list.filter(r => r.storeName.includes(stores.find(s => s.id === filterStore)?.name || ''));
    if (searchTerm) list = list.filter(r => r.employeeName.includes(searchTerm));
    return list;
  }, [filterPriority, filterStore, searchTerm]);

  const certBatches = useMemo(() => {
    return {
      soon: certificates.filter(c => c.daysToExpiry >= 0 && c.daysToExpiry < 30),
      m3060: certificates.filter(c => c.daysToExpiry >= 30 && c.daysToExpiry < 60),
      m6090: certificates.filter(c => c.daysToExpiry >= 60 && c.daysToExpiry < 90),
      safe: certificates.filter(c => c.daysToExpiry >= 90),
    };
  }, []);

  const filteredComments = useMemo(() => {
    let list = reviewComments;
    if (commentTarget !== 'all') list = list.filter(c => c.targetType === commentTarget);
    return list;
  }, [commentTarget]);

  const tabItems = [
    { key: 'remedial', label: '下周补训名单', icon: Users, badge: filteredRemedial.length },
    { key: 'review', label: '院长复盘批注', icon: MessageSquare, badge: filteredComments.length },
    { key: 'cert', label: '证书到期提醒', icon: Award, badge: certBatches.soon.length + certBatches.m3060.length },
    { key: 'export', label: '月度简报导出', icon: FileSpreadsheet },
  ];

  return (
    <div className="animate-fade-in-up">
      <TopNav active={activeTab} onChange={setActiveTab} items={tabItems} />

      {activeTab === 'remedial' && (
        <div className="space-y-4">
          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-widget bg-neutral-bg/60 border border-neutral-border">
                  <Filter size={13} className="text-neutral-text-tertiary" />
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="text-xs bg-transparent outline-none text-neutral-text-secondary">
                    <option value="all">全部优先级</option><option value="high">高优先</option><option value="medium">中优先</option><option value="low">低优先</option>
                  </select>
                </div>
                <select value={filterStore} onChange={e => setFilterStore(e.target.value)} className="text-xs px-3 py-2 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
                  <option value="all">全部门店</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="text-xs px-3 py-2 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
                  <option>全部岗位</option>
                  {positions.map(p => <option key={p.id}>{p.name}</option>)}
                </select>
                <select className="text-xs px-3 py-2 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
                  <option>推荐动作</option><option>安排带教</option><option>重新学习</option><option>组织补考</option>
                </select>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-widget border border-neutral-border bg-white">
                  <Search size={13} className="text-neutral-text-tertiary" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索员工姓名" className="text-xs w-32 bg-transparent outline-none placeholder:text-neutral-text-tertiary" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1.5 rounded-pill bg-brand-rose-50 text-brand-rose-700 font-semibold">
                  已选 <b>{selectedRemedial.length}</b> 人 / 共 <b>{filteredRemedial.length}</b> 人
                </span>
                <button onClick={() => console.log('批量带教', selectedRemedial)} className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all">
                  <UserPlus size={13} />批量安排带教
                </button>
                <button onClick={() => console.log('发送通知')} className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-brand-indigo-700 bg-brand-indigo-50 border border-brand-indigo-100 hover:bg-brand-indigo-100 transition-colors">
                  <Bell size={13} />发送通知
                </button>
                <button onClick={() => console.log('导出名单')} className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-text-secondary bg-white border border-neutral-border hover:bg-neutral-bg transition-colors">
                  <FileDown size={13} />导出名单
                </button>
              </div>
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'employee', title: '员工信息',
                render: (row) => {
                  const emp = employees.find(e => e.id === row.employeeId);
                  const pos = positions.find(p => p.name === row.position);
                  return (
                    <div className="flex items-center gap-3">
                      <img src={emp?.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-text-primary">{row.employeeName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-px rounded font-medium" style={{ background: pos ? `${pos.color}18` : 'transparent', color: pos?.color }}>{row.position}</span>
                          <span className="text-[10px] text-neutral-text-tertiary flex items-center gap-0.5"><Store size={9} />{row.storeName.slice(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'knowledgePoints', title: '缺口知识点',
                render: (row) => {
                  const arr = row.knowledgePoints as any[];
                  const shown = arr.slice(0, 3);
                  const extra = arr.length - shown.length;
                  return (
                    <div className="flex flex-wrap gap-1">
                      {shown.map((k, i) => (
                        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-pill text-[9px] font-semibold bg-semantic-warningLight/70 text-semantic-warning border border-semantic-warning/20 line-clamp-1 max-w-[140px]">
                          {k.name.length > 8 ? k.name.slice(0, 8) + '…' : k.name}
                        </span>
                      ))}
                      {extra > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-pill text-[9px] font-bold bg-neutral-border/70 text-neutral-text-primary">+{extra}</span>}
                    </div>
                  );
                },
              },
              {
                key: 'complaint', title: '关联客诉', width: 110,
                render: (row) => row.relatedComplaintType ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-semantic-dangerLight text-semantic-danger border border-semantic-danger/20">
                    <AlertTriangle size={10} />{row.relatedComplaintType}
                  </span>
                ) : <span className="text-[10px] text-neutral-text-tertiary">—</span>,
              },
              {
                key: 'action', title: '推荐动作', width: 100, align: 'center',
                render: (row) => { const t = actionTypeMap(row.recommendedAction); return (
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold', t.cls)}>
                    <RefreshCw size={10} />{t.label}
                  </span>
                );},
              },
              { key: 'priority', title: '优先级', width: 90, align: 'center',
                render: (row) => <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold', priorityStyles[row.priority])}>
                  <Flag size={10} />{priorityLabel[row.priority]}
                </span>,
              },
              {
                key: 'op', title: '操作', width: 170, align: 'center',
                render: (row) => (
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => navigate(`/profile/${row.employeeId}`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-widget text-[11px] font-semibold text-brand-indigo-700 bg-brand-indigo-50 hover:bg-brand-indigo-100 transition-colors border border-brand-indigo-100">
                      <Eye size={12} />查看画像
                    </button>
                    <button onClick={() => console.log('安排带教', row.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-widget text-[11px] font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all">
                      <UserPlus size={12} />立即安排
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredRemedial}
            selectable
            selectedKeys={selectedRemedial}
            onSelectChange={setSelectedRemedial}
          />

          {selectedRemedial.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 z-20 -mx-6 -mb-6 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-sm border-t border-neutral-border shadow-[0_-4px_20px_rgba(30,58,95,0.05)]">
              <div className="rounded-card border border-brand-rose-300 bg-gradient-to-r from-brand-rose-50/70 to-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-rose-gold flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-rose-700">已选择 {selectedRemedial.length} 位员工</p>
                    <p className="text-[11px] text-neutral-text-tertiary">确认后将加入下周补训计划并自动通知门店负责人</p>
                  </div>
                </div>
                <button
                  onClick={() => { console.log('加入补训计划', selectedRemedial); setSelectedRemedial([]); }}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 ripple"
                >
                  <Target size={15} />确认加入下周补训计划
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'review' && (
        <div className="space-y-4">
          <CommentEditor />
          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-text-secondary font-medium flex items-center gap-1"><Filter size={12} />目标筛选:</span>
              {[
                { k: 'all', label: '全部', icon: Users },
                { k: 'dashboard', label: '全员', icon: Target },
                { k: 'store', label: '门店', icon: Store },
                { k: 'course', label: '岗位', icon: BookOpen },
                { k: 'project', label: '项目', icon: FolderKanban },
                { k: 'remedial', label: '整改', icon: Flag },
              ].map(({ k, label, icon: Icon }) => (
                <button
                  key={k}
                  onClick={() => setCommentTarget(k)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-widget text-[11px] font-medium transition-all duration-150 border',
                    commentTarget === k
                      ? 'bg-gradient-indigo text-white border-transparent shadow-sm'
                      : 'bg-white border-neutral-border text-neutral-text-secondary hover:border-brand-indigo-200 hover:text-brand-indigo-600'
                  )}
                >
                  <Icon size={11} />{label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-text-secondary font-medium"><Calendar size={12} /></span>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-xs px-3 py-1.5 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400">
                <option value="7">近7天</option><option value="30">近30天</option><option value="90">近90天</option><option value="all">全部</option>
              </select>
            </div>
          </div>

          <div className="relative pl-12 space-y-5">
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-brand-rose-300 via-brand-indigo-200 to-transparent rounded-full" />
            {filteredComments.map((c, idx) => {
              const targetName = c.targetId ? (
                c.targetType === 'course' ? `课程 ${c.targetId}` :
                c.targetType === 'store' ? stores.find(s => s.id === c.targetId)?.name :
                c.targetType === 'project' ? projects.find(p => p.id === c.targetId)?.name :
                c.targetId
              ) : c.targetType === 'dashboard' ? '@全员' : '';
              return (
                <div key={c.id} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="absolute -left-[52px] top-2 w-8 h-8 rounded-full border-3 border-white shadow-md bg-gradient-rose-gold flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    院
                  </div>
                  <div className="rounded-card border border-neutral-border bg-white shadow-card card-hover overflow-hidden">
                    <div className="px-5 py-4 bg-gradient-to-r from-neutral-bg/30 via-white to-transparent border-b border-neutral-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-bold text-neutral-text-primary">{c.authorName}</p>
                          <p className="text-[11px] text-neutral-text-tertiary flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-px rounded-pill bg-gradient-rose-gold/10 text-brand-rose-700 font-medium">{c.authorRole}</span>
                            <span>{c.createdAt.replace('T', ' ')}</span>
                          </p>
                        </div>
                      </div>
                      {targetName && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill text-[11px] font-semibold bg-brand-indigo-50 text-brand-indigo-700 border border-brand-indigo-100">
                          <Target size={11} />{typeof targetName === 'string' ? targetName : ''}
                        </span>
                      )}
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm leading-7 text-neutral-text-primary whitespace-pre-wrap">
                        {c.content.split(/(@\S+)/g).map((part, i) =>
                          part.startsWith('@') ? (
                            <span key={i} className="font-semibold text-brand-rose-600 bg-brand-rose-50 px-1 rounded mx-0.5">{part}</span>
                          ) : <span key={i}>{part}</span>
                        )}
                      </p>
                      {c.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-neutral-border/40">
                          {c.attachments.map((f, i) => (
                            <button key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-widget border border-brand-indigo-100 bg-brand-indigo-50/50 hover:bg-brand-indigo-50 hover:border-brand-indigo-200 transition-colors group">
                              <Paperclip size={12} className="text-brand-indigo-500 group-hover:text-brand-indigo-600" />
                              <span className="text-[11px] font-medium text-brand-indigo-700">{f}</span>
                              <Download size={11} className="text-neutral-text-tertiary group-hover:text-brand-indigo-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-3 bg-neutral-bg/30 border-t border-neutral-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[11px] text-neutral-text-tertiary"><MessageSquare size={12} />回复 {Math.floor(Math.random() * 8)}</span>
                        <span className="flex items-center gap-1 text-[11px] text-neutral-text-tertiary"><CheckCircle2 size={12} className="text-semantic-success" />已读 {Math.floor(Math.random() * 40) + 8} 人</span>
                      </div>
                      <button onClick={() => console.log('查看详情', c.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-rose-600 hover:text-brand-rose-700 transition-colors">
                        查看详情 <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'cert' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <KPICard title="30天内到期" value={certBatches.soon.length} unit="张" variant="danger" icon={XCircle} />
            <KPICard title="30-60天到期" value={certBatches.m3060.length} unit="张" variant="warning" icon={Clock} />
            <KPICard title="60-90天到期" value={certBatches.m6090.length} unit="张" variant="info" icon={Calendar} />
            <KPICard title="90天以上" value={certBatches.safe.length} unit="张" variant="success" icon={CheckCircle2} />
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setCalendarView(v => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-150',
                calendarView
                  ? 'bg-gradient-indigo text-white border-transparent shadow-sm'
                  : 'bg-white border-neutral-border text-neutral-text-secondary hover:border-brand-indigo-200 hover:text-brand-indigo-600'
              )}
            >
              <Calendar size={13} />到期日历视图
            </button>
          </div>

          {calendarView ? (
            <div className="rounded-card border border-neutral-border bg-white shadow-card p-5">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setCalMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} className="w-8 h-8 rounded-lg hover:bg-brand-indigo-50 flex items-center justify-center text-neutral-text-tertiary hover:text-brand-indigo-600 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-lg font-bold font-serif text-brand-indigo-800">{calMonth.getFullYear()}年{calMonth.getMonth() + 1}月</h3>
                <button onClick={() => setCalMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} className="w-8 h-8 rounded-lg hover:bg-brand-indigo-50 flex items-center justify-center text-neutral-text-tertiary hover:text-brand-indigo-600 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['日','一','二','三','四','五','六'].map(d => (
                  <div key={d} className="text-center py-2 text-[11px] font-semibold text-neutral-text-tertiary border-b border-neutral-border/50">{d}</div>
                ))}
                {(() => {
                  const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
                  const startPad = first.getDay();
                  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
                  const cells = [];
                  for (let i = 0; i < startPad; i++) cells.push(<div key={`p-${i}`} />);
                  for (let d = 1; d <= daysInMonth; d++) {
                    const today = new Date(); today.setHours(0,0,0,0);
                    const date = new Date(calMonth.getFullYear(), calMonth.getMonth(), d);
                    const diffDays = Math.ceil((date.getTime() - today.getTime()) / 86400000);
                    const matched = certificates.filter(c => {
                      const exp = new Date(c.expiryDate);
                      return exp.getFullYear() === date.getFullYear() && exp.getMonth() === date.getMonth() && exp.getDate() === date.getDate();
                    });
                    const cls = matched.length > 0 ? (
                      diffDays < 30 ? 'bg-semantic-dangerLight border-semantic-danger animate-breath text-semantic-danger' :
                      diffDays < 60 ? 'bg-semantic-warningLight border-semantic-warning text-semantic-warning' :
                      'bg-semantic-successLight/60 border-semantic-success/40 text-semantic-success'
                    ) : 'hover:bg-neutral-bg/50';
                    cells.push(
                      <div key={d} className={cn(
                        'aspect-square rounded-widget border p-1.5 flex flex-col text-[11px] transition-all duration-150 cursor-pointer relative overflow-hidden',
                        cls
                      )}>
                        <span className={cn('font-bold', matched.length > 0 ? '' : 'text-neutral-text-tertiary')}>{d}</span>
                        {matched.length > 0 && (
                          <div className="mt-auto text-[9px] font-semibold truncate">
                            {matched.length === 1 ? matched[0].name.slice(0,4) : `+${matched.length}张`}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-border/50 flex items-center justify-center gap-6 text-[11px]">
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-semantic-dangerLight animate-breath border border-semantic-danger/40" /><span className="text-neutral-text-secondary">{'<30天到期'}</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-semantic-warningLight border border-semantic-warning/40" /><span className="text-neutral-text-secondary">30-60天到期</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-semantic-successLight/60 border border-semantic-success/30" /><span className="text-neutral-text-secondary">{'≥60天到期'}</span></div>
              </div>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'name', title: '证书类型',
                  render: (row) => (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-rose-100 to-brand-rose-50 border border-brand-rose-200 flex items-center justify-center flex-shrink-0">
                        <Award size={17} className="text-brand-rose-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-text-primary">{row.name}</p>
                        <p className="text-[10px] text-neutral-text-tertiary">{row.issuer}</p>
                      </div>
                    </div>
                  ),
                },
                { key: 'holder', title: '持有人',
                  render: (row) => {
                    const emp = employees.find(e => e.id === row.employeeId);
                    const pos = positions.find(p => p.id === emp?.positionId);
                    return <div className="flex items-center gap-2.5">
                      <img src={emp?.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-text-primary">{emp?.name}</p>
                        <span className="text-[10px] px-1.5 py-px rounded" style={{ background: pos ? `${pos.color}18` : 'transparent', color: pos?.color }}>{pos?.name}</span>
                      </div>
                    </div>;
                  },
                },
                { key: 'store', title: '门店', width: 100, render: (row) => {
                  const emp = employees.find(e => e.id === row.employeeId);
                  const s = stores.find(st => st.id === emp?.storeId);
                  return <span className="text-xs text-neutral-text-secondary flex items-center gap-1"><Store size={11} className="text-neutral-text-tertiary" />{s?.name}</span>;
                }},
                { key: 'issueDate', title: '签发日期', width: 110, align: 'center', render: (row) => <span className="text-xs text-neutral-text-secondary tabular-nums">{row.issueDate}</span> },
                { key: 'expiry', title: '到期日期 / 剩余', width: 170, align: 'center',
                  render: (row: Certificate) => {
                    const d = row.daysToExpiry;
                    const badge = d < 30
                      ? { label: `${d}天后到期`, cls: 'bg-semantic-dangerLight text-semantic-danger animate-breath border-semantic-danger/30' }
                      : d < 60
                      ? { label: `${d}天后到期`, cls: 'bg-semantic-warningLight text-semantic-warning border-semantic-warning/30' }
                      : d < 90
                      ? { label: `${d}天后到期`, cls: 'bg-semantic-warningLight/60 text-semantic-warning border-semantic-warning/20' }
                      : { label: `还有${d}天`, cls: 'bg-semantic-successLight text-semantic-success border-semantic-success/30' };
                    return <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-neutral-text-secondary tabular-nums">{row.expiryDate}</span>
                      <span className={cn('px-2 py-0.5 rounded-pill text-[10px] font-bold border', badge.cls)}>{badge.label}</span>
                    </div>;
                  },
                },
                { key: 'project', title: '关联项目', width: 110, render: (row) => {
                  const p = projects.find(x => x.id === row.projectId);
                  return p ? <span className="text-xs px-2 py-0.5 rounded-pill bg-brand-indigo-50 text-brand-indigo-700 font-medium">{p.name}</span> : <span className="text-[10px] text-neutral-text-tertiary">—</span>;
                }},
                { key: 'op', title: '操作', width: 200, align: 'center',
                  render: (row) => (
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => console.log('提醒', row.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-widget text-[11px] font-semibold text-brand-indigo-700 bg-brand-indigo-50 border border-brand-indigo-100 hover:bg-brand-indigo-100 transition-colors">
                        <Bell size={12} />提醒员工
                      </button>
                      <button onClick={() => console.log('续期', row.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-widget text-[11px] font-semibold text-semantic-success bg-semantic-successLight border border-semantic-success/30 hover:bg-semantic-successLight/80 transition-colors">
                        <CheckCircle2 size={12} />标记已续期
                      </button>
                    </div>
                  ),
                },
              ]}
              data={certificates}
            />
          )}
        </div>
      )}

      {activeTab === 'export' && <ExportPanel />}
    </div>
  );
}
