'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Calendar, FileText, Target, Flame, Search, Key, Tag, BookOpen, FileCheck,
  Crosshair, BarChart3, Tv, Wallet, TrendingUp, LayoutDashboard, FlaskConical,
  ArrowRight, Sparkles, Star, Award, Gem, Send, Zap, ChevronRight, ClipboardList,
  Paperclip, X, Image as ImageIcon, File, FolderOpen, Check, ExternalLink, Loader2,
  Download,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import styles from './workspace.module.css';

interface Skill { id: string; nameAr: string; descAr: string; icon: React.ReactNode; }
interface HistoryItem { id: string; title: string; status: string; date: string; rating?: number; }

interface ToolResultData {
  toolName: string;
  nameAr: string;
  icon: string;
  executionId: string;
  success: boolean;
  output: string;
  requiresApproval: boolean;
  previewData?: Record<string, unknown>;
  status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'FAILED' | 'REJECTED';
}

interface Attachment {
  name: string;
  url: string;
  type: string;
  mimeType: string;
  size: number;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  toolResults?: ToolResultData[];
  attachment?: Attachment;
}

interface AgentData {
  id: string; nameAr: string; roleAr: string; avatar: React.ReactNode; color: string;
  salary: number; personalityAr: string; departmentAr: string; tier: string;
  skills: Skill[];
}

const AVATAR_ICONS: Record<string, React.ReactNode> = {
  '📋': <BriefcaseBusiness size={28} />, '✍️': <PenTool size={28} />, '🔍': <Microscope size={28} />,
  '🎨': <Palette size={28} />, '📢': <Megaphone size={28} />, '📊': <LineChart size={28} />,
  '📱': <Megaphone size={28} />, '✉️': <Send size={28} />, '🏷️': <Tag size={28} />,
  '🖥️': <Sparkles size={28} />, '🌐': <Gem size={28} />, '💼': <BriefcaseBusiness size={28} />,
  '💻': <Zap size={28} />, '📞': <Send size={28} />,
};

const SKILL_ICONS: Record<string, React.ReactNode> = {
  '📅': <Calendar size={16} />, '📝': <FileText size={16} />, '🎯': <Target size={16} />,
  '✍️': <PenTool size={16} />, '🔥': <Flame size={16} />, '🔍': <Search size={16} />,
  '🔑': <Key size={16} />, '🏷️': <Tag size={16} />, '📖': <BookOpen size={16} />,
  '📄': <FileCheck size={16} />, '🎯 ': <Crosshair size={16} />, '📊': <BarChart3 size={16} />,
  '📺': <Tv size={16} />, '💰': <Wallet size={16} />, '📈': <TrendingUp size={16} />,
  '📋': <LayoutDashboard size={16} />, '🧪': <FlaskConical size={16} />, '✏️': <PenTool size={16} />,
  '💡': <Sparkles size={16} />, '📧': <Send size={16} />, '💻': <Zap size={16} />,
};

interface AgentStats {
  stats: {
    totalTasks: number;
    completedCount: number;
    failedCount: number;
    inProgressCount: number;
    successRate: number;
    avgRating: number;
    ratedCount: number;
    daysOfService: number;
    totalTokens: number;
    avgCompletionMin: number;
  };
  history: { id: string; title: string; status: string; rating: number | null; createdAt: string; completedAt: string | null }[];
  achievements: { icon: string; title: string; desc: string; color: string }[];
}

