'use client';

import { useState, useEffect } from 'react';
import {
  Wallet, BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  Loader2, UserMinus
} from 'lucide-react';
import styles from './payroll.module.css';

interface PayrollAgent {
  agentId: string;
  nameAr: string;
  roleAr: string;
  color: string;
  salary: number;
  tier: string;
  status: string;
}

interface BillingStats {
  totalAgents: number;
  totalTasks: number;
  completedTasks: number;
  monthlyBudget: number;
  tokensUsed: number;
  tokensBudget: number;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={18} />,
  'فهد': <PenTool size={18} />,
  'ريم': <Microscope size={18} />,
  'سلطان': <Palette size={18} />,
  'لمى': <Megaphone size={18} />,
  'تركي': <LineChart size={18} />,
};

const TIER_LABELS: Record<string, string> = {
  STARTER: 'مبتدئ', GROWTH: 'متقدم', ENTERPRISE: 'احترافي',
};

export default function PayrollClient() {
  const [agents, setAgents] = useState<PayrollAgent[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/billing');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.payroll || []);
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load payroll:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFire = async (agentId: string, name: string) => {
    if (!confirm(`هل تريد إنهاء تعاقد ${name}؟`)) return;
    try {
      const res = await fetch('/api/agents/fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      if (res.ok) {
        setAgents(prev => prev.filter(a => a.agentId !== agentId));
      }
    } catch (err) {
      console.error('Fire error:', err);
    }
  };

  const total = agents.reduce((sum, a) => sum + a.salary, 0);
  const tokenPercent = stats ? Math.round((stats.tokensUsed / stats.tokensBudget) * 100) : 0;

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}><Wallet size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />كشف الرواتب</h1>
      <p className={styles.subtitle}>ملخص التكاليف الشهرية لموظفيك</p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>التكلفة الشهرية</span>
          <span className={styles.summaryValue}>{total} <small>ر.س</small></span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>عدد الموظفين</span>
          <span className={styles.summaryValue}>{agents.length}</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>المهام المنجزة</span>
          <span className={styles.summaryValue}>{stats?.completedTasks || 0} / {stats?.totalTasks || 0}</span>
        </div>
        <div className={styles.summaryDivider}></div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>الباقة</span>
          <span className={styles.summaryValue} style={{ fontSize: '1rem' }}>
            {total === 0 ? 'مجاني' : total <= 200 ? 'مبتدئ' : total <= 500 ? 'متقدم' : 'احترافي'}
          </span>
        </div>
      </div>

      <div className={styles.usageSection}>
        <div className={styles.usageHeader}>
          <span>استهلاك التوكنات</span>
          <span className={styles.usageText}>{stats?.tokensUsed?.toLocaleString() || 0} / {stats?.tokensBudget?.toLocaleString() || 0}</span>
        </div>
        <div className={styles.usageBarBg}>
          <div className={styles.usageBarFill} style={{ width: `${tokenPercent}%` }}></div>
        </div>
      </div>

      {agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Wallet size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <div>لم يتم توظيف أي موظف بعد</div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>وظّف موظفين من صفحة الموظفين لبدء العمل</div>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الموظف</th>
                <th>الدور</th>
                <th>المستوى</th>
                <th>الراتب الشهري</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.agentId}>
                  <td>
                    <div className={styles.agentCell}>
                      <span className={styles.cellAvatar} style={{ background: `${agent.color}15`, color: agent.color }}>
                        {AGENT_ICONS[agent.nameAr] || <BriefcaseBusiness size={18} />}
                      </span>
                      {agent.nameAr}
                    </div>
                  </td>
                  <td>{agent.roleAr}</td>
                  <td><span className={styles.tierTag}>{TIER_LABELS[agent.tier] || agent.tier}</span></td>
                  <td className={styles.salaryCell}>{agent.salary} ر.س</td>
                  <td>
                    <button
                      onClick={() => handleFire(agent.agentId, agent.nameAr)}
                      style={{
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                        color: '#F43F5E', borderRadius: '6px', padding: '4px 10px',
                        cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <UserMinus size={12} /> إنهاء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className={styles.totalLabel}>الإجمالي</td>
                <td className={styles.totalValue} colSpan={2}>{total} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
