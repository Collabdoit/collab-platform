'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './workspace.module.css';

interface Skill { id: string; nameAr: string; descAr: string; icon: string; }
interface HistoryItem { id: string; title: string; status: string; date: string; rating?: number; }
interface Message { id: string; role: 'user' | 'agent'; content: string; }

interface AgentData {
  id: string; nameAr: string; roleAr: string; avatar: string; color: string;
  salary: number; personalityAr: string; departmentAr: string; tier: string;
  skills: Skill[];
}

const AGENTS: Record<string, AgentData> = {
  '1': { id: '1', nameAr: 'نورة', roleAr: 'استراتيجية المحتوى', avatar: '👩‍💼', color: '#8B5CF6', salary: 99, personalityAr: 'منظمة ودقيقة، تحب التخطيط المسبق', departmentAr: 'المحتوى', tier: 'STARTER',
    skills: [{ id: 's1', nameAr: 'تقويم المحتوى', descAr: 'إنشاء تقويم محتوى شهري مفصل', icon: '📅' }, { id: 's2', nameAr: 'هيكل المقال', descAr: 'بناء هيكل مقال احترافي', icon: '📝' }, { id: 's3', nameAr: 'خطاطيف السوشيال', descAr: 'خطاطيف جذابة للمنشورات', icon: '🎯' }] },
  '2': { id: '2', nameAr: 'فهد', roleAr: 'كاتب إعلانات', avatar: '👨‍💻', color: '#F59E0B', salary: 99, personalityAr: 'مبدع وجريء في الأفكار', departmentAr: 'الإعلانات', tier: 'STARTER',
    skills: [{ id: 's4', nameAr: 'كتابة نص إعلاني', descAr: 'نصوص إعلانية مقنعة', icon: '✍️' }, { id: 's5', nameAr: 'عناوين بديلة', descAr: 'عناوين جذابة للاختبار', icon: '🔥' }, { id: 's6', nameAr: 'تحسين CTA', descAr: 'تحسين أزرار الدعوة للعمل', icon: '🎯' }] },
  '3': { id: '3', nameAr: 'ريم', roleAr: 'محللة SEO', avatar: '👩‍🔬', color: '#10B981', salary: 199, personalityAr: 'تحليلية وذكية، تحب الأرقام', departmentAr: 'التحليلات', tier: 'GROWTH',
    skills: [{ id: 's7', nameAr: 'تدقيق SEO', descAr: 'تدقيق شامل للموقع', icon: '🔍' }, { id: 's8', nameAr: 'بحث كلمات مفتاحية', descAr: 'بحث شامل في السوق السعودي', icon: '🔑' }, { id: 's9', nameAr: 'مولّد Meta Tags', descAr: 'توليد meta tags محسّنة', icon: '🏷️' }] },
  '4': { id: '4', nameAr: 'سلطان', roleAr: 'راوي العلامة التجارية', avatar: '👨‍🎨', color: '#EC4899', salary: 199, personalityAr: 'قصصي وملهم', departmentAr: 'المحتوى', tier: 'GROWTH',
    skills: [{ id: 's10', nameAr: 'قصة العلامة', descAr: 'صياغة قصة علامتك التجارية', icon: '📖' }, { id: 's11', nameAr: 'صفحة عن الشركة', descAr: 'كتابة صفحة من نحن', icon: '📄' }, { id: 's12', nameAr: 'بيان المهمة', descAr: 'صياغة المهمة والرؤية', icon: '🎯' }] },
  '5': { id: '5', nameAr: 'لمى', roleAr: 'مخططة الحملات', avatar: '👩‍💼', color: '#06B6D4', salary: 349, personalityAr: 'قيادية واستراتيجية', departmentAr: 'الإعلانات', tier: 'ENTERPRISE',
    skills: [{ id: 's13', nameAr: 'استراتيجية الحملة', descAr: 'تطوير استراتيجية شاملة', icon: '📊' }, { id: 's14', nameAr: 'خطة الوسائط', descAr: 'خطة وسائط مفصلة', icon: '📺' }, { id: 's15', nameAr: 'توزيع الميزانية', descAr: 'تحليل وتوزيع الميزانية', icon: '💰' }] },
  '6': { id: '6', nameAr: 'تركي', roleAr: 'محلل الأداء', avatar: '👨‍📊', color: '#EF4444', salary: 349, personalityAr: 'دقيق ومنهجي', departmentAr: 'التحليلات', tier: 'ENTERPRISE',
    skills: [{ id: 's16', nameAr: 'تحليل القمع', descAr: 'تحليل قمع المبيعات', icon: '📈' }, { id: 's17', nameAr: 'لوحة المؤشرات', descAr: 'تصميم لوحة KPIs', icon: '📊' }, { id: 's18', nameAr: 'خطة اختبار A/B', descAr: 'تصميم خطة اختبار', icon: '🧪' }] },
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

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    // Demo response
    setTimeout(() => {
      const replies = [
        `شكراً على طلبك! سأعمل على "${msg.substring(0, 30)}..." حالاً. خلني أجهز لك المخرجات 📋`,
        `ممتاز! أنا ${agent?.nameAr} وهذا بالضبط مجال تخصصي. دقائق وأرجع لك بالنتيجة 💪`,
        `سؤال رائع! بناءً على خبرتي في السوق السعودي، أقدر أقول لك إن النتائج ستكون مبهرة. خلني أبدأ العمل 🚀`,
        `تم! سأحضّر لك تقرير شامل مع توصيات عملية. انتظرني... ⏳`,
      ];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: replies[Math.floor(Math.random() * replies.length)],
      }]);
      setLoading(false);
    }, 1200);
  }, [input, loading, agent?.nameAr]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!agent) return <div className={styles.emptyState}>الموظف غير موجود</div>;

  const quickActions = [
    { label: '📅 أنشئ تقويم محتوى', text: 'أنشئ لي تقويم محتوى لهذا الشهر' },
    { label: '📊 حلل أداء الموقع', text: 'حلل أداء موقعي وأعطني توصيات' },
    { label: '✍️ اكتب نص إعلاني', text: 'اكتب لي نص إعلاني لحملة جديدة' },
    { label: '📖 اكتب قصة علامتي', text: 'ساعدني في كتابة قصة علامتي التجارية' },
  ];

  return (
    <div className={styles.workspace}>
      {/* ─── Sidebar ─────────────────────── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.agentAvatarLg} style={{ background: `${agent.color}15` }}>
            {agent.avatar}
            <span className={styles.statusDot} style={{ background: '#10B981' }}></span>
          </div>
          <div className={styles.agentNameLg}>{agent.nameAr}</div>
          <div className={styles.agentRoleLg}>{agent.roleAr}</div>
          <span className={styles.salaryTag}>💰 {agent.salary} ر.س/شهرياً</span>
        </div>

        <div className={styles.sidebarTabs}>
          {(['skills', 'history', 'stats'] as const).map(t => (
            <button key={t} className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`} onClick={() => setTab(t)}>
              {t === 'skills' ? '🎯 المهارات' : t === 'history' ? '📋 السجل' : '📊 الإنجازات'}
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
                          <span key={s} className={s <= item.rating! ? styles.starFilled : styles.starEmpty}>★</span>
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
                <div className={styles.statCard}>
                  <div className={styles.statValue}>12</div>
                  <div className={styles.statLabel}>مهمة منجزة</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>4.8</div>
                  <div className={styles.statLabel}>متوسط التقييم</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>32</div>
                  <div className={styles.statLabel}>يوم خدمة</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>98%</div>
                  <div className={styles.statLabel}>معدل النجاح</div>
                </div>
              </div>
              <div className={styles.sectionTitle}>أبرز الإنجازات 🏆</div>
              <div className={styles.skillCard}>
                <div className={styles.skillCardName}>⭐ أفضل تقويم محتوى</div>
                <div className={styles.skillCardDesc}>حقق 200% زيادة في التفاعل لعميل سعودي</div>
              </div>
              <div className={styles.skillCard}>
                <div className={styles.skillCardName}>🏅 أسرع تنفيذ</div>
                <div className={styles.skillCardDesc}>أنجز 5 مهام في يوم واحد بتقييم 5/5</div>
              </div>
              <div className={styles.skillCard}>
                <div className={styles.skillCardName}>💎 أعلى رضا</div>
                <div className={styles.skillCardDesc}>12 مهمة متتالية بتقييم 5 نجوم</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Chat Main ───────────────────── */}
      <div className={styles.chatMain}>
        <div className={styles.chatHeader}>
          <button className={styles.backBtn} onClick={() => router.push('./agents')}>→</button>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatHeaderName}>{agent.avatar} {agent.nameAr} — {agent.roleAr}</div>
            <div className={styles.chatHeaderStatus}>● متصل/ة الآن</div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeAvatar}>{agent.avatar}</div>
            <div className={styles.welcomeTitle}>مرحباً! أنا {agent.nameAr}</div>
            <div className={styles.welcomeText}>{agent.personalityAr}. اختر مهارة من القائمة أو اكتب طلبك مباشرة!</div>
            <div className={styles.welcomeActions}>
              {quickActions.map(qa => (
                <button key={qa.label} className={styles.welcomeChip} onClick={() => sendMessage(qa.text)}>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.chatMessages} ref={chatRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : styles.msgRowAgent}`}>
                <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgUser : styles.msgAgent}`}>
                  {msg.content}
                </div>
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
            <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={loading || !input.trim()}>↗</button>
          </div>
        </div>
      </div>
    </div>
  );
}
