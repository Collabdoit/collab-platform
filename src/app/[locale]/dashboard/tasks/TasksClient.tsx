'use client';

import { useState } from 'react';
import styles from './tasks.module.css';

interface TaskItem {
  id: string;
  title: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  skillName: string;
  skillIcon: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: string;
  createdAt: string;
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

const demoTasks: TaskItem[] = [
  {
    id: '1', title: 'تقويم المحتوى لشهر يوليو', agentName: 'نورة', agentAvatar: '👩‍💼',
    agentColor: '#8B5CF6', skillName: 'تقويم المحتوى', skillIcon: '📅',
    status: 'COMPLETED', priority: 'HIGH', createdAt: 'منذ ٥ دقائق',
  },
  {
    id: '2', title: 'نص إعلاني لحملة رمضان', agentName: 'فهد', agentAvatar: '👨‍💻',
    agentColor: '#F59E0B', skillName: 'كتابة نص إعلاني', skillIcon: '✍️',
    status: 'IN_PROGRESS', priority: 'URGENT', createdAt: 'الآن',
  },
  {
    id: '3', title: 'تدقيق SEO للموقع الجديد', agentName: 'ريم', agentAvatar: '👩‍🔬',
    agentColor: '#10B981', skillName: 'تدقيق SEO', skillIcon: '🔍',
    status: 'COMPLETED', priority: 'NORMAL', createdAt: 'منذ ساعة',
  },
  {
    id: '4', title: 'بحث كلمات مفتاحية للمتجر', agentName: 'ريم', agentAvatar: '👩‍🔬',
    agentColor: '#10B981', skillName: 'بحث الكلمات المفتاحية', skillIcon: '🔑',
    status: 'QUEUED', priority: 'LOW', createdAt: 'منذ ٣ ساعات',
  },
];

export default function TasksClient() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = statusFilter === 'ALL'
    ? demoTasks
    : demoTasks.filter(t => t.status === statusFilter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 المهام</h1>
          <p className={styles.subtitle}>تتبع جميع المهام المعينة لموظفيك</p>
        </div>
        <button className="btn btn-primary">+ مهمة جديدة</button>
      </div>

      <div className={styles.filters}>
        {['ALL', 'QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'ALL' ? 'الكل' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className={styles.taskList}>
        {filtered.map((task, i) => (
          <div
            key={task.id}
            className={styles.taskCard}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={styles.taskAgent}>
              <div className={styles.taskAvatar} style={{ background: `${task.agentColor}15` }}>
                {task.agentAvatar}
              </div>
            </div>
            <div className={styles.taskContent}>
              <div className={styles.taskTitle}>{task.title}</div>
              <div className={styles.taskMeta}>
                <span>{task.agentName}</span>
                <span>•</span>
                <span>{task.skillIcon} {task.skillName}</span>
                <span>•</span>
                <span>{task.createdAt}</span>
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
        ))}
      </div>
    </div>
  );
}
