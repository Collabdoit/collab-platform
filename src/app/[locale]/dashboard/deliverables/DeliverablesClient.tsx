'use client';

import { useState, useEffect } from 'react';
import {
  Package, BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Star, Copy, Download, Eye, Loader2
} from 'lucide-react';
import styles from './deliverables.module.css';

interface DeliverableItem {
  id: string;
  title: string;
  createdAt: string;
  status: string;
  hiredAgent?: { agent: { nameAr: string; color: string } };
  skill?: { nameAr: string };
  deliverable?: { id: string; format: string; rating: number | null; createdAt: string } | null;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={20} />,
  'فهد': <PenTool size={20} />,
  'ريم': <Microscope size={20} />,
  'سلطان': <Palette size={20} />,
  'لمى': <Megaphone size={20} />,
  'تركي': <LineChart size={20} />,
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

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className={styles.noRating}>لم يُقيّم بعد</span>;
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} fill={s <= rating ? '#F59E0B' : 'none'} color={s <= rating ? '#F59E0B' : 'var(--text-muted)'} />
      ))}
    </div>
  );
}

export default function DeliverablesClient() {
  const [tasks, setTasks] = useState<DeliverableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          // Only show tasks that have a deliverable
          const withDeliverable = (data.tasks || []).filter(
            (t: DeliverableItem) => t.deliverable && t.status === 'COMPLETED'
          );
          setTasks(withDeliverable);
        }
      } catch (err) {
        console.error('Failed to load deliverables:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        <h1 className={styles.title}><Package size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />التسليمات</h1>
        <p className={styles.subtitle}>جميع المخرجات التي أنجزها موظفوك</p>
      </div>

      <div className={styles.list}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <div>لا توجد تسليمات بعد</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>أرسل مهمة لأحد موظفيك وستظهر المخرجات هنا</div>
          </div>
        ) : (
          tasks.map((task, i) => {
            const agentName = task.hiredAgent?.agent?.nameAr || 'موظف';
            const agentColor = task.hiredAgent?.agent?.color || '#6366F1';
            const skillName = task.skill?.nameAr || '';
            return (
              <div key={task.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardAvatar} style={{ background: `${agentColor}15`, color: agentColor }}>
                    {AGENT_ICONS[agentName] || <BriefcaseBusiness size={20} />}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>{task.title}</div>
                    <div className={styles.cardMeta} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {agentName} • {skillName} • {timeAgo(task.deliverable?.createdAt || task.createdAt)}
                    </div>
                  </div>
                  <StarRating rating={task.deliverable?.rating || null} />
                </div>
                <div className={styles.cardActions}>
                  <button className="btn btn-secondary btn-sm"><Copy size={13} /> نسخ</button>
                  <button className="btn btn-secondary btn-sm"><Download size={13} /> تحميل</button>
                  <button className="btn btn-primary btn-sm"><Eye size={13} /> عرض كامل</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
