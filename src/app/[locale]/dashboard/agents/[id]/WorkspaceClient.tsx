'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Calendar, FileText, Target, Flame, Search, Key, Tag, BookOpen, FileCheck,
  Crosshair, BarChart3, Tv, Wallet, TrendingUp, LayoutDashboard, FlaskConical,
  ArrowRight, Sparkles, Star, Award, Gem, Send, Zap, ChevronRight, ClipboardList
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

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  toolResults?: ToolResultData[];
}

interface AgentData {
  id: string; nameAr: string; roleAr: string; avatar: React.ReactNode; color: string;
  salary: number; personalityAr: string; departmentAr: string; tier: string;
  skills: Skill[];
}

const AGENTS: Record<string, AgentData> = {
  '1': { id: '1', nameAr: 'نورة', roleAr: 'استراتيجية المحتوى', avatar: <BriefcaseBusiness size={28} />, color: '#8B5CF6', salary: 99, personalityAr: 'منظمة ودقيقة، تحب التخطيط المسبق', departmentAr: 'المحتوى', tier: 'STARTER',
    skills: [{ id: 's1', nameAr: 'تقويم المحتوى', descAr: 'إنشاء تقويم محتوى شهري مفصل', icon: <Calendar size={16} /> }, { id: 's2', nameAr: 'هيكل المقال', descAr: 'بناء هيكل مقال احترافي', icon: <FileText size={16} /> }, { id: 's3', nameAr: 'خطاطيف السوشيال', descAr: 'خطاطيف جذابة للمنشورات', icon: <Target size={16} /> }] },
  '2': { id: '2', nameAr: 'فهد', roleAr: 'كاتب إعلانات', avatar: <PenTool size={28} />, color: '#F59E0B', salary: 99, personalityAr: 'مبدع وجريء في الأفكار', departmentAr: 'الإعلانات', tier: 'STARTER',
    skills: [{ id: 's4', nameAr: 'كتابة نص إعلاني', descAr: 'نصوص إعلانية مقنعة', icon: <PenTool size={16} /> }, { id: 's5', nameAr: 'عناوين بديلة', descAr: 'عناوين جذابة للاختبار', icon: <Flame size={16} /> }, { id: 's6', nameAr: 'تحسين CTA', descAr: 'تحسين أزرار الدعوة للعمل', icon: <Target size={16} /> }] },
  '3': { id: '3', nameAr: 'ريم', roleAr: 'محللة SEO', avatar: <Microscope size={28} />, color: '#10B981', salary: 199, personalityAr: 'تحليلية وذكية، تحب الأرقام', departmentAr: 'التحليلات', tier: 'GROWTH',
    skills: [{ id: 's7', nameAr: 'تدقيق SEO', descAr: 'تدقيق شامل للموقع', icon: <Search size={16} /> }, { id: 's8', nameAr: 'بحث كلمات مفتاحية', descAr: 'بحث شامل في السوق السعودي', icon: <Key size={16} /> }, { id: 's9', nameAr: 'مولّد Meta Tags', descAr: 'توليد meta tags محسّنة', icon: <Tag size={16} /> }] },
  '4': { id: '4', nameAr: 'سلطان', roleAr: 'راوي العلامة التجارية', avatar: <Palette size={28} />, color: '#EC4899', salary: 199, personalityAr: 'قصصي وملهم', departmentAr: 'المحتوى', tier: 'GROWTH',
    skills: [{ id: 's10', nameAr: 'قصة العلامة', descAr: 'صياغة قصة علامتك التجارية', icon: <BookOpen size={16} /> }, { id: 's11', nameAr: 'صفحة عن الشركة', descAr: 'كتابة صفحة من نحن', icon: <FileCheck size={16} /> }, { id: 's12', nameAr: 'بيان المهمة', descAr: 'صياغة المهمة والرؤية', icon: <Crosshair size={16} /> }] },
  '5': { id: '5', nameAr: 'لمى', roleAr: 'مخططة الحملات', avatar: <Megaphone size={28} />, color: '#06B6D4', salary: 349, personalityAr: 'قيادية واستراتيجية', departmentAr: 'الإعلانات', tier: 'ENTERPRISE',
    skills: [{ id: 's13', nameAr: 'استراتيجية الحملة', descAr: 'تطوير استراتيجية شاملة', icon: <BarChart3 size={16} /> }, { id: 's14', nameAr: 'خطة الوسائط', descAr: 'خطة وسائط مفصلة', icon: <Tv size={16} /> }, { id: 's15', nameAr: 'توزيع الميزانية', descAr: 'تحليل وتوزيع الميزانية', icon: <Wallet size={16} /> }] },
  '6': { id: '6', nameAr: 'تركي', roleAr: 'محلل الأداء', avatar: <LineChart size={28} />, color: '#EF4444', salary: 349, personalityAr: 'دقيق ومنهجي', departmentAr: 'التحليلات', tier: 'ENTERPRISE',
    skills: [{ id: 's16', nameAr: 'تحليل القمع', descAr: 'تحليل قمع المبيعات', icon: <TrendingUp size={16} /> }, { id: 's17', nameAr: 'لوحة المؤشرات', descAr: 'تصميم لوحة KPIs', icon: <LayoutDashboard size={16} /> }, { id: 's18', nameAr: 'خطة اختبار A/B', descAr: 'تصميم خطة اختبار', icon: <FlaskConical size={16} /> }] },
};

