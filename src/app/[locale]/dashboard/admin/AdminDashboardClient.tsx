'use client';

import { useState, useEffect } from 'react';
import {
  Users, Wallet, Brain, Database, Building2, TrendingUp, TrendingDown,
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  BookOpen, Target, Crown, Shield, UserPlus, Settings,
  FileText, Sparkles, Zap, Clock, CheckCircle2, BarChart3, Plus,
  ToggleLeft, ToggleRight, Package, Globe, Loader2
} from 'lucide-react';
import styles from './admin.module.css';

// ─── Types ────────────────────────────────────────────────
interface TenantStats {
  totalAgents: number;
  totalTasks: number;
  completedTasks: number;
  monthlyBudget: number;
  tokensUsed: number;
  tokensBudget: number;
  memoryCount: number;
  knowledgeCount: number;
}

interface PayrollItem {
  agentId: string;
  nameAr: string;
  roleAr: string;
  color: string;
  salary: number;
  status: string;
  provider: string;
}

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  isActive: boolean;
}

interface TenantData {
  name: string;
  industry: string | null;
  slug: string;
  _count: { hiredAgents: number; tasks: number; knowledge: number };
  subscription: { tier: string } | null;
  members: { id: string; name: string | null; email: string; role: string }[];
}

// ─── Icons ────────────────────────────────────────────────
const AGENT_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={16} />,
  'فهد': <PenTool size={16} />,
  'ريم': <Microscope size={16} />,
  'سلطان': <Palette size={16} />,
  'لمى': <Megaphone size={16} />,
  'تركي': <LineChart size={16} />,
};

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  brand: { icon: <Crown size={14} />, color: '#8B5CF6', label: 'العلامة التجارية' },
  product: { icon: <Package size={14} />, color: '#06B6D4', label: 'المنتجات' },
  audience: { icon: <Users size={14} />, color: '#10B981', label: 'الجمهور' },
  competitor: { icon: <Target size={14} />, color: '#EF4444', label: 'المنافسين' },
  guidelines: { icon: <FileText size={14} />, color: '#F59E0B', label: 'الإرشادات' },
};