export default function WorkspaceClient({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [tab, setTab] = useState<'skills' | 'history' | 'stats'>('skills');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const chatRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  // Fetch agent data from API
  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          const found = (data.agents || []).find((a: { id: string }) => a.id === agentId);
          if (found) {
            setAgent({
              id: found.id,
              nameAr: found.nameAr,
              roleAr: found.roleAr,
              avatar: AVATAR_ICONS[found.avatar] || <BriefcaseBusiness size={28} />,
              color: found.color,
              salary: found.agreedSalary || found.salary,
              personalityAr: found.personalityAr,
              departmentAr: found.departmentAr,
              tier: found.tier,
              skills: (found.skills || []).map((s: { id: string; nameAr: string; descriptionAr: string; icon: string }) => ({
                id: s.id,
                nameAr: s.nameAr,
                descAr: s.descriptionAr,
                icon: SKILL_ICONS[s.icon] || <Sparkles size={16} />,
              })),
            });
          }
        }
      } catch (err) {
        console.error('Failed to load agent:', err);
      } finally {
        setAgentLoading(false);
      }
    }
    loadAgent();
  }, [agentId]);

  // Fetch real agent stats
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/stats`);
        if (res.ok) {
          const data = await res.json();
          setAgentStats(data);
        }
      } catch (err) {
        console.error('Failed to load agent stats:', err);
      }
    })();
  }, [agentId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  // Load chat history from DB on mount
  useEffect(() => {
    if (historyLoaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/agents/chat/history?agentId=${agentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: { id: string; role: string; content: string; attachment?: { name: string; url: string; type: string } }) => ({
              id: m.id,
              role: m.role as 'user' | 'agent',
              content: m.content,
              attachment: m.attachment || undefined,
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [agentId, historyLoaded]);

  // Helper: persist a message to the DB (fire-and-forget)
  const persistMessage = useCallback((role: string, content: string, attachment?: Attachment) => {
    fetch('/api/agents/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        role,
        content,
        attachment: attachment ? { name: attachment.name, url: attachment.url, type: attachment.type } : undefined,
      }),
    }).catch(err => console.error('Failed to persist message:', err));
  }, [agentId]);

  const handleToolAction = useCallback(async (executionId: string, action: 'approve' | 'reject', messageId: string) => {
    try {
      const res = await fetch('/api/tools/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId, action }),
      });
      const data = await res.json();

      // Update the tool result status in the message
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId || !msg.toolResults) return msg;
        return {
          ...msg,
          toolResults: msg.toolResults.map(tr =>
            tr.executionId === executionId
              ? {
                  ...tr,
                  status: action === 'approve' ? (data.result?.success ? 'COMPLETED' : 'FAILED') : 'REJECTED',
                  output: action === 'approve' ? (data.result?.output || tr.output) : '🚫 تم رفض العملية',
                  requiresApproval: false,
                }
              : tr
          ),
        };
      }));
    } catch (err) {
      console.error('Tool action error:', err);
    }
  }, []);

  // ─── Save agent message content to Documents ───────────
  const saveToDocuments = useCallback(async (messageId: string, content: string) => {
    if (savingMessageId || savedMessageIds.has(messageId)) return;
    setSavingMessageId(messageId);

    try {
      // Extract a reasonable title from the first line or first 50 chars
      const firstLine = content.split('\n')[0].replace(/[#*_]/g, '').trim();
      const filename = firstLine.length > 5 && firstLine.length < 80
        ? firstLine
        : `مستند من ${agent?.nameAr || 'موظف'}`;

      const res = await fetch('/api/documents/save-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          filename,
          agentId,
          agentName: agent?.nameAr || '',
        }),
      });

      if (res.ok) {
        setSavedMessageIds(prev => new Set(prev).add(messageId));
      } else {
        console.error('Failed to save document');
      }
    } catch (err) {
      console.error('Save to documents error:', err);
    } finally {
      setSavingMessageId(null);
    }
  }, [savingMessageId, savedMessageIds, agent?.nameAr, agentId]);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if ((!msg && !pendingFile) || loading) return;

    // Upload file first if attached
    let attachment: Attachment | undefined;
    if (pendingFile) {
      try {
        const formData = new FormData();
        formData.append('file', pendingFile);
        formData.append('source', 'chat_attachment');
        formData.append('agentId', agentId);
        formData.append('agentName', agent?.nameAr || '');
        const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachment = {
            name: uploadData.document.name,
            url: uploadData.document.url,
            type: uploadData.document.type,
            mimeType: uploadData.document.mimeType,
            size: uploadData.document.size,
          };
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
      setPendingFile(null);
    }

    const displayContent = msg || (attachment ? `📎 ${attachment.name}` : '');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: displayContent, attachment };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Persist user message
    persistMessage('user', displayContent, attachment || undefined);

    try {
      // Build chat content with attachment context
      let messageContent = msg || '';
      if (attachment) {
        messageContent += `\n\n[مرفق: ${attachment.name} (${attachment.type})]`;
      }

      const chatHistory = [...messages, { role: 'user' as const, content: messageContent }].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          agentId: agentId,
          attachments: attachment ? [{ name: attachment.name, url: attachment.url, type: attachment.type }] : undefined,
        }),
      });

      const data = await res.json();

      const agentReply = data.reply || data.error || 'عذراً، حدث خطأ. حاول مرة أخرى.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: agentReply,
        toolResults: data.toolResults || undefined,
      }]);

      // Persist agent reply
      persistMessage('agent', agentReply);
    } catch (err) {
      console.error('[Chat] Request failed:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: '⚠️ واجهت مشكلة في الاتصال. تأكد إن الإنترنت شغال وحاول مرة ثانية.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, agent?.nameAr, agent?.roleAr, agent?.personalityAr, agent?.departmentAr, agentId, messages, pendingFile, persistMessage]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (agentLoading) return <div className={styles.emptyState} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><ClipboardList size={20} style={{ animation: 'spin 1s linear infinite' }} /> جاري تحميل الموظف...</div>;
  if (!agent) return <div className={styles.emptyState}>الموظف غير موجود — تأكد إنك وظفته أولاً من صفحة الموظفين</div>;

  const quickActions = [
    { label: 'أنشئ تقويم محتوى', icon: <Calendar size={14} />, text: 'أنشئ لي تقويم محتوى لهذا الشهر' },
    { label: 'حلل أداء الموقع', icon: <BarChart3 size={14} />, text: 'حلل أداء موقعي وأعطني توصيات' },
    { label: 'اكتب نص إعلاني', icon: <PenTool size={14} />, text: 'اكتب لي نص إعلاني لحملة جديدة' },
    { label: 'اكتب قصة علامتي', icon: <BookOpen size={14} />, text: 'ساعدني في كتابة قصة علامتي التجارية' },
  ];

  return (
    <div className={styles.workspace}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.agentAvatarLg} style={{ background: `${agent.color}15`, color: agent.color }}>
            {agent.avatar}
            <span className={styles.statusDot} style={{ background: '#10B981' }}></span>
          </div>
          <div className={styles.agentNameLg}>{agent.nameAr}</div>
          <div className={styles.agentRoleLg}>{agent.roleAr}</div>
          <span className={styles.salaryTag}><Wallet size={12} /> {agent.salary} ر.س/شهرياً</span>
        </div>

        <div className={styles.sidebarTabs}>
          {(['skills', 'history', 'stats'] as const).map(t => (
            <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`} onClick={() => setTab(t)}>
              {t === 'skills' ? <><Target size={13} /> المهارات</> : t === 'history' ? <><ClipboardList size={13} /> السجل</> : <><BarChart3 size={13} /> الإنجازات</>}
            </button>
          ))}
        </div>

        <div className={styles.sidebarContent}>
          {tab === 'skills' && (
            <>
              {agent.skills.map(skill => (
                <div key={skill.id} className={styles.skillCard} onClick={() => sendMessage(`نفّذ مهارة: ${skill.nameAr}`)}>
                  <span className={styles.skillCardIcon}>{skill.icon}</span>
                  <div className={styles.skillCardName}>{skill.nameAr}</div>
                  <div className={styles.skillCardDesc}>{skill.descAr}</div>
                </div>
              ))}
            </>
          )}

          {tab === 'history' && (
            <>
              <div className={styles.sectionTitle}>المهام السابقة</div>
              {!agentStats || agentStats.history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>لا توجد مهام سابقة بعد</div>
              ) : (
                agentStats.history.map(item => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyTitle}>{item.title}</div>
                    <div className={styles.historyMeta}>
                      <span className={styles.historyStatus} style={{ background: item.status === 'COMPLETED' ? '#10B981' : item.status === 'FAILED' ? '#EF4444' : '#F59E0B' }}></span>
                      <span>{item.status === 'COMPLETED' ? 'مكتمل' : item.status === 'FAILED' ? 'فشل' : 'قيد التنفيذ'}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</span>
                      {item.rating && item.rating > 0 && (
                        <span className={styles.ratingStars}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={10} fill={s <= item.rating! ? '#F59E0B' : 'none'} color={s <= item.rating! ? '#F59E0B' : 'var(--text-muted)'} />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'stats' && (
            <>
              <div className={styles.sectionTitle}>الإنجازات</div>
              {!agentStats ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>جاري تحميل البيانات...</div>
              ) : (
                <>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}><div className={styles.statValue}>{agentStats.stats.completedCount}</div><div className={styles.statLabel}>مهمة منجزة</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{agentStats.stats.avgRating || '—'}</div><div className={styles.statLabel}>متوسط التقييم{agentStats.stats.ratedCount > 0 ? ` (${agentStats.stats.ratedCount})` : ''}</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{agentStats.stats.daysOfService}</div><div className={styles.statLabel}>يوم خدمة</div></div>
                    <div className={styles.statCard}><div className={styles.statValue}>{agentStats.stats.successRate}%</div><div className={styles.statLabel}>معدل النجاح</div></div>
                  </div>
                  {agentStats.achievements.length > 0 && (
                    <>
                      <div className={styles.sectionTitle}>أبرز الإنجازات</div>
                      {agentStats.achievements.map((ach, i) => (
                        <div key={i} className={styles.skillCard}>
                          <div className={styles.skillCardName}><span style={{ fontSize: '1rem' }}>{ach.icon}</span> {ach.title}</div>
                          <div className={styles.skillCardDesc}>{ach.desc}</div>
                        </div>
                      ))}
                    </>
                  )}
                  {agentStats.stats.totalTasks === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>لم تُسند مهام لهذا الموظف بعد — ابدأ بإرسال مهمة!</div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Main */}
      <div className={styles.chatMain}>
        <div className={styles.chatHeader}>
          <button className={styles.backBtn} onClick={() => router.push('./agents')}><ArrowRight size={16} /></button>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatHeaderName}>{agent.nameAr} — {agent.roleAr}</div>
            <div className={styles.chatHeaderStatus}><Zap size={10} /> متصل/ة الآن</div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeAvatar} style={{ color: agent.color }}>{agent.avatar}</div>
            <div className={styles.welcomeTitle}>مرحباً! أنا {agent.nameAr}</div>
            <div className={styles.welcomeText}>{agent.personalityAr}. اختر مهارة من القائمة أو اكتب طلبك مباشرة!</div>
            <div className={styles.welcomeActions}>
              {quickActions.map(qa => (
                <button key={qa.label} className={styles.welcomeChip} onClick={() => sendMessage(qa.text)}>
                  {qa.icon} {qa.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.chatMessages} ref={chatRef}>
            {messages.map(msg => {
              // Check if any tool result has an auto-uploaded file
              const hasAutoUpload = msg.toolResults?.some(tr =>
                tr.output?.includes('📎') && tr.output?.includes('تحميل الملف')
              );
              // Extract download URL from tool output if present
              const getDownloadUrl = (output: string): string | null => {
                const match = output.match(/\[تحميل الملف\]\((.+?)\)/);
                return match ? match[1] : null;
              };
              // Strip the raw markdown link from display
              const cleanToolOutput = (output: string): string => {
                return output.replace(/\n*📎 \[تحميل الملف\]\(.+?\)/, '').trim();
              };

              return (
              <div key={msg.id}>
                <div className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : styles.msgRowAgent}`}>
                  <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgUser : styles.msgAgent}`}>
                    {msg.content}
                  </div>
                </div>

                {/* Save to Documents button — agent messages only */}
                {msg.role === 'agent' && msg.content.length > 100 && !hasAutoUpload && (
                  <div style={{
                    margin: '0.35rem 0 0.25rem 2rem',
                    display: 'flex',
                    gap: '0.5rem',
                    direction: 'rtl',
                  }}>
                    {savedMessageIds.has(msg.id) ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10B981', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        <Check size={12} />
                        تم الحفظ في المستندات
                        <a
                          href={`/${locale}/dashboard/documents`}
                          style={{
                            color: '#10B981', marginRight: '0.25rem',
                            display: 'inline-flex', alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={11} />
                        </a>
                      </span>
                    ) : (
                      <button
                        onClick={() => saveToDocuments(msg.id, msg.content)}
                        disabled={savingMessageId === msg.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.15)',
                          color: '#818CF8', fontSize: '0.75rem', fontWeight: 500,
                          cursor: savingMessageId === msg.id ? 'wait' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (savingMessageId !== msg.id) {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)';
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.15)';
                        }}
                      >
                        {savingMessageId === msg.id ? (
                          <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> جاري الحفظ...</>
                        ) : (
                          <><FolderOpen size={12} /> حفظ في المستندات</>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Tool Results */}
                {msg.toolResults && msg.toolResults.map(tr => {
                  const downloadUrl = getDownloadUrl(tr.output);
                  const displayOutput = cleanToolOutput(tr.output);

                  return (
                  <div key={tr.executionId} style={{
                    margin: '0.5rem 0 0.5rem 2rem',
                    padding: '0.75rem 1rem',
                    background: tr.requiresApproval ? 'rgba(251,191,36,0.08)' : (tr.status === 'REJECTED' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)'),
                    border: `1px solid ${tr.requiresApproval ? 'rgba(251,191,36,0.2)' : (tr.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.15)')}`,
                    borderRadius: '0.75rem',
                    fontSize: '0.85rem',
                    direction: 'rtl',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <span>{tr.icon}</span>
                      <span>{tr.nameAr}</span>
                      {tr.status === 'COMPLETED' && <span style={{ color: '#10B981', fontSize: '0.75rem' }}>✅ تم</span>}
                      {tr.status === 'FAILED' && <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>❌ فشل</span>}
                      {tr.status === 'REJECTED' && <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>🚫 مرفوض</span>}
                    </div>
                    <div style={{ color: '#94A3B8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{displayOutput}</div>

                    {/* Auto-upload status + download link */}
                    {downloadUrl && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginTop: '0.75rem', padding: '0.5rem 0.75rem',
                        background: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem',
                        border: '1px solid rgba(16,185,129,0.15)',
                      }}>
                        <Check size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, flex: 1 }}>
                          تم الحفظ تلقائياً في المستندات
                        </span>
                        <a
                          href={downloadUrl}
                          download
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.25rem 0.6rem', borderRadius: '0.35rem',
                            background: 'rgba(99,102,241,0.15)', color: '#818CF8',
                            fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none',
                          }}
                        >
                          <Download size={11} /> تحميل
                        </a>
                        <a
                          href={`/${locale}/dashboard/documents`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.25rem 0.6rem', borderRadius: '0.35rem',
                            background: 'rgba(16,185,129,0.12)', color: '#10B981',
                            fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none',
                          }}
                        >
                          <FolderOpen size={11} /> المستندات
                        </a>
                      </div>
                    )}

                    {tr.requiresApproval && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleToolAction(tr.executionId, 'approve', msg.id)}
                          style={{ fontSize: '0.8rem' }}
                        >
                          ✅ موافقة وتنفيذ
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleToolAction(tr.executionId, 'reject', msg.id)}
                          style={{ fontSize: '0.8rem' }}
                        >
                          ❌ رفض
                        </button>
                      </div>
                    )}
                    {/* Email preview */}
                    {tr.toolName === 'send_email' && tr.previewData && tr.requiresApproval && (
                      <div style={{
                        marginTop: '0.75rem', padding: '0.75rem',
                        background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>معاينة البريد:</div>
                        <div style={{ color: '#E2E8F0' }}>📧 إلى: {String((tr.previewData as Record<string, unknown>).to)}</div>
                        <div style={{ color: '#E2E8F0' }}>📝 الموضوع: {String((tr.previewData as Record<string, unknown>).subject)}</div>
                        <div style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>
                          {String((tr.previewData as Record<string, unknown>).body || '').substring(0, 300)}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              );
            })}
            {loading && (
              <div className={styles.typing}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            )}
          </div>
        )}

        <div className={styles.chatInput}>
          {/* Pending file preview */}
          {pendingFile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem', margin: '0 0 0.5rem',
              background: 'rgba(99,102,241,0.1)', borderRadius: '0.5rem',
              border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem',
            }}>
              {pendingFile.type.startsWith('image/') ? <ImageIcon size={14} style={{ color: '#3B82F6' }} /> : <File size={14} style={{ color: '#6366F1' }} />}
              <span style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pendingFile.name} ({(pendingFile.size / 1024).toFixed(0)} KB)
              </span>
              <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}
          <div className={styles.inputRow}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              style={{
                background: 'none', border: 'none', color: pendingFile ? '#6366F1' : 'var(--text-muted)',
                cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem',
              }}
              title="إرفاق ملف"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => { if (e.target.files?.[0]) setPendingFile(e.target.files[0]); e.target.value = ''; }}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.csv,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.txt,.json"
              style={{ display: 'none' }}
            />
            <textarea className={styles.textInput} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={`اكتب طلبك لـ ${agent.nameAr}...`} rows={1} disabled={loading} />
            <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={loading || (!input.trim() && !pendingFile)}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