const demoHistory: HistoryItem[] = [
  { id: 'h1', title: 'تقويم المحتوى لشهر يوليو', status: 'COMPLETED', date: 'منذ ٢ أيام', rating: 5 },
  { id: 'h2', title: 'خطاطيف إنستغرام', status: 'COMPLETED', date: 'منذ ٤ أيام', rating: 4 },
  { id: 'h3', title: 'هيكل مقال عن رؤية 2030', status: 'COMPLETED', date: 'منذ أسبوع', rating: 5 },
];

export default function WorkspaceClient({ agentId }: { agentId: string }) {
  const router = useRouter();
  const agent = AGENTS[agentId];
  const [tab, setTab] = useState<'skills' | 'history' | 'stats'>('skills');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

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

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          agentName: agent?.nameAr,
          agentId: agentId,
          systemPrompt: `أنت ${agent?.nameAr}، ${agent?.roleAr} في منصة كولاب.
شخصيتك: ${agent?.personalityAr}.
قسمك: ${agent?.departmentAr}.

مهم جداً: تتكلم باللهجة السعودية العامية الطبيعية فقط — مثل أي شخص سعودي عادي يتكلم مع زميله.
استخدم كلمات مثل: وش تبي، كيذا، يعني، إيه، ذحين، خلاص، يالله، أبشر، ما عليك، ودّك، كذا، طيب، زين، تمام.
لا تستخدم الفصحى أبداً — خلك طبيعي وعفوي ومريح.
ساعد المستخدم بأفضل طريقة وقدّم إجابات عملية ومفصّلة مع خبرتك في السوق السعودي.`,
        }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.reply || data.error || 'عذراً، حدث خطأ. حاول مرة أخرى.',
        toolResults: data.toolResults || undefined,
      }]);
    } catch {
      const replies = [
        `شكراً على طلبك! سأعمل على "${msg.substring(0, 30)}..." حالاً. خلني أجهز لك المخرجات.`,
        `ممتاز! أنا ${agent?.nameAr} وهذا بالضبط مجال تخصصي. دقائق وأرجع لك بالنتيجة.`,
        `سؤال رائع! بناءً على خبرتي في السوق السعودي، أقدر أقول لك إن النتائج ستكون مبهرة.`,
      ];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: replies[Math.floor(Math.random() * replies.length)],
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, agent?.nameAr, agent?.roleAr, agent?.personalityAr, agent?.departmentAr, agentId, messages]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!agent) return <div className={styles.emptyState}>الموظف غير موجود</div>;

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
          <div className={styles.inputRow}>
            <textarea className={styles.textInput} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder={`اكتب طلبك لـ ${agent.nameAr}...`} rows={1} disabled={loading} />
            <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={loading || !input.trim()}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