// ─── Component ────────────────────────────────────────────
export default function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TenantStats>({
    totalAgents: 0, totalTasks: 0, completedTasks: 0, monthlyBudget: 0,
    tokensUsed: 0, tokensBudget: 10000, memoryCount: 0, knowledgeCount: 0,
  });
  const [agents, setAgents] = useState<PayrollItem[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [tenant, setTenant] = useState<TenantData | null>(null);

  // Fetch real data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [billingRes, tenantRes, knowledgeRes] = await Promise.all([
          fetch('/api/billing'),
          fetch('/api/tenants'),
          fetch('/api/knowledge'),
        ]);

        if (billingRes.ok) {
          const billingData = await billingRes.json();
          setStats(billingData.stats);
          setAgents(billingData.payroll || []);
        }

        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setTenant(tenantData.tenant);
        }

        if (knowledgeRes.ok) {
          const knowledgeData = await knowledgeRes.json();
          setKnowledge(knowledgeData.knowledge || []);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tokenPercent = stats.tokensBudget > 0
    ? Math.round((stats.tokensUsed / stats.tokensBudget) * 100)
    : 0;
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const toggleKnowledge = async (id: string, currentActive: boolean) => {
    setKnowledge(prev => prev.map(k => k.id === id ? { ...k, isActive: !currentActive } : k));
    await fetch('/api/knowledge', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !currentActive }),
    });
  };

  if (loading) {
    return (
      <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '1rem' }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>جاري تحميل البيانات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>لوحة تحكم المنظمة</h1>
          <div className={styles.headerSub}>إدارة الموظفين، المعرفة، والذاكرة</div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn}><Settings size={14} /> الإعدادات</button>
          <button className={styles.headerBtnPrimary}><UserPlus size={14} /> دعوة عضو</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الموظفون النشطون</span>
            <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}><Users size={18} /></div>
          </div>
          <div className={styles.statValue}>{stats.totalAgents}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}><TrendingUp size={12} /> موظف ذكاء اصطناعي</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>المهام المنجزة</span>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className={styles.statValue}>{stats.completedTasks}/{stats.totalTasks}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}><TrendingUp size={12} /> {completionRate}% معدل الإنجاز</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الميزانية الشهرية</span>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24' }}><Wallet size={18} /></div>
          </div>
          <div className={styles.statValue}>{stats.monthlyBudget} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>ر.س</span></div>
          <div className={`${styles.statChange} ${styles.statDown}`}><TrendingDown size={12} /> رواتب {stats.totalAgents} موظفين</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>ذاكرة الوكلاء</span>
            <div className={styles.statIcon} style={{ background: 'rgba(236,72,153,0.1)', color: '#F472B6' }}><Brain size={18} /></div>
          </div>
          <div className={styles.statValue}>{stats.memoryCount}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}><Sparkles size={12} /> {stats.knowledgeCount} عنصر معرفة</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>

        {/* Token Usage */}
        <div className={styles.card} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Zap size={15} /> استهلاك التوكنات</div>
            <span className={styles.cardBadge}>{tokenPercent}%</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.usageContainer}>
              <div className={styles.usageHeader}>
                <span className={styles.usageTitle}>الاستخدام الحالي</span>
                <span className={styles.usageValue}>{stats.tokensUsed.toLocaleString()} / {stats.tokensBudget.toLocaleString()}</span>
              </div>
              <div className={styles.usageBarBg}>
                <div className={`${styles.usageBarFill} ${tokenPercent > 85 ? styles.usageBarWarn : ''}`} style={{ width: `${tokenPercent}%` }} />
              </div>
              <div className={styles.usageFooter}>
                <span>الحد الأقصى للتجاوز: 10%</span>
                <span>المتبقي: {(stats.tokensBudget - stats.tokensUsed).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className={styles.card} style={{ animationDelay: '0.15s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Building2 size={15} /> معلومات المنظمة</div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tenantInfo}>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Building2 size={13} /> الاسم</span>
                <span className={styles.tenantValue}>{tenant?.name || '—'}</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Globe size={13} /> المجال</span>
                <span className={styles.tenantValue}>{tenant?.industry || 'غير محدد'}</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Users size={13} /> الأعضاء</span>
                <span className={styles.tenantValue}>{tenant?.members?.length || 1} أعضاء</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Crown size={13} /> الباقة</span>
                <span className={styles.tenantValue} style={{ color: '#F59E0B' }}>{tenant?.subscription?.tier || 'FREE'}</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Shield size={13} /> الدور</span>
                <span className={styles.tenantValue}>مالك</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Providers */}
        <div className={styles.card} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Database size={15} /> مزودي الذكاء الاصطناعي</div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tenantInfo}>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Sparkles size={13} /> Claude (Anthropic)</span>
                <span className={styles.tenantValue} style={{ color: '#10B981' }}>متصل</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Zap size={13} /> GPT (OpenAI)</span>
                <span className={styles.tenantValue} style={{ color: '#10B981' }}>متصل</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><BarChart3 size={13} /> النموذج الافتراضي</span>
                <span className={styles.tenantValue}>Claude Sonnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hired Agents (Wide) */}
        <div className={`${styles.card} ${styles.cardWide}`} style={{ animationDelay: '0.25s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Users size={15} /> الموظفون الحاليون</div>
            <span className={styles.cardBadge}>{agents.length} نشط</span>
          </div>
          {agents.length > 0 ? (
            <div className={styles.agentList}>
              {agents.map(agent => (
                <div key={agent.agentId} className={styles.agentItem}>
                  <div className={styles.agentAvatar} style={{ background: `${agent.color}15`, color: agent.color }}>
                    {AGENT_ICONS[agent.nameAr] || <BriefcaseBusiness size={16} />}
                  </div>
                  <div className={styles.agentInfo}>
                    <div className={styles.agentName}>{agent.nameAr}</div>
                    <div className={styles.agentRole}>{agent.roleAr} {agent.provider === 'claude' ? '(Claude)' : '(GPT)'}</div>
                  </div>
                  <div className={styles.agentMeta}>
                    <div className={styles.agentSalary}>{agent.salary} ر.س</div>
                    <span className={`${styles.agentStatus} ${agent.status === 'IDLE' ? styles.statusIdle : styles.statusWorking}`}>
                      {agent.status === 'IDLE' ? 'متاح' : 'يعمل'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCard}><div className={styles.emptyIcon}><Users size={28} /></div><div className={styles.emptyText}>لم يتم توظيف أي موظف بعد</div></div>
          )}
          <div className={styles.cardFooter}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                إجمالي الرواتب: {agents.reduce((s, a) => s + a.salary, 0)} ر.س/شهرياً
              </span>
              <button className={styles.headerBtn} style={{ padding: '4px 12px', fontSize: '0.72rem' }}>
                <Plus size={12} /> توظيف جديد
              </button>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className={styles.card} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><BookOpen size={15} /> قاعدة المعرفة</div>
            <span className={styles.cardBadge}>{knowledge.filter(k => k.isActive).length} نشط</span>
          </div>
          {knowledge.length > 0 ? (
            <div className={styles.knowledgeList}>
              {knowledge.map(item => {
                const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.brand;
                return (
                  <div key={item.id} className={styles.knowledgeItem}>
                    <div className={styles.knowledgeIcon} style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                    <div className={styles.knowledgeInfo}>
                      <div className={styles.knowledgeTitle} style={{ opacity: item.isActive ? 1 : 0.5 }}>{item.title}</div>
                      <div className={styles.knowledgeCat}>{cat.label}</div>
                    </div>
                    <button
                      onClick={() => toggleKnowledge(item.id, item.isActive)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.isActive ? '#10B981' : 'var(--text-muted)' }}
                    >
                      {item.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyCard}><div className={styles.emptyIcon}><BookOpen size={28} /></div><div className={styles.emptyText}>أضف معلومات عن شركتك لتحسين أداء الوكلاء</div></div>
          )}
          <div className={styles.cardFooter}>
            <button className={styles.headerBtn} style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.72rem' }}>
              <Plus size={12} /> إضافة معرفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
