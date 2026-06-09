'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './InterviewModal.module.css';

interface Skill {
  id: string;
  nameAr: string;
  icon: string;
}

interface Agent {
  id: string;
  nameAr: string;
  roleAr: string;
  avatar: string;
  color: string;
  salary: number;
  minSalary: number;
  tier: string;
  personalityAr: string;
  skills: Skill[];
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  createdAt?: string;
}

interface InterviewModalProps {
  agent: Agent;
  onClose: () => void;
  onHired: (agreedSalary: number) => void;
}

export default function InterviewModal({ agent, onClose, onHired }: InterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [proposedSalary, setProposedSalary] = useState(agent.salary);
  const [negotiationResult, setNegotiationResult] = useState<{
    accepted: boolean;
    salary: number;
  } | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  // Start interview on mount
  useEffect(() => {
    startInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id }),
      });
      const data = await res.json();
      if (data.interview) {
        setInterviewId(data.interview.id);
        setMessages(data.interview.messages);
        setMessageCount(1);
      }
    } catch {
      // Fallback to local demo
      setMessages([{
        id: 'intro',
        role: 'agent',
        content: `مرحباً! أنا ${agent.nameAr}، ${agent.roleAr}. سعيد/ة بالمقابلة! 😊\n\nكيف يمكنني مساعدتك اليوم؟`,
      }]);
      setMessageCount(1);
    }
    setLoading(false);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setMessageCount((prev) => prev + 1);

    try {
      if (interviewId) {
        const res = await fetch(`/api/interviews/${interviewId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msgText }),
        });
        const data = await res.json();
        if (data.messages) {
          const agentMsg = data.messages.find((m: Message) => m.role === 'agent');
          if (agentMsg) {
            setMessages((prev) => [...prev, agentMsg]);
            setMessageCount(data.messageCount || messageCount + 2);
          }
        }
      } else {
        // Demo fallback
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'agent',
            content: `شكراً على سؤالك! أنا ${agent.nameAr} وأنا متحمس/ة لهذه الفرصة. هل تريد معرفة المزيد عن مهاراتي؟ 😊`,
          }]);
          setLoading(false);
        }, 1200);
        return;
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'عذراً، حدث خطأ. يمكنك المحاولة مرة أخرى! 🙏',
      }]);
    }
    setLoading(false);
  }, [input, loading, interviewId, agent.nameAr, messageCount]);

  const handleNegotiate = async () => {
    if (!interviewId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/interviews/${interviewId}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedSalary }),
      });
      const data = await res.json();
      
      if (data.result) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'user', content: `💰 عرض راتب: ${proposedSalary} ر.س شهرياً` },
          { id: (Date.now() + 1).toString(), role: 'agent', content: data.result.agentResponse },
        ]);

        if (data.result.accepted) {
          setNegotiationResult({ accepted: true, salary: proposedSalary });
          setShowNegotiation(false);
        } else if (data.result.counterOffer) {
          setProposedSalary(data.result.counterOffer);
        }
      }
    } catch {
      // Demo fallback
      if (proposedSalary >= agent.minSalary) {
        setMessages((prev) => [...prev,
          { id: Date.now().toString(), role: 'user', content: `💰 عرض راتب: ${proposedSalary} ر.س شهرياً` },
          { id: (Date.now() + 1).toString(), role: 'agent', content: `✅ ممتاز! أقبل عرض ${proposedSalary} ر.س شهرياً. يسعدني الانضمام لفريقك! 🎉` },
        ]);
        setNegotiationResult({ accepted: true, salary: proposedSalary });
        setShowNegotiation(false);
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: '🎯 ما مهاراتك؟', text: 'ما هي مهاراتك الأساسية وكيف تقدر تفيدني؟' },
    { label: '📊 أعمالك السابقة', text: 'احكِ لي عن تجربتك وأعمالك السابقة' },
    { label: '💰 كم راتبك؟', text: 'كم راتبك الشهري؟ وهل ممكن نتفاوض؟' },
    { label: '⚡ طريقة عملك', text: 'كيف تشتغل/ين؟ وش طريقتك في تنفيذ المهام؟' },
  ];

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerAvatar} style={{ background: `${agent.color}15` }}>
            {agent.avatar}
            <span className={styles.onlineDot}></span>
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.headerName}>مقابلة مع {agent.nameAr}</div>
            <div className={styles.headerRole}>{agent.roleAr}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea} ref={chatRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowAgent}`}
            >
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAgent}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          )}
        </div>

        {/* Quick Actions (show early in convo) */}
        {messageCount <= 3 && !showNegotiation && !negotiationResult && (
          <div className={styles.quickActions}>
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                className={styles.quickBtn}
                onClick={() => sendMessage(qa.text)}
                disabled={loading}
              >
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {/* Negotiation Bar */}
        {showNegotiation && !negotiationResult && (
          <div className={styles.negotiationBar}>
            <div className={styles.negotiationHeader}>
              <span className={styles.negotiationTitle}>💰 تفاوض على الراتب</span>
              <span className={styles.salaryDisplay}>
                {proposedSalary} <small>ر.س/شهرياً</small>
              </span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                className={styles.slider}
                min={Math.max(agent.minSalary - 20, 0)}
                max={Math.round(agent.salary * 1.2)}
                value={proposedSalary}
                onChange={(e) => setProposedSalary(Number(e.target.value))}
              />
              <div className={styles.sliderLabels}>
                <span>{Math.max(agent.minSalary - 20, 0)} ر.س</span>
                <span>الأساسي: {agent.salary} ر.س</span>
                <span>{Math.round(agent.salary * 1.2)} ر.س</span>
              </div>
            </div>
            <div className={styles.negotiationActions}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNegotiation(false)}>
                إلغاء
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleNegotiate} disabled={loading}>
                {loading ? '...' : 'تقديم العرض'}
              </button>
            </div>
          </div>
        )}

        {/* Result Banner */}
        {negotiationResult && (
          <div className={`${styles.resultBanner} ${negotiationResult.accepted ? styles.resultBannerAccepted : styles.resultBannerRejected}`}>
            <div className={styles.resultText}>
              ✅ تم الاتفاق — {negotiationResult.salary} ر.س/شهرياً
            </div>
            <button className="btn btn-primary" onClick={() => onHired(negotiationResult.salary)}>
              🤝 توظيف {agent.nameAr}
            </button>
          </div>
        )}

        {/* Input Area */}
        {!negotiationResult && (
          <div className={styles.inputArea}>
            <div className={styles.inputRow}>
              {messageCount >= 3 && !showNegotiation && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowNegotiation(true)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  💰 تفاوض
                </button>
              )}
              <textarea
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                rows={1}
                disabled={loading}
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
              >
                ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
