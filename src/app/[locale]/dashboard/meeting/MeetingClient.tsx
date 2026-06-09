'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './meeting.module.css';

interface Agent {
  id: string; nameAr: string; roleAr: string; avatar: string; color: string;
}

interface MeetingMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  agentAvatar?: string;
  agentColor?: string;
  content: string;
  time: string;
}

const HIRED_AGENTS: Agent[] = [
  { id: '1', nameAr: 'نورة', roleAr: 'استراتيجية المحتوى', avatar: '👩‍💼', color: '#8B5CF6' },
  { id: '2', nameAr: 'فهد', roleAr: 'كاتب إعلانات', avatar: '👨‍💻', color: '#F59E0B' },
  { id: '3', nameAr: 'ريم', roleAr: 'محللة SEO', avatar: '👩‍🔬', color: '#10B981' },
  { id: '4', nameAr: 'سلطان', roleAr: 'راوي العلامة', avatar: '👨‍🎨', color: '#EC4899' },
  { id: '5', nameAr: 'لمى', roleAr: 'مخططة الحملات', avatar: '👩‍💼', color: '#06B6D4' },
  { id: '6', nameAr: 'تركي', roleAr: 'محلل الأداء', avatar: '👨‍📊', color: '#EF4444' },
];

const now = () => new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

const AGENT_REPLIES: Record<string, string[]> = {
  '1': [
    '📋 من ناحيتي كمسؤولة المحتوى، أقترح نبدأ بخطة محتوى شاملة تغطي كل المنصات. أقدر أجهز تقويم شهري خلال ساعة.',
    '📅 بناءً على تحليل الأداء السابق، أقترح نركز على الريلز في إنستغرام — هذا النوع يحقق أعلى تفاعل في السوق السعودي.',
    '✅ أنا جاهزة! خلوني أبدأ بتحضير الخطة وأشاركها مع الفريق للمراجعة.',
  ],
  '2': [
    '🔥 أنا مع الفكرة! من ناحية الإعلانات، أقدر أجهز 3 نسخ إعلانية مختلفة نختبرها A/B مع تركي.',
    '✍️ خلوني أصيغ الرسالة الرئيسية للحملة بأسلوب يناسب الجمهور السعودي — عندي أفكار جريئة!',
    '💡 ما رأيكم نسوي عرض خاص مع كود خصم؟ هذي الطريقة تجيب نتائج سريعة.',
  ],
  '3': [
    '🔍 من ناحية SEO، لازم نتأكد إن الصفحات محسّنة قبل الحملة. أقدر أسوي تدقيق سريع خلال 30 دقيقة.',
    '📊 بناءً على بحث الكلمات المفتاحية، في فرصة كبيرة نستهدف "keyword X" — حجم بحث عالي ومنافسة منخفضة.',
    '🔑 أنصح نضيف مقالات في المدونة تستهدف الكلمات المفتاحية الطويلة — هذي استراتيجية طويلة المدى بس نتائجها مضمونة.',
  ],
  '4': [
    '📖 من ناحيتي كراوي للعلامة، أقترح نبدأ بتحديد القصة الأساسية اللي نبنيها حول الحملة. كل حملة ناجحة تبدأ بقصة!',
    '✨ الرسالة لازم تلامس مشاعر الجمهور. خلوني أصيغ narrative يربط المنتج بحياتهم اليومية.',
    '🎯 القصة الأصلية للعلامة لازم تكون واضحة في كل قناة — من السوشيال ميديا للموقع.',
  ],
  '5': [
    '📊 كمخططة حملات، أقترح نوزع الميزانية: 40% إعلانات مدفوعة، 30% محتوى، 20% مؤثرين، 10% SEO.',
    '💰 بناءً على خبرتي في الحملات السعودية، الميزانية المقترحة ممتازة. خلوني أجهز جدول زمني مفصل.',
    '📺 أقترح نبدأ بحملة تجريبية لمدة أسبوعين ثم نقيّم النتائج ونعدّل الاستراتيجية.',
  ],
  '6': [
    '📈 من ناحية التحليلات، رح أجهز لوحة مؤشرات نتابع فيها الأداء لحظياً. المؤشرات الرئيسية: CTR، CPA، ROAS.',
    '🧪 أقترح نسوي A/B test على العناوين والصور — فهد يجهز النسخ وأنا أصمم التجربة وأتابع النتائج.',
    '📊 بناءً على البيانات السابقة، أفضل وقت للنشر للجمهور السعودي هو 8-10 مساءً. خلونا نراعي هذا في الجدولة.',
  ],
};

