'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import type { Agent3D } from '@/components/office3d/OfficeScene';

// Lazy load 3D scene to avoid SSR issues with Three.js
const OfficeScene = dynamic(
  () => import('@/components/office3d/OfficeScene'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '55vh',
        minHeight: 400,
        borderRadius: '1.25rem',
        background: '#0F1117',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.06)',
          borderTopColor: '#6366F1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
          جاري تحميل المكتب...
        </span>
      </div>
    ),
  }
);

// Demo data — in production this comes from the API
const demoAgents: Agent3D[] = [
  {
    id: '1',
    name: 'نورة',
    role: 'استراتيجية المحتوى',
    avatar: '👩‍💼',
    color: '#8B5CF6',
    status: 'IDLE',
  },
  {
    id: '2',
    name: 'فهد',
    role: 'كاتب إعلانات',
    avatar: '👨‍💻',
    color: '#F59E0B',
    status: 'WORKING',
    currentTask: 'كتابة نص إعلاني لحملة رمضان',
  },
  {
    id: '3',
    name: 'ريم',
    role: 'محللة SEO',
    avatar: '👩‍🔬',
    color: '#10B981',
    status: 'IDLE',
  },
];

const demoActivities = [
  {
    id: '1',
    avatar: '👩‍💼',
    agentName: 'نورة',
    action: 'أكملت',
    task: 'تقويم المحتوى لشهر يوليو',
    time: 'منذ ٥ دقائق',
    statusColor: '#10B981',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    id: '2',
    avatar: '👨‍💻',
    agentName: 'فهد',
    action: 'يعمل على',
    task: 'نص إعلاني لحملة رمضان',
    time: 'الآن',
    statusColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    id: '3',
    avatar: '👩‍🔬',
    agentName: 'ريم',
    action: 'أكملت',
    task: 'تدقيق SEO للموقع',
    time: 'منذ ساعة',
    statusColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  {
    id: '4',
    avatar: '👩‍💼',
    agentName: 'نورة',
    action: 'في الانتظار',
    task: 'خطاطيف سوشيال ميديا',
    time: 'في الانتظار',
    statusColor: '#475569',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
];

export default function DashboardClient() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      {/* 3D Office Scene */}
      <OfficeScene
        agents={demoAgents}
        maxDesks={6}
        onAgentClick={(id) => router.push(`./dashboard/agents/${id}`)}
        onEmptyDeskClick={() => router.push('./dashboard/agents')}
        onMeetingClick={() => router.push('./dashboard/meeting')}
      />

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>المهام المنجزة</span>
            <span className={styles.statIcon}>✅</span>
          </div>
          <div className={styles.statValue}>12</div>
          <div className={styles.statMeta}>هذا الشهر</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الموظفون الفعالون</span>
            <span className={styles.statIcon}>👥</span>
          </div>
          <div className={styles.statValue}>3 / 6</div>
          <div className={styles.statMeta}>
            <Link href="/dashboard/agents" style={{ color: 'var(--accent-primary-light)' }}>
              وظّف المزيد ←
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>التكلفة الشهرية</span>
            <span className={styles.statIcon}>💰</span>
          </div>
          <div className={styles.statValue}>397 <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>ر.س</span></div>
          <div className={styles.statMeta}>
            <Link href="/dashboard/payroll" style={{ color: 'var(--accent-primary-light)' }}>
              عرض التفاصيل ←
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>غرفة الاجتماعات</span>
            <span className={styles.statIcon}>🏢</span>
          </div>
          <div className={styles.statValue}>6 <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>حاضرين</span></div>
          <div className={styles.statMeta}>
            <Link href="./dashboard/meeting" style={{ color: 'var(--accent-primary-light)' }}>
              دخول الاجتماع ←
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>
          📋 آخر النشاطات
        </h3>

        <div className={styles.activityList}>
          {demoActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div
                className={styles.activityAvatar}
                style={{ background: activity.bgColor }}
              >
                {activity.avatar}
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>
                  <span className={styles.activityAgentName}>
                    {activity.agentName}
                  </span>{' '}
                  {activity.action}: {activity.task}
                </div>
                <div className={styles.activityTime}>{activity.time}</div>
              </div>
              <div className={styles.activityStatus}>
                <span
                  className="status-dot"
                  style={{
                    background: activity.statusColor,
                    boxShadow: `0 0 8px ${activity.statusColor}33`,
                  }}
                ></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
