'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, BriefcaseBusiness, PenTool, Microscope,
  Palette, Megaphone, LineChart, Calendar, Search, Key, Target,
  Flame, BookOpen, FileCheck, Crosshair, BarChart3, Tv, Loader2,
  X, Send, CheckCircle2, AlertCircle, Eye
} from 'lucide-react';
import styles from './tasks.module.css';

interface TaskItem {
  id: string;
  title: string;
  briefing: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: string;
  createdAt: string;
  hiredAgent?: {
    agent: { nameAr: string; color: string; roleAr: string };
  };
  skill?: { nameAr: string; icon: string };
  deliverable?: { id: string; rating: number | null; content?: string } | null;
}

interface HiredAgentOption {
  id: string;
  agent: { id: string; nameAr: string; color: string; roleAr: string; avatar: string };
  skills?: { id: string; nameAr: string; icon: string; descriptionAr: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  QUEUED: 'في الانتظار',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  FAILED: 'فشل',
};

const STATUS_COLORS: Record<string, string> = {
  QUEUED: '#475569',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#10B981',
  FAILED: '#F43F5E',
};

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={20} />,
  'فهد': <PenTool size={20} />,
  'ريم': <Microscope size={20} />,
  'سلطان': <Palette size={20} />,
  'لمى': <Megaphone size={20} />,
  'تركي': <LineChart size={20} />,
};

const SKILL_ICONS: Record<string, React.ReactNode> = {
  'تقويم المحتوى': <Calendar size={14} />,
  'هيكل المقال': <BookOpen size={14} />,
  'خطاطيف السوشيال': <Target size={14} />,
  'كتابة نص إعلاني': <PenTool size={14} />,
  'عناوين بديلة': <Flame size={14} />,
  'تحسين CTA': <Crosshair size={14} />,
  'تدقيق SEO': <Search size={14} />,
  'بحث الكلمات المفتاحية': <Key size={14} />,
  'مولّد Meta Tags': <FileCheck size={14} />,
  'استراتيجية الحملة': <BarChart3 size={14} />,
  'خطة الوسائط': <Tv size={14} />,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  const diffDay = Math.floor(diffHr / 24);
  return `منذ ${diffDay} يوم`;
}

