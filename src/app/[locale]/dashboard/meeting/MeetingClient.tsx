'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Building2, Radio, AtSign, Send, User, Sparkles, Loader2,
  Monitor, Mail, BarChart3, Tag, Globe, Briefcase, Layout, Languages
} from 'lucide-react';
import styles from './meeting.module.css';

interface Agent {
  id: string; nameAr: string; roleAr: string; color: string;
}

interface MeetingMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  agentName?: string;
  agentColor?: string;
  content: string;
  time: string;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={18} />,
  'فهد': <PenTool size={18} />,
  'ريم': <Microscope size={18} />,
  'سلطان': <Palette size={18} />,
  'لمى': <Megaphone size={18} />,
  'تركي': <LineChart size={18} />,
  'عبدالله': <Monitor size={18} />,
  'هند': <Sparkles size={18} />,
  'خالد': <Mail size={18} />,
  'دانة': <BarChart3 size={18} />,
  'يزيد': <Tag size={18} />,
  'سارة': <Layout size={18} />,
  'محمد': <Languages size={18} />,
  'العنود': <Briefcase size={18} />,
};

const getAgentIcon = (name: string) => AGENT_ICONS[name] || <Globe size={18} />;

const now = () => new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

export default function MeetingClient() {
  const [hiredAgents, setHiredAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [messages, setMessages] = useState<MeetingMessage[]>([
    { id: 'sys1', role: 'system', content: 'جاري تحميل الحاضرين...', time: now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Record<string, unknown>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch hired agents + real activity data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [agentsRes, activityRes] = await Promise.all([
          fetch('/api/billing'),
          fetch('/api/agents/activity'),
        ]);

        if (agentsRes.ok) {
          const data = await agentsRes.json();
          const agents: Agent[] = (data.payroll || []).map((p: { agentId: string; nameAr: string; roleAr: string; color: string }) => ({
            id: p.agentId,
            nameAr: p.nameAr,
            roleAr: p.roleAr,
            color: p.color,
          }));
          setHiredAgents(agents);
          setMessages([{
            id: 'sys1', role: 'system',
            content: agents.length > 0
              ? `مرحباً بكم في غرفة الاجتماعات — ${agents.length} موظفين متصلون`
              : 'غرفة الاجتماعات فارغة — وظّف موظفين أولاً من صفحة الموظفين',
            time: now(),
          }]);
        }

        if (activityRes.ok) {
          const actData = await activityRes.json();
          setActivityData(actData.activity || {});
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setMessages([{ id: 'sys1', role: 'system', content: 'فشل في تحميل الموظفين', time: now() }]);
      } finally {
        setLoadingAgents(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typingAgent]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading || hiredAgents.length === 0) return;

    const userMsg: MeetingMessage = { id: Date.now().toString(), role: 'user', content: msg, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build conversation history for context
    const currentMessages = [...messages, userMsg];
    const conversationContext = currentMessages
      .filter(m => m.role !== 'system')
      .slice(-10) // last 10 messages for context
      .map(m => m.role === 'user' ? `المدير: ${m.content}` : `${m.agentName}: ${m.content}`)
      .join('\n');

    const respondingCount = Math.min(Math.floor(Math.random() * 3) + 2, hiredAgents.length);
    const shuffled = [...hiredAgents].sort(() => Math.random() - 0.5).slice(0, respondingCount);

    const agentReplies: MeetingMessage[] = [];

    for (let i = 0; i < shuffled.length; i++) {
      const agent = shuffled[i];
      setTypingAgent(agent.nameAr);

      // Build real activity summary for this agent
      const agentActivity = activityData[agent.id] as Record<string, unknown> | undefined;
      let activitySummary = 'ما عندك بيانات أداء سابقة بعد — أنت جديد.';
      if (agentActivity) {
        const parts: string[] = [];
        if ((agentActivity.emailsSent as number) > 0) parts.push(`إيميلات مرسلة: ${agentActivity.emailsSent}`);
        if ((agentActivity.websitesAnalyzed as number) > 0) parts.push(`مواقع حللتها: ${agentActivity.websitesAnalyzed}`);
        if ((agentActivity.reportsGenerated as number) > 0) parts.push(`تقارير أنشأتها: ${agentActivity.reportsGenerated}`);
        if ((agentActivity.codeExecuted as number) > 0) parts.push(`أكواد نفذتها: ${agentActivity.codeExecuted}`);
        if ((agentActivity.csvExported as number) > 0) parts.push(`ملفات CSV صدرتها: ${agentActivity.csvExported}`);
        if ((agentActivity.tasksCompleted as number) > 0) parts.push(`مهام مكتملة: ${agentActivity.tasksCompleted}`);
        if (parts.length > 0) {
          activitySummary = `إحصائياتك الحقيقية (آخر 30 يوم):\n${parts.join('\n')}`;
        } else {
          activitySummary = 'ما سويت أي عمليات بعد في آخر 30 يوم.';
        }
      }

      // Previous replies from other agents in this round
      const previousReplies = agentReplies
        .map(r => `${r.agentName}: ${r.content}`)
        .join('\n');

      try {
        const res = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: msg }],
            agentId: agent.id,
            agentName: agent.nameAr,
            systemPrompt: `أنت ${agent.nameAr}، ${agent.roleAr} في فريق التسويق. أنت في اجتماع فريق مع المدير وزملائك.

## بياناتك الحقيقية:
${activitySummary}

## قاعدة مهمة جداً:
- إذا سألوك عن أرقام أو إحصائيات — استخدم بياناتك الحقيقية فقط المذكورة أعلاه
- إذا ما عندك بيانات — قول بصراحة "ما عندي بيانات عن هالشي بعد" ولا تخترع أرقام أبداً
- لا تألّف أرقام أو إحصائيات من راسك — هذا ممنوع

## سياق المحادثة:
${conversationContext}
${previousReplies ? `\nردود زملائك في هذا الاجتماع:\n${previousReplies}` : ''}

## أسلوبك:
- أجب بإيجاز (2-4 جمل)
- تكلم بالسعودي العامي الطبيعي
- ركز على تخصصك: ${agent.roleAr}
- لا تكرر ما قاله زملاؤك — أضف شي جديد من تخصصك
- ادخل بالموضوع على طول`,
          }),
        });

        const data = await res.json();
        setTypingAgent(null);

        const reply: MeetingMessage = {
          id: `${Date.now()}-${agent.id}`,
          role: 'agent',
          agentId: agent.id,
          agentName: agent.nameAr,
          agentColor: agent.color,
          content: data.reply || `من ناحيتي كـ${agent.roleAr}، ما عندي شي أضيفه ذحين.`,
          time: now(),
        };
        agentReplies.push(reply);
        setMessages(prev => [...prev, reply]);
      } catch {
        setTypingAgent(null);
        const fallback: MeetingMessage = {
          id: `${Date.now()}-${agent.id}`,
          role: 'agent',
          agentId: agent.id,
          agentName: agent.nameAr,
          agentColor: agent.color,
          content: `واجهت مشكلة تقنية، ما أقدر أرد ذحين.`,
          time: now(),
        };
        agentReplies.push(fallback);
        setMessages(prev => [...prev, fallback]);
      }
    }

    setLoading(false);
  }, [input, loading, hiredAgents, messages, activityData]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const mentionAgent = (name: string) => {
    setInput(prev => prev + `@${name} `);
  };

  const meetingTopics = [
    { label: 'ناقشوا خطة الحملة القادمة', icon: <Megaphone size={13} /> },
    { label: 'اقترحوا أفكار محتوى جديدة', icon: <Sparkles size={13} /> },
    { label: 'راجعوا أداء الشهر الماضي', icon: <LineChart size={13} /> },
  ];

  if (loadingAgents) {
    return (
      <div className={styles.meetingPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className={styles.meetingPage}>
      {/* Header */}
      <div className={styles.meetingHeader}>
        <div>
          <div className={styles.meetingTitle}><Building2 size={20} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '6px' }} /> غرفة الاجتماعات</div>
          <div className={styles.meetingSubtitle}>اجتمع مع فريقك واتخذ قرارات جماعية</div>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          بث مباشر
        </div>
        <div className={styles.participantAvatars}>
          {hiredAgents.slice(0, 5).map(a => (
            <div key={a.id} className={styles.participantAvatar} style={{ background: `${a.color}20`, color: a.color }} title={a.nameAr}>
              {getAgentIcon(a.nameAr)}
            </div>
          ))}
          {hiredAgents.length > 5 && (
            <div className={styles.participantCount}>+{hiredAgents.length - 5}</div>
          )}
        </div>
      </div>

      <div className={styles.meetingBody}>
        {/* Attendees Panel */}
        <div className={styles.attendeesPanel}>
          <div className={styles.attendeesTitle}>الحاضرون ({hiredAgents.length})</div>
          {hiredAgents.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              لا يوجد موظفون. وظّف موظفين أولاً.
            </div>
          ) : (
            hiredAgents.map(agent => (
              <div key={agent.id} className={styles.attendeeCard}>
                <div className={styles.attendeeAvatar} style={{ background: `${agent.color}15`, color: agent.color }}>
                  {getAgentIcon(agent.nameAr)}
                </div>
                <div className={styles.attendeeInfo}>
                  <div className={styles.attendeeName}>{agent.nameAr}</div>
                  <div className={styles.attendeeRole}>{agent.roleAr}</div>
                </div>
                <button className={styles.mentionBtn} onClick={() => mentionAgent(agent.nameAr)}>
                  <AtSign size={10} /> ذكر
                </button>
              </div>
            ))
          )}
        </div>

        {/* Chat Thread */}
        <div className={styles.chatThread}>
          <div className={styles.threadMessages} ref={chatRef}>
            {messages.map(msg => {
              if (msg.role === 'system') {
                return <div key={msg.id} className={styles.systemMsg}><Radio size={12} style={{ marginInlineEnd: '4px' }} />{msg.content}</div>;
              }
              return (
                <div key={msg.id} className={`${styles.meetingMsg} ${msg.role === 'user' ? styles.meetingMsgUser : styles.meetingMsgAgent}`}>
                  <div className={styles.msgAvatar} style={{ background: msg.role === 'user' ? 'var(--accent-primary-glow)' : `${msg.agentColor}15`, color: msg.role === 'user' ? 'var(--accent-primary-light)' : msg.agentColor }}>
                    {msg.role === 'user' ? <User size={16} /> : getAgentIcon(msg.agentName || '')}
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

          {/* Typing */}
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
              {messages.length <= 1 && hiredAgents.length > 0 && (
                <>
                  {meetingTopics.map(topic => (
                    <button key={topic.label} className={styles.topicBtn} onClick={() => sendMessage(topic.label)}>
                      {topic.icon} {topic.label}
                    </button>
                  ))}
                </>
              )}
              <textarea
                className={styles.meetingTextarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={hiredAgents.length > 0 ? 'اكتب رسالتك للفريق...' : 'وظّف موظفين أولاً...'}
                rows={1}
                disabled={loading || hiredAgents.length === 0}
              />
              <button className={styles.meetingSendBtn} onClick={() => sendMessage()} disabled={loading || !input.trim() || hiredAgents.length === 0}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
