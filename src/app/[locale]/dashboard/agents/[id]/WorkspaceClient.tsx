'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Calendar, FileText, Target, Flame, Search, Key, Tag, BookOpen, FileCheck,
  Crosshair, BarChart3, Tv, Wallet, TrendingUp, LayoutDashboard, FlaskConical,
  ArrowRight, Sparkles, Star, Award, Gem, Send, Zap, ChevronRight, ClipboardList,
  Paperclip, X, Image as ImageIcon, File
} from 'lucide-react';
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

const demoHistory: HistoryItem[] = [
  { id: 'h1', title: 'تقويم المحتوى لشهر يوليو', status: 'COMPLETED', date: 'منذ ٢ أيام', rating: 5 },
  { id: 'h2', title: 'خطاطيف إنستغرام', status: 'COMPLETED', date: 'منذ ٤ أيام', rating: 4 },
  { id: 'h3', title: 'هيكل مقال عن رؤية 2030', status: 'COMPLETED', date: 'منذ أسبوع', rating: 5 },
];

export default function WorkspaceClient({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [tab, setTab] = useState<'skills' | 'history' | 'stats'>('skills');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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
              {demoHistory.map(item => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.historyTitle}>{item.title}</div>
                  <div className={styles.historyMeta}>
                    <span className={styles.historyStatus} style={{ background: item.status === 'COMPLETED' ? '#10B981' : '#F59E0B' }}></span>
                    <span>{item.status === 'COMPLETED' ? 'مكتمل' : 'قيد التنفيذ'}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    {item.rating && (
                      <span className={styles.ratingStars}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={10} fill={s <= item.rating! ? '#F59E0B' : 'none'} color={s <= item.rating! ? '#F59E0B' : 'var(--text-muted)'} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'stats' && (
            <>
              <div className={styles.sectionTitle}>الإنجازات</div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}><div className={styles.statValue}>12</div><div className={styles.statLabel}>مهمة منجزة</div></div>
                <div className={styles.statCard}><div className={styles.statValue}>4.8</div><div className={styles.statLabel}>متوسط التقييم</div></div>
                <div className={styles.statCard}><div className={styles.statValue}>32</div><div className={styles.statLabel}>يوم خدمة</div></div>
                <div className={styles.statCard}><div className={styles.statValue}>98%</div><div className={styles.statLabel}>معدل النجاح</div></div>
              </div>
              <div className={styles.sectionTitle}>أبرز الإنجازات</div>
              <div className={styles.skillCard}><div className={styles.skillCardName}><Star size={14} color="#F59E0B" /> أفضل تقويم محتوى</div><div className={styles.skillCardDesc}>حقق 200% زيادة في التفاعل لعميل سعودي</div></div>
              <div className={styles.skillCard}><div className={styles.skillCardName}><Award size={14} color="#10B981" /> أسرع تنفيذ</div><div className={styles.skillCardDesc}>أنجز 5 مهام في يوم واحد بتقييم 5/5</div></div>
              <div className={styles.skillCard}><div className={styles.skillCardName}><Gem size={14} color="#8B5CF6" /> أعلى رضا</div><div className={styles.skillCardDesc}>12 مهمة متتالية بتقييم 5 نجوم</div></div>
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
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : styles.msgRowAgent}`}>
                  <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgUser : styles.msgAgent}`}>
                    {msg.content}
                  </div>
                </div>
                {/* Tool Results */}
                {msg.toolResults && msg.toolResults.map(tr => (
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
                    <div style={{ color: '#94A3B8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{tr.output}</div>
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
                ))}
              </div>
            ))}
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