export default function TasksClient() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [showDeliverable, setShowDeliverable] = useState<string | null>(null);
  const [deliverableContent, setDeliverableContent] = useState<string>('');
  const [loadingDeliverable, setLoadingDeliverable] = useState(false);

  // Form state
  const [agents, setAgents] = useState<HiredAgentOption[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [title, setTitle] = useState('');
  const [briefing, setBriefing] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTasks();
    loadAgents();
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAgents() {
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.hiredAgents || []);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  }

  async function createTask() {
    if (!selectedAgent || !selectedSkill || !title.trim() || !briefing.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hiredAgentId: selectedAgent,
          skillId: selectedSkill,
          title: title.trim(),
          briefing: briefing.trim(),
          priority,
        }),
      });

      if (res.ok) {
        setNotification({ type: 'success', text: 'تم إنشاء المهمة وبدأ التنفيذ!' });
        setShowForm(false);
        setTitle('');
        setBriefing('');
        setSelectedAgent('');
        setSelectedSkill('');
        loadTasks();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', text: err.error || 'فشل في إنشاء المهمة' });
      }
    } catch {
      setNotification({ type: 'error', text: 'خطأ في الاتصال' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function viewDeliverable(taskId: string) {
    setShowDeliverable(taskId);
    setLoadingDeliverable(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setDeliverableContent(data.task?.deliverable?.content || 'لا يوجد محتوى');
      }
    } catch {
      setDeliverableContent('فشل في تحميل التسليم');
    } finally {
      setLoadingDeliverable(false);
    }
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const agentSkills = selectedAgentData?.skills || [];

  const filtered = statusFilter === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: notification.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', fontSize: '0.9rem',
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {notification.text}
        </div>
      )}

      {/* Deliverable Modal */}
      {showDeliverable && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }} onClick={() => setShowDeliverable(null)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem',
            maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto',
            border: '1px solid var(--border-subtle)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>📄 التسليم</h3>
              <button onClick={() => setShowDeliverable(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {loadingDeliverable ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{
                whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem',
                color: 'var(--text-secondary)', direction: 'rtl',
              }}>
                {deliverableContent}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><ClipboardList size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />المهام</h1>
          <p className={styles.subtitle}>تتبع جميع المهام المعينة لموظفيك</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> إلغاء</> : <><Plus size={16} /> مهمة جديدة</>}
        </button>
      </div>

      {/* New Task Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '1rem', padding: '1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} style={{ color: '#6366F1' }} /> مهمة جديدة
          </h3>

          {/* Agent Selection */}
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>اختر الموظف</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {agents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>لا يوجد موظفين — وظّف من صفحة الموظفين أولاً</p>
            ) : (
              agents.map(ha => (
                <button
                  key={ha.id}
                  onClick={() => { setSelectedAgent(ha.id); setSelectedSkill(''); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                    border: `1px solid ${selectedAgent === ha.id ? ha.agent.color : 'var(--border-subtle)'}`,
                    background: selectedAgent === ha.id ? `${ha.agent.color}10` : 'transparent',
                    color: selectedAgent === ha.id ? ha.agent.color : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: selectedAgent === ha.id ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  {AGENT_ICONS[ha.agent.nameAr] || <BriefcaseBusiness size={14} />} {ha.agent.nameAr}
                </button>
              ))
            )}
          </div>

          {/* Skill Selection */}
          {selectedAgent && agentSkills.length > 0 && (
            <>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>اختر المهارة</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {agentSkills.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSkill(s.id)}
                    style={{
                      padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem',
                      border: `1px solid ${selectedSkill === s.id ? '#6366F1' : 'var(--border-subtle)'}`,
                      background: selectedSkill === s.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                      color: selectedSkill === s.id ? '#6366F1' : 'var(--text-secondary)',
                      cursor: 'pointer', fontWeight: selectedSkill === s.id ? 600 : 400,
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    {SKILL_ICONS[s.nameAr] || <ClipboardList size={12} />} {s.nameAr}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* If agent has no skills, still allow free-form task */}
          {selectedAgent && agentSkills.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              هذا الموظف ليس لديه مهارات محددة — يمكنك إرسال مهمة حرة عبر الدردشة
            </p>
          )}

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="عنوان المهمة (مثال: تقويم محتوى شهر يوليو)"
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
              borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />

          <textarea
            value={briefing}
            onChange={e => setBriefing(e.target.value)}
            placeholder="وصف تفصيلي للمهمة — كل ما تريد الموظف يعرفه عشان ينفذ المطلوب بدقة"
            rows={4}
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
              borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '0.9rem', resize: 'vertical', lineHeight: 1.6,
            }}
          />

          {/* Priority */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { value: 'LOW', label: 'منخفضة', color: '#64748B' },
              { value: 'NORMAL', label: 'عادية', color: '#3B82F6' },
              { value: 'HIGH', label: 'عالية', color: '#F59E0B' },
              { value: 'URGENT', label: 'عاجلة', color: '#EF4444' },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
                  border: `1px solid ${priority === p.value ? p.color : 'var(--border-subtle)'}`,
                  background: priority === p.value ? `${p.color}15` : 'transparent',
                  color: priority === p.value ? p.color : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: priority === p.value ? 600 : 400,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={createTask}
            disabled={submitting || !selectedAgent || !selectedSkill || !title.trim() || !briefing.trim()}
            style={{
              padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none',
              background: submitting ? '#666' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: (!selectedAgent || !selectedSkill || !title.trim() || !briefing.trim()) ? 0.5 : 1,
            }}
          >
            {submitting ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري التنفيذ...</>
            ) : (
              <><Send size={16} /> إرسال المهمة</>
            )}
          </button>
        </div>
      )}

      <div className={styles.filters}>
        {['ALL', 'QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'ALL' ? `الكل (${tasks.length})` : `${STATUS_LABELS[s]} (${tasks.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      <div className={styles.taskList}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ClipboardList size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <div>لا توجد مهام {statusFilter !== 'ALL' ? STATUS_LABELS[statusFilter] : ''} حالياً</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>اضغط "مهمة جديدة" لإنشاء مهمة لأحد موظفيك</div>
          </div>
        ) : (
          filtered.map((task, i) => {
            const agentName = task.hiredAgent?.agent?.nameAr || 'موظف';
            const agentColor = task.hiredAgent?.agent?.color || '#6366F1';
            const skillName = task.skill?.nameAr || '';
            return (
              <div
                key={task.id}
                className={styles.taskCard}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={styles.taskAgent}>
                  <div className={styles.taskAvatar} style={{ background: `${agentColor}15`, color: agentColor }}>
                    {AGENT_ICONS[agentName] || <BriefcaseBusiness size={20} />}
                  </div>
                </div>
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskMeta}>
                    <span>{agentName}</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {SKILL_ICONS[skillName] || <ClipboardList size={14} />} {skillName}
                    </span>
                    <span>•</span>
                    <span>{timeAgo(task.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {task.status === 'COMPLETED' && task.deliverable && (
                    <button
                      onClick={() => viewDeliverable(task.id)}
                      style={{
                        padding: '0.3rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.7rem',
                        border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)',
                        color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      <Eye size={12} /> عرض
                    </button>
                  )}
                  <div className={styles.taskStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: `${STATUS_COLORS[task.status]}15`,
                        color: STATUS_COLORS[task.status],
                        borderColor: `${STATUS_COLORS[task.status]}30`,
                      }}
                    >
                      <span style={{
                        background: STATUS_COLORS[task.status],
                        width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                      }}></span>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
