import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, Search, Bell, FileDown, UserPlus, Send, Eye,
  ChevronDown, Calendar, Clock, Paperclip, MessageSquare,
  Award, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, Download, Loader2, Printer,
  FileText, FolderKanban, FileSpreadsheet,
  ChevronLeft, ChevronRight, Home, X,
  Target, Flag, Users, Store, BookOpen, LayoutGrid,
  GraduationCap,
} from 'lucide-react';
import ActionListKanban from './ActionList.Kanban';
import ActionListMentorship from './ActionList.Mentorship';
import CommentEditor from '@/components/business/CommentEditor';
import ExportPanel from '@/components/business/ExportPanel';
import {
  remedialList, certificates, employees,
  positions, stores, projects, useMockData,
} from '@/data/mock';
import type { RemedialPriority, RemedialListItem, Certificate } from '@/data/types';
import DataTable from '@/components/common/DataTable';
import KPICard from '@/components/common/KPICard';
import { cn } from '@/lib/utils';
import { useCommentStore } from '@/store/commentStore';
import { useBusinessStore } from '@/store/businessStore';

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

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return iso.split('T')[0];
}

export default function ActionList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('kanban');
  const [selectedRemedial, setSelectedRemedial] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [commentTarget, setCommentTarget] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [calendarView, setCalendarView] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState<string>('all');
  const [commentStartDate, setCommentStartDate] = useState<string>('');
  const [commentEndDate, setCommentEndDate] = useState<string>('');
  const [showCommentExport, setShowCommentExport] = useState(false);

  const { comments } = useCommentStore();
  const { confirmRemedialItems, openMentorshipForm, mentorshipPlans } = useBusinessStore();

  const handleConfirmRemedial = () => {
    confirmRemedialItems(selectedRemedial);
    setSelectedRemedial([]);
    setActiveTab('kanban');
  };

  const handleScheduleSingleMentorship = (item: RemedialListItem & { id: string }) => {
    openMentorshipForm({
      menteeId: item.employeeId,
      preSelectedKnowledgePointIds: item.knowledgePoints.map(kp => kp.id),
      contextMeta: {
        projectName: item.relatedComplaintType,
        knowledgePointNames: item.knowledgePoints.map(kp => kp.name),
        source: 'action',
        sourceId: item.id,
      },
      remedialId: item.id,
    });
  };

  const handleBatchScheduleMentorship = () => {
    if (selectedRemedial.length === 0) return;
    const items = filteredRemedial.filter(r => selectedRemedial.includes(r.id));
    if (items.length === 0) return;
    handleScheduleSingleMentorship(items[0]);
  };

  const handleExportComments = (format: 'excel' | 'pdf') => {
    const data = filteredComments;
    if (data.length === 0) {
      alert('没有可导出的批注数据');
      return;
    }

    if (format === 'excel') {
      import('xlsx').then(XLSX => {
        const rows = data.map(c => ({
          '发布时间': c.createdAt.split('T')[0] + ' ' + c.createdAt.split('T')[1]?.slice(0, 5) || '',
          '发布人': c.authorName,
          '角色': c.authorRole,
          '目标类型': c.targetType,
          '目标名称': c.targetId || '',
          '批注内容': c.content,
          '@人员': c.mentions?.join('、') || '',
          '附件': c.attachments?.join('、') || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
          { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
          { wch: 60 }, { wch: 20 }, { wch: 30 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '复盘批注');
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `复盘批注_${dateStr}.xlsx`);
      });
    } else {
      import('jspdf').then(mod => {
        const jsPDF = mod.default;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Review Comments Report', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${data.length} items`, 105, 28, { align: 'center' });

        let y = 40;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;

        data.forEach((c, idx) => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text(`${idx + 1}. ${c.authorName} (${c.authorRole})`, margin, y);
          y += 6;
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(120);
          doc.text(`Date: ${c.createdAt.split('T')[0]} | Target: ${c.targetType}`, margin, y);
          y += 6;
          doc.setTextColor(0);
          const lines = doc.splitTextToSize(c.content, 180);
          doc.text(lines, margin, y);
          y += lines.length * 5;

          if (c.mentions?.length) {
            doc.setTextColor(200, 80, 80);
            doc.text(`Mentions: @${c.mentions.join(', @')}`, margin, y);
            y += 5;
            doc.setTextColor(0);
          }
          if (c.attachments?.length) {
            doc.setTextColor(60, 80, 160);
            doc.text(`Attachments: ${c.attachments.join(', ')}`, margin, y);
            y += 5;
            doc.setTextColor(0);
          }
          y += 6;
        });

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`复盘批注_${dateStr}.pdf`);
      });
    }
    setShowCommentExport(false);
  };

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
    let list = comments;
    if (commentTarget !== 'all') list = list.filter(c => c.targetType === commentTarget);
    if (mentionFilter !== 'all') {
      list = list.filter(c => c.mentions?.some(m => m === mentionFilter));
    }
    if (commentStartDate) {
      list = list.filter(c => c.createdAt >= commentStartDate);
    }
    if (commentEndDate) {
      const end = new Date(commentEndDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(c => new Date(c.createdAt) <= end);
    }
    if (dateRange !== 'all' && !commentStartDate && !commentEndDate) {
      const days = parseInt(dateRange, 10);
      const from = new Date();
      from.setDate(from.getDate() - days);
      from.setHours(0, 0, 0, 0);
      list = list.filter(c => new Date(c.createdAt) >= from);
    }
    return list;
  }, [comments, commentTarget, mentionFilter, commentStartDate, commentEndDate, dateRange]);

  const allMentions = useMemo(() => {
    const set = new Set<string>();
    comments.forEach(c => c.mentions?.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [comments]);

  const tabItems = [
    { key: 'kanban', label: '补训计划看板', icon: LayoutGrid },
    { key: 'mentorship', label: '带教进度', icon: GraduationCap, badge: mentorshipPlans.filter(p => p.status === 'scheduled').length },
    { key: 'remedial', label: '补训名单', icon: Users, badge: filteredRemedial.length },
    { key: 'review', label: '批注', icon: MessageSquare, badge: filteredComments.length },
    { key: 'cert', label: '证书', icon: Award, badge: certBatches.soon.length + certBatches.m3060.length },
    { key: 'export', label: '导出', icon: FileSpreadsheet },
  ];

  return (
    <>
      <div className="animate-fade-in-up">
        <TopNav active={activeTab} onChange={setActiveTab} items={tabItems} />

      {activeTab === 'kanban' && <ActionListKanban />}

      {activeTab === 'mentorship' && <ActionListMentorship />}

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
                <button onClick={handleBatchScheduleMentorship} className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all">
                  <UserPlus size={13} />批量安排带教</button>
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
                    <button onClick={() => handleScheduleSingleMentorship(row as RemedialListItem & { id: string })} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-widget text-[11px] font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all">
                      <UserPlus size={12} />立即安排</button>
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
                  onClick={handleConfirmRemedial}
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
          <CommentEditor onSubmit={() => {}} />

          <div className="rounded-card border border-neutral-border bg-white shadow-card p-4 mb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-text-secondary font-medium flex items-center gap-1"><Filter size={12} />目标:</span>
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
                      'flex items-center gap-1 px-2.5 py-1.5 rounded-widget text-[11px] font-medium transition-all duration-150 border',
                      commentTarget === k
                        ? 'bg-gradient-indigo text-white border-transparent shadow-sm'
                        : 'bg-white border-neutral-border text-neutral-text-secondary hover:border-brand-indigo-200 hover:text-brand-indigo-600'
                    )}
                  >
                    <Icon size={11} />{label}
                  </button>
                ))}

                <div className="h-5 w-px bg-neutral-border/60 mx-1" />

                <select
                  value={mentionFilter}
                  onChange={e => setMentionFilter(e.target.value)}
                  className="text-[11px] px-2.5 py-1.5 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400"
                >
                  <option value="all">@人员 · 全部</option>
                  {allMentions.map(m => <option key={m} value={m}>@{m}</option>)}
                </select>

                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={commentStartDate}
                    onChange={e => setCommentStartDate(e.target.value)}
                    placeholder="开始日期"
                    className="text-[11px] px-2.5 py-1.5 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400 w-[110px]"
                  />
                  <span className="text-[11px] text-neutral-text-tertiary">至</span>
                  <input
                    type="date"
                    value={commentEndDate}
                    onChange={e => setCommentEndDate(e.target.value)}
                    placeholder="结束日期"
                    className="text-[11px] px-2.5 py-1.5 rounded-widget border border-neutral-border bg-white text-neutral-text-secondary outline-none focus:border-brand-rose-400 w-[110px]"
                  />
                </div>

                {(commentStartDate || commentEndDate) && (
                  <button
                    onClick={() => { setCommentStartDate(''); setCommentEndDate(''); }}
                    className="text-[11px] text-brand-rose-600 hover:text-brand-rose-700 font-medium"
                  >
                    清除日期
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-text-tertiary">
                  共 <b className="text-brand-rose-600">{filteredComments.length}</b> 条
                </span>
                <button
                  onClick={() => setShowCommentExport(v => !v)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-widget text-[11px] font-semibold text-white bg-gradient-rose-gold shadow-sm hover:shadow-md transition-all"
                >
                  <Download size={11} /> 导出复盘
                </button>
              </div>
            </div>

            {showCommentExport && (
              <div className="mt-4 pt-4 border-t border-neutral-border/60 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportComments('excel')}
                  className="p-3 rounded-lg border border-neutral-border hover:border-brand-indigo-200 hover:bg-brand-indigo-50/40 transition-all flex items-center gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-text-primary">导出 Excel</p>
                    <p className="text-[11px] text-neutral-text-tertiary mt-0.5">可编辑表格格式</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExportComments('pdf')}
                  className="p-3 rounded-lg border border-neutral-border hover:border-brand-indigo-200 hover:bg-brand-indigo-50/40 transition-all flex items-center gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-text-primary">导出 PDF</p>
                    <p className="text-[11px] text-neutral-text-tertiary mt-0.5">精美排版格式</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="relative pl-12 space-y-5">
            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-brand-rose-300 via-brand-indigo-200 to-transparent rounded-full" />
            {[...filteredComments].reverse().map((c, idx) => {
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
                            <span>{formatTimeAgo(c.createdAt)}</span>
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
                        {c.content.split(/(@[\u4e00-\u9fa5A-Za-z]+)/g).map((part, i) =>
                          part.startsWith('@') ? (
                            <span key={i} className="font-semibold text-brand-rose-600 bg-brand-rose-50 px-1 rounded mx-0.5">{part}</span>
                          ) : <span key={i}>{part}</span>
                        )}
                      </p>
                      {c.attachments?.length > 0 && (
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
                      {c.mentions?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-[11px] text-neutral-text-tertiary">提及：</span>
                          {c.mentions.map((m, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-brand-rose-50 text-brand-rose-700 font-medium">@{m}</span>
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

      {activeTab === 'export' && (
        <div className="rounded-card border border-neutral-border bg-white shadow-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-rose-gold/10 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet size={36} className="text-brand-rose-500" />
          </div>
          <h3 className="text-lg font-bold font-serif text-brand-indigo-800 mb-2">月度培训经营简报导出</h3>
          <p className="text-sm text-neutral-text-secondary mb-6">一键生成包含KPI总览、项目培训缺口、客诉关联和证书到期提醒的完整报告</p>
          <button
            onClick={() => setExportPanelOpen(true)}
            className="px-8 py-3 rounded-lg text-sm font-bold text-white bg-gradient-rose-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2"
          >
            <FileDown size={16} /> 打开导出面板
          </button>
        </div>
      )}
      </div>

      {exportPanelOpen && <ExportPanel onClose={() => setExportPanelOpen(false)} />}
    </>
  );
}
