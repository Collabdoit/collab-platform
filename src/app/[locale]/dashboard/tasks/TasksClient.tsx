'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList, Plus, BriefcaseBusiness, PenTool, Microscope,
  Palette, Megaphone, LineChart, Calendar, Search, Key, Target,
  Flame, BookOpen, FileCheck, Crosshair, BarChart3, Tv, Loader2
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
  deliverable?: { id: string; rating: number | null } | null;
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

  useEffect(() => {
    async function load() {
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
    load();
  }, []);

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
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><ClipboardList size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />المهام</h1>
          <p className={styles.subtitle}>تتبع جميع المهام المعينة لموظفيك</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> مهمة جديدة</button>
      </div>

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
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>ابدأ بإرسال مهمة لأحد موظفيك من صفحة الموظفين</div>
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
                <div className={styles.taskStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: `${STATUS_COLORS[task.status]}15`,
                      color: STATUS_COLORS[task.status],
                      borderColor: `${STATUS_COLORS[task.status]}30`,
                    }}
                  >
                    <span className="status-dot" style={{
                      background: STATUS_COLORS[task.status],
                      width: 6, height: 6,
                    }}></span>
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
