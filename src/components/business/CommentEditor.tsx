import React, { useState, useEffect, useRef } from 'react';
import {
  Bold, Italic, List, AtSign, Paperclip, X, Save, Send,
  FileText, User, Clock, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData as fetchMockData } from '@/data/mock';
import type { Employee } from '@/data/types';
import { useCommentStore } from '@/store/commentStore';

interface CommentEditorProps {
  placeholder?: string;
  onSubmit: (content: string, attachments: string[], mentions: string[]) => void;
  onCancel?: () => void;
  initialContent?: string;
}

const TOOLBAR = [
  { key: 'bold', Icon: Bold, label: '加粗' },
  { key: 'italic', Icon: Italic, label: '斜体' },
  { key: 'list', Icon: List, label: '列表' },
  { key: 'mention', Icon: AtSign, label: '提及' },
];

const AVATAR_PLACEHOLDER = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

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

export default function CommentEditor({
  placeholder = '请输入批注内容...',
  onSubmit,
  onCancel,
  initialContent = '',
}: CommentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { comments, draft, addComment, saveDraft, clearDraft } = useCommentStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const emps = await fetchMockData('employees');
      if (!mounted) return;
      setEmployees(emps);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (draft && !loading) {
      setContent(draft.content);
      setAttachments(draft.attachments);
      setMentions(draft.mentions);
    }
  }, [draft, loading]);

  const filteredEmployees = employees.filter(e =>
    e.name.includes(mentionSearch) || mentionSearch === ''
  ).slice(0, 8);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1 && (atIndex === 0 || val[atIndex - 1] === ' ' || val[atIndex - 1] === '\n')) {
      const afterAt = val.slice(atIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionSearch(afterAt);
        setShowMentionList(true);
        return;
      }
    }
    setShowMentionList(false);
  };

  const pickMention = (emp: Employee) => {
    const atIndex = content.lastIndexOf('@');
    if (atIndex !== -1) {
      const before = content.slice(0, atIndex);
      const afterAt = content.slice(atIndex + 1);
      const nextSpace = afterAt.indexOf(' ');
      const after = nextSpace === -1 ? '' : afterAt.slice(nextSpace);
      setContent(`${before}@${emp.name} ${after}`);
      if (!mentions.includes(emp.name)) setMentions([...mentions, emp.name]);
    }
    setShowMentionList(false);
    setMentionSearch('');
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => fileInputRef.current?.click();

  const simulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(f => f.name);
    setAttachments([...attachments, ...newFiles]);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = () => {
    saveDraft({ content, attachments, mentions });
    setShowDraftSaved(true);
    setTimeout(() => setShowDraftSaved(false), 3000);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    addComment({
      authorId: 'emp-0',
      authorName: '王院长',
      authorRole: '院长',
      targetType: 'dashboard',
      content,
      mentions,
      attachments,
    });
    onSubmit(content, attachments, mentions);
    setContent('');
    setAttachments([]);
    setMentions([]);
    clearDraft();
  };

  const applyFormat = (format: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    let wrapped = selected;
    let cursorOffset = 0;
    switch (format) {
      case 'bold':
        wrapped = `**${selected || '加粗文字'}**`;
        cursorOffset = selected ? 0 : 2;
        break;
      case 'italic':
        wrapped = `*${selected || '斜体文字'}*`;
        cursorOffset = selected ? 0 : 1;
        break;
      case 'list':
        wrapped = selected ? selected.split('\n').map(l => `- ${l}`).join('\n') : '- 列表项';
        cursorOffset = 2;
        break;
      case 'mention':
        wrapped = `${selected || ''}@`;
        cursorOffset = 1;
        setTimeout(() => {
          setMentionSearch('');
          setShowMentionList(true);
        }, 10);
        break;
    }
    const newContent = content.slice(0, start) + wrapped + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      const pos = start + wrapped.length - cursorOffset;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  if (loading) {
    return (
      <div className="rounded-card bg-white shadow-card border border-neutral-border overflow-hidden">
        <div className="p-5 space-y-3 animate-pulse-soft">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-neutral-border/50 rounded-widget" />)}
          <div className="h-40 bg-neutral-border/50 rounded-widget" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-neutral-border/50 rounded-widget" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-white shadow-card border border-neutral-border overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-border bg-gradient-to-r from-brand-rose-50/80 via-white to-brand-indigo-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-indigo flex items-center justify-center text-white font-serif">
            院长
          </div>
          <div>
            <h3 className="font-serif text-section-title text-neutral-text-primary">复盘批注编辑器</h3>
            <p className="text-caption text-neutral-text-secondary mt-0.5">发布批注后将通过系统通知相关 @提及 人员</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="border border-neutral-border rounded-[8px] overflow-hidden bg-neutral-bg/30">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-border bg-white">
            {TOOLBAR.map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => applyFormat(key)}
                title={label}
                className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-text-secondary hover:bg-brand-rose-50 hover:text-brand-rose-600 transition-colors"
              >
                <Icon size={16} strokeWidth={2} />
              </button>
            ))}
            <div className="w-px h-5 bg-neutral-border mx-1" />
            <button
              type="button"
              onClick={handleFileUpload}
              title="上传附件"
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-text-secondary hover:bg-brand-indigo-50 hover:text-brand-indigo-700 transition-colors"
            >
              <Paperclip size={16} strokeWidth={2} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={simulateUpload}
            />
            <div className="flex-1" />
            <span className="text-caption text-neutral-text-tertiary">
              {content.length}/2000
            </span>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={placeholder}
              rows={6}
              className="w-full px-4 py-3 text-body bg-white outline-none resize-none focus:bg-white/95 transition-colors text-neutral-text-primary placeholder:text-neutral-text-disabled"
            />
            {showMentionList && filteredEmployees.length > 0 && (
              <div className="absolute z-20 bg-white border border-neutral-border rounded-card shadow-card-hover w-64 max-h-64 overflow-y-auto animate-fade-in-up">
                {filteredEmployees.map((emp, idx) => (
                  <button
                    key={emp.id}
                    onClick={() => pickMention(emp)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      idx === 0 ? 'bg-brand-rose-50/60' : 'hover:bg-neutral-bg'
                    )}
                  >
                    <img src={emp.avatar || `${AVATAR_PLACEHOLDER}${emp.id}`} alt="" className="w-7 h-7 rounded-full bg-neutral-border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-neutral-text-primary truncate">{emp.name}</p>
                      <p className="text-caption text-neutral-text-tertiary">{emp.positionId} · {emp.level}级</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-border bg-white/50 flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-indigo-50 border border-brand-indigo-200/60 text-body"
                >
                  <FileText size={13} className="text-brand-indigo-700" />
                  <span className="text-brand-indigo-800 font-medium max-w-[180px] truncate">{file}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="w-4 h-4 rounded-full hover:bg-brand-indigo-100 flex items-center justify-center ml-0.5"
                  >
                    <X size={10} className="text-brand-indigo-600" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {mentions.length > 0 && (
              <>
                <span className="text-caption text-neutral-text-tertiary">提及：</span>
                {mentions.map(m => (
                  <span key={m} className="text-caption px-2 py-0.5 rounded bg-brand-rose-50 text-brand-rose-700 font-medium">@{m}</span>
                ))}
              </>
            )}
            {showDraftSaved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-semantic-success/10 text-semantic-success text-caption font-medium animate-fade-in">
                <Check size={12} /> 草稿已保存
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-body font-medium text-neutral-text-secondary rounded-[8px] border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
              >
                取消
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 text-body font-medium text-brand-indigo-700 rounded-[8px] border border-brand-indigo-200 bg-brand-indigo-50 hover:bg-brand-indigo-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Save size={15} strokeWidth={2} /> 保存草稿
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim()}
              className={cn(
                'px-5 py-2 text-body font-semibold text-white rounded-[8px] transition-all inline-flex items-center gap-1.5 ripple',
                content.trim()
                  ? 'bg-gradient-rose-gold shadow-sm hover:shadow-md active:scale-[0.98]'
                  : 'bg-neutral-border/70 cursor-not-allowed'
              )}
            >
              <Send size={15} strokeWidth={2} /> 发布批注
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-border bg-neutral-bg/30">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-neutral-border/60">
          <Clock size={15} className="text-neutral-text-tertiary" />
          <h4 className="font-serif font-semibold text-neutral-text-primary">已发布批注历史</h4>
          <span className="text-caption text-neutral-text-tertiary">（{comments.length}条）</span>
        </div>
        <div className="p-5 space-y-5 max-h-[380px] overflow-y-auto">
          {[...comments].reverse().map((cmt, idx) => (
            <div key={cmt.id} className="relative pl-6">
              {idx !== comments.length - 1 && (
                <div className="absolute left-2.5 top-8 bottom-[-20px] w-px bg-gradient-to-b from-brand-rose-300/60 to-transparent" />
              )}
              <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-gradient-rose-gold border-2 border-white shadow-sm flex items-center justify-center">
                <User size={10} className="text-white" />
              </div>
              <div className="rounded-[8px] border border-neutral-border bg-white p-4 hover:border-brand-rose-300/60 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <img src={`${AVATAR_PLACEHOLDER}dean`} alt="" className="w-8 h-8 rounded-full bg-brand-indigo-100" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-semibold text-neutral-text-primary">{cmt.authorName}</span>
                      <span className="text-caption px-1.5 py-0.5 rounded bg-gradient-rose-gold/15 text-brand-rose-700 font-medium">{cmt.authorRole}</span>
                    </div>
                    <p className="text-caption text-neutral-text-tertiary mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {formatTimeAgo(cmt.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-body text-neutral-text-primary leading-relaxed whitespace-pre-wrap">
                  {cmt.content.split(/(@[\u4e00-\u9fa5A-Za-z]+)/g).map((part, i) =>
                    part.startsWith('@') ? (
                      <span key={i} className="text-brand-rose-600 font-medium">{part}</span>
                    ) : part
                  )}
                </p>
                {cmt.attachments?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cmt.attachments.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-bg border border-neutral-border text-caption text-neutral-text-secondary">
                        <FileText size={12} /> {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
