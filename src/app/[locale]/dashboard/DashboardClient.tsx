'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CheckCircle2, Users, Wallet, Building2, ClipboardList,
  BriefcaseBusiness, UserPlus
} from 'lucide-react';
import styles from './dashboard.module.css';
import type { Agent3D } from '@/components/office3d/OfficeScene';

const OfficeScene = dynamic(
  () => import('@/components/office3d/OfficeScene'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%', height: '55vh', minHeight: 400,
        borderRadius: '1.25rem', background: '#0F1117',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(255,255,255,0.06)',
          borderTopColor: '#6366F1', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>جاري تحميل المكتب...</span>
      </div>
    ),
  }
);

// Agent colors by name
const AGENT_COLORS: Record<string, string> = {
  'نورة': '#8B5CF6', 'فهد': '#F59E0B', 'ريم': '#10B981',
  'سلطان': '#3B82F6', 'لمى': '#EC4899', 'تركي': '#06B6D4',
  'عبدالله': '#F97316', 'هند': '#14B8A6', 'خالد': '#EF4444',
  'دانة': '#A855F7', 'يزيد': '#84CC16', 'سارة': '#F472B6',
  'محمد': '#22D3EE', 'العنود': '#E879F9',
};

export default function DashboardClient() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent3D[]>([]);
  const [stats, setStats] = useState({ tasks: 0, hired: 0, cost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch hired agents
        const billingRes = await fetch('/api/billing');
        if (billingRes.ok) {
          const billing = await billingRes.json();
          const hiredAgents: Agent3D[] = (billing.hiredAgents || []).map((ha: {
            id: string;
            agent: { id: string; nameAr: string; roleAr: string };
            agreedSalary: number;
          }) => ({
            id: ha.agent.id,
            name: ha.agent.nameAr,
            role: ha.agent.roleAr,
            avatar: ha.agent.nameAr[0],
            color: AGENT_COLORS[ha.agent.nameAr] || '#6366F1',
            status: 'IDLE' as const,
          }));
          setAgents(hiredAgents);
          setStats({
            tasks: billing.totalTasks || 0,
            hired: hiredAgents.length,
            cost: billing.totalMonthlySalary || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className={styles.page}>
      {/* 3D Office Scene */}
      <OfficeScene
        agents={agents}
        maxDesks={6}
        onAgentClick={(id) => router.push(`./dashboard/agents`)}
        onEmptyDeskClick={() => router.push('./dashboard/agents')}
        onMeetingClick={() => router.push('./dashboard/meeting')}
      />

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>المهام المنجزة</span>
            <span className={styles.statIcon}><CheckCircle2 size={20} /></span>
          </div>
          <div className={styles.statValue}>{stats.tasks}</div>
          <div className={styles.statMeta}>هذا الشهر</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الموظفون الفعالون</span>
            <span className={styles.statIcon}><Users size={20} /></span>
          </div>
          <div className={styles.statValue}>{stats.hired} / 14</div>
          <div className={styles.statMeta}>
            <Link href="/dashboard/agents" style={{ color: 'var(--accent-primary-light)' }}>
              وظّف المزيد ←
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>التكلفة الشهرية</span>
            <span className={styles.statIcon}><Wallet size={20} /></span>
          </div>
          <div className={styles.statValue}>{stats.cost} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>ر.س</span></div>
          <div className={styles.statMeta}>
            <Link href="/dashboard/payroll" style={{ color: 'var(--accent-primary-light)' }}>
              عرض التفاصيل ←
            </Link>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>غرفة الاجتماعات</span>
            <span className={styles.statIcon}><Building2 size={20} /></span>
          </div>
          <div className={styles.statValue}>{stats.hired} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>حاضرين</span></div>
          <div className={styles.statMeta}>
            <Link href="./dashboard/meeting" style={{ color: 'var(--accent-primary-light)' }}>
              دخول الاجتماع ←
            </Link>
          </div>
        </div>
      </div>

      {/* Empty state or activity */}
      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>
          <ClipboardList size={18} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '6px' }} />
          {agents.length === 0 ? 'ابدأ الآن' : 'فريقك'}
        </h3>

        <div className={styles.activityList}>
          {agents.length === 0 ? (
            <div className={styles.activityItem} onClick={() => router.push('./dashboard/agents')} style={{ cursor: 'pointer' }}>
              <div className={styles.activityAvatar} style={{ background: 'rgba(99,102,241,0.15)' }}>
                <UserPlus size={18} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>
                  <span className={styles.activityAgentName}>لا يوجد موظفين</span>{' '}
                  — اذهب إلى سوق الموظفين ووظّف فريقك الأول
                </div>
                <div className={styles.activityTime}>ابدأ الآن ←</div>
              </div>
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className={styles.activityItem}>
                <div className={styles.activityAvatar} style={{ background: `${agent.color}15` }}>
                  <BriefcaseBusiness size={18} style={{ color: agent.color }} />
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    <span className={styles.activityAgentName}>{agent.name}</span>{' '}
                    — {agent.role}
                  </div>
                  <div className={styles.activityTime}>جاهز للعمل</div>
                </div>
                <div className={styles.activityStatus}>
                  <span className="status-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B98133' }}></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