export default function MeetingClient() {
  const [messages, setMessages] = useState<MeetingMessage[]>([
    { id: 'sys1', role: 'system', content: '🏢 مرحباً بكم في غرفة الاجتماعات — جميع الموظفين متصلون', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typingAgent]);

  const getRandomReply = (agentId: string): string => {
    const replies = AGENT_REPLIES[agentId] || [];
    return replies[Math.floor(Math.random() * replies.length)] || 'أتفق مع الفريق! 👍';
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      time: now(),
    }]);
    setInput('');
    setLoading(true);

    // Simulate 2-4 agents responding with staggered delays
    const respondingCount = Math.floor(Math.random() * 3) + 2; // 2-4 agents
    const shuffled = [...HIRED_AGENTS].sort(() => Math.random() - 0.5).slice(0, respondingCount);

    for (let i = 0; i < shuffled.length; i++) {
      const agent = shuffled[i];
      const delay = 1200 + (i * 1500) + Math.random() * 800;

      setTimeout(() => {
        setTypingAgent(agent.nameAr);
        setTimeout(() => {
          setTypingAgent(null);
          setMessages(prev => [...prev, {
            id: `${Date.now()}-${agent.id}`,
            role: 'agent',
            agentId: agent.id,
            agentName: agent.nameAr,
            agentAvatar: agent.avatar,
            agentColor: agent.color,
            content: getRandomReply(agent.id),
            time: now(),
          }]);
          if (i === shuffled.length - 1) setLoading(false);
        }, 800);
      }, delay);
    }
  }, [input, loading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const mentionAgent = (name: string) => {
    setInput(prev => prev + `@${name} `);
  };

  const meetingTopics = [
    '📊 ناقشوا خطة الحملة القادمة',
    '💡 اقترحوا أفكار محتوى جديدة',
    '📈 راجعوا أداء الشهر الماضي',
  ];

  return (
    <div className={styles.meetingPage}>
      {/* Header */}
      <div className={styles.meetingHeader}>
        <div>
          <div className={styles.meetingTitle}>🏢 غرفة الاجتماعات</div>
          <div className={styles.meetingSubtitle}>اجتمع مع فريقك واتخذ قرارات جماعية</div>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          بث مباشر
        </div>
        <div className={styles.participantAvatars}>
          {HIRED_AGENTS.slice(0, 5).map(a => (
            <div key={a.id} className={styles.participantAvatar} style={{ background: `${a.color}20` }} title={a.nameAr}>
              {a.avatar}
            </div>
          ))}
          {HIRED_AGENTS.length > 5 && (
            <div className={styles.participantCount}>+{HIRED_AGENTS.length - 5}</div>
          )}
        </div>
      </div>

      <div className={styles.meetingBody}>
        {/* Attendees Panel */}
        <div className={styles.attendeesPanel}>
          <div className={styles.attendeesTitle}>الحاضرون ({HIRED_AGENTS.length})</div>
          {HIRED_AGENTS.map(agent => (
            <div key={agent.id} className={styles.attendeeCard}>
              <div className={styles.attendeeAvatar} style={{ background: `${agent.color}15` }}>
                {agent.avatar}
              </div>
              <div className={styles.attendeeInfo}>
                <div className={styles.attendeeName}>{agent.nameAr}</div>
                <div className={styles.attendeeRole}>{agent.roleAr}</div>
              </div>
              <button className={styles.mentionBtn} onClick={() => mentionAgent(agent.nameAr)}>
                @ذكر
              </button>
            </div>
          ))}
        </div>

        {/* Chat Thread */}
        <div className={styles.chatThread}>
          <div className={styles.threadMessages} ref={chatRef}>
            {messages.map(msg => {
              if (msg.role === 'system') {
                return <div key={msg.id} className={styles.systemMsg}>{msg.content}</div>;
              }
              return (
                <div key={msg.id} className={`${styles.meetingMsg} ${msg.role === 'user' ? styles.meetingMsgUser : styles.meetingMsgAgent}`}>
                  <div className={styles.msgAvatar} style={{ background: msg.role === 'user' ? 'var(--accent-primary-glow)' : `${msg.agentColor}15` }}>
                    {msg.role === 'user' ? '👤' : msg.agentAvatar}
                  </div>
                  <div className={styles.msgContent}>
                    <div className={styles.msgName} style={{ color: msg.role === 'user' ? 'var(--accent-primary-light)' : msg.agentColor }}>
                      {msg.role === 'user' ? 'أنت (المدير)' : msg.agentName}
                    </div>
                    <div className={`${styles.msgText} ${msg.role === 'user' ? styles.msgTextUser : styles.msgTextAgent}`}>
                      {msg.content}
                    </div>
                    <div className={styles.msgTime}>{msg.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typing indicator */}
          <div className={styles.meetingTyping}>
            {typingAgent && (
              <>
                <span className={styles.typingDots}>
                  <span className={styles.tDot}></span>
                  <span className={styles.tDot}></span>
                  <span className={styles.tDot}></span>
                </span>
                {typingAgent} يكتب...
              </>
            )}
          </div>

          {/* Input */}
          <div className={styles.meetingInput}>
            <div className={styles.meetingInputRow}>
              {messages.length <= 1 && (
                <>
                  {meetingTopics.map(topic => (
                    <button key={topic} className={styles.topicBtn} onClick={() => sendMessage(topic)}>
                      {topic}
                    </button>
                  ))}
                </>
              )}
              <textarea
                className={styles.meetingTextarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="اكتب رسالتك للفريق..."
                rows={1}
                disabled={loading}
              />
              <button className={styles.meetingSendBtn} onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
