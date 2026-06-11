'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Building2, Users, CreditCard, Search,
  Loader2, X, Crown, TrendingUp, CheckCircle2, Wallet,
  Shield, ChevronLeft, ChevronRight
} from 'lucide-react';
import styles from './superadmin.module.css';

type Tab = 'dashboard' | 'tenants' | 'users' | 'plans';

interface Stats {
  totals: { totalTenants: number; totalUsers: number; totalTasks: number; completedTasks: number };
  growth: { newTenantsWeek: number; newTenantsMonth: number; newUsersWeek: number; newUsersMonth: number };
  plans: Record<string, number>;
  revenue: { monthly: number };
  tokens: { used: number; budget: number };
  recentTenants: { id: string; name: string; slug: string; createdAt: string; subscription: { tier: string } | null; _count: { members: number; hiredAgents: number } }[];
}

interface TenantRow {
  id: string; name: string; slug: string; industry: string | null; createdAt: string;
  subscription: { tier: string; monthlyBudget: number; tokensUsed: number; tokensBudget: number } | null;
  _count: { members: number; hiredAgents: number; tasks: number; knowledge: number };
}

interface UserRow {
  id: string; name: string | null; email: string; role: string;
  isSuperAdmin: boolean; createdAt: string;
  tenant: { id: string; name: string; slug: string } | null;
}

interface TenantDetail {
  tenant: {
    id: string; name: string; slug: string; industry: string | null; createdAt: string;
    members: { id: string; name: string | null; email: string; role: string; createdAt: string; isSuperAdmin: boolean }[];
    subscription: { tier: string; monthlyBudget: number; tokensUsed: number; tokensBudget: number } | null;
    hiredAgents: { agent: { nameAr: string; roleAr: string; salary: number; color: string } }[];
    _count: { tasks: number; knowledge: number; memories: number; documents: number };
  };
  taskStats: { total: number; completed: number; failed: number };
}

const PLAN_COLORS: Record<string, string> = {
  FREE: '#64748B', STARTER: '#3B82F6', GROWTH: '#8B5CF6', ENTERPRISE: '#F59E0B',
};
const PLAN_NAMES: Record<string, string> = {
  FREE: 'مجاني', STARTER: 'مبتدئ', GROWTH: 'متقدم', ENTERPRISE: 'احترافي',
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={16} /> },
  { id: 'tenants', label: 'المنظمات', icon: <Building2 size={16} /> },
  { id: 'users', label: 'المستخدمون', icon: <Users size={16} /> },
  { id: 'plans', label: 'الباقات', icon: <CreditCard size={16} /> },
];

export default function SuperAdminClient() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  // Tenants
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantTier, setTenantTier] = useState('');
  const [tenantPage, setTenantPage] = useState(1);
  const [tenantTotal, setTenantTotal] = useState(0);
  const [tenantPages, setTenantPages] = useState(1);

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userPages, setUserPages] = useState(1);

  // Detail drawer
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load stats
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/superadmin/stats');
        if (res.ok) setStats(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  // Load tenants
  const loadTenants = useCallback(async () => {
    const params = new URLSearchParams();
    if (tenantSearch) params.set('search', tenantSearch);
    if (tenantTier) params.set('tier', tenantTier);
    params.set('page', String(tenantPage));
    const res = await fetch(`/api/superadmin/tenants?${params}`);
    if (res.ok) {
      const d = await res.json();
      setTenants(d.tenants);
      setTenantTotal(d.pagination.total);
      setTenantPages(d.pagination.totalPages);
    }
  }, [tenantSearch, tenantTier, tenantPage]);

  useEffect(() => { if (tab === 'tenants') loadTenants(); }, [tab, loadTenants]);

  // Load users
  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (userSearch) params.set('search', userSearch);
    params.set('page', String(userPage));
    const res = await fetch(`/api/superadmin/users?${params}`);
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users);
      setUserTotal(d.pagination.total);
      setUserPages(d.pagination.totalPages);
    }
  }, [userSearch, userPage]);

  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  // Open tenant detail
  const openDetail = async (id: string) => {
    setDetailLoading(true);
    const res = await fetch(`/api/superadmin/tenants/${id}`);
    if (res.ok) setDetail(await res.json());
    setDetailLoading(false);
  };

  // Change tenant plan
  const changePlan = async (tenantId: string, tier: string) => {
    await fetch(`/api/superadmin/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    openDetail(tenantId);
    loadTenants();
    // Refresh stats
    const res = await fetch('/api/superadmin/stats');
    if (res.ok) setStats(await res.json());
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className={styles.spinner} style={{ color: '#F59E0B' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}><Shield size={22} /> لوحة التحكم الرئيسية</h1>
          <div className={styles.headerSub}>إدارة جميع المنظمات، المستخدمين، والاشتراكات</div>
        </div>
        <span className={styles.headerBadge}>SUPER ADMIN</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`} onClick={() => setTab(t.id)}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ Dashboard ═══ */}
      {tab === 'dashboard' && stats && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>المنظمات</span>
                <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}><Building2 size={18} /></div>
              </div>
              <div className={styles.statValue}>{stats.totals.totalTenants}</div>
              <div className={styles.statMeta}>+{stats.growth.newTenantsWeek} هذا الأسبوع</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>المستخدمون</span>
                <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}><Users size={18} /></div>
              </div>
              <div className={styles.statValue}>{stats.totals.totalUsers}</div>
              <div className={styles.statMeta}>+{stats.growth.newUsersWeek} هذا الأسبوع</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>المهام</span>
                <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA' }}><CheckCircle2 size={18} /></div>
              </div>
              <div className={styles.statValue}>{stats.totals.completedTasks}<span style={{ fontSize: '0.9rem', color: '#64748B' }}>/{stats.totals.totalTasks}</span></div>
              <div className={styles.statMeta}>مكتملة / إجمالي</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>الإيرادات الشهرية</span>
                <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24' }}><Wallet size={18} /></div>
              </div>
              <div className={styles.statValue}>{stats.revenue.monthly} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>ر.س</span></div>
              <div className={styles.statMeta}>من الاشتراكات النشطة</div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}><Crown size={15} /> توزيع الباقات</div></div>
            <div className={styles.cardBody}>
              <div className={styles.planBar}>
                {Object.entries(stats.plans).map(([tier, count]) => (
                  <div key={tier} className={styles.planSegment} style={{ width: `${stats.totals.totalTenants > 0 ? (count / stats.totals.totalTenants) * 100 : 0}%`, background: PLAN_COLORS[tier] }} />
                ))}
              </div>
              <div className={styles.planLegend}>
                {Object.entries(stats.plans).map(([tier, count]) => (
                  <div key={tier} className={styles.planLegendItem}>
                    <div className={styles.planDot} style={{ background: PLAN_COLORS[tier] }} />
                    {PLAN_NAMES[tier]} ({count})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Signups */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}><TrendingUp size={15} /> آخر التسجيلات</div></div>
            <div className={styles.cardBody} style={{ padding: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>المنظمة</th>
                    <th>الباقة</th>
                    <th>الأعضاء</th>
                    <th>الموظفون</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTenants.map(t => (
                    <tr key={t.id} onClick={() => { openDetail(t.id); setTab('tenants'); }}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td><span className={`${styles.tierBadge} ${styles[`tier${t.subscription?.tier || 'FREE'}`]}`}>{PLAN_NAMES[t.subscription?.tier || 'FREE']}</span></td>
                      <td>{t._count.members}</td>
                      <td>{t._count.hiredAgents}</td>
                      <td style={{ color: '#64748B' }}>{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ Tenants ═══ */}
      {tab === 'tenants' && (
        <>
          <div className={styles.searchBar}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className={styles.searchInput} style={{ paddingRight: 36 }} placeholder="بحث بالاسم، الرابط، أو البريد..." value={tenantSearch} onChange={e => { setTenantSearch(e.target.value); setTenantPage(1); }} />
            </div>
            <select className={styles.filterSelect} value={tenantTier} onChange={e => { setTenantTier(e.target.value); setTenantPage(1); }}>
              <option value="">كل الباقات</option>
              <option value="FREE">مجاني</option>
              <option value="STARTER">مبتدئ</option>
              <option value="GROWTH">متقدم</option>
              <option value="ENTERPRISE">احترافي</option>
            </select>
          </div>

          <div className={styles.card}>
            <div className={styles.cardBody} style={{ padding: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>المنظمة</th>
                    <th>الباقة</th>
                    <th>الأعضاء</th>
                    <th>الموظفون</th>
                    <th>المهام</th>
                    <th>التوكنات</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr><td colSpan={7} className={styles.empty}>لا توجد نتائج</td></tr>
                  ) : tenants.map(t => (
                    <tr key={t.id} onClick={() => openDetail(t.id)}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>{t.slug}</div>
                      </td>
                      <td><span className={`${styles.tierBadge} ${styles[`tier${t.subscription?.tier || 'FREE'}`]}`}>{PLAN_NAMES[t.subscription?.tier || 'FREE']}</span></td>
                      <td>{t._count.members}</td>
                      <td>{t._count.hiredAgents}</td>
                      <td>{t._count.tasks}</td>
                      <td>{t.subscription ? `${((t.subscription.tokensUsed / t.subscription.tokensBudget) * 100).toFixed(0)}%` : '—'}</td>
                      <td style={{ color: '#64748B' }}>{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {tenantPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={tenantPage <= 1} onClick={() => setTenantPage(p => p - 1)}><ChevronRight size={14} /></button>
              <span className={styles.pageInfo}>صفحة {tenantPage} من {tenantPages} ({tenantTotal} منظمة)</span>
              <button className={styles.pageBtn} disabled={tenantPage >= tenantPages} onClick={() => setTenantPage(p => p + 1)}><ChevronLeft size={14} /></button>
            </div>
          )}
        </>
      )}

      {/* ═══ Users ═══ */}
      {tab === 'users' && (
        <>
          <div className={styles.searchBar}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className={styles.searchInput} style={{ paddingRight: 36 }} placeholder="بحث بالاسم أو البريد..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardBody} style={{ padding: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>المستخدم</th>
                    <th>المنظمة</th>
                    <th>الدور</th>
                    <th>التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} className={styles.empty}>لا توجد نتائج</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} onClick={() => u.tenant && openDetail(u.tenant.id)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.isSuperAdmin && <Shield size={13} style={{ color: '#F59E0B' }} />}
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name || u.email.split('@')[0]}</div>
                            <div style={{ fontSize: '0.7rem', color: '#475569' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.tenant?.name || <span style={{ color: '#475569' }}>بدون منظمة</span>}</td>
                      <td><span style={{ fontSize: '0.7rem', color: u.role === 'OWNER' ? '#F59E0B' : '#94A3B8' }}>{u.role === 'OWNER' ? 'مالك' : u.role === 'ADMIN' ? 'مدير' : 'عضو'}</span></td>
                      <td style={{ color: '#64748B' }}>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {userPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)}><ChevronRight size={14} /></button>
              <span className={styles.pageInfo}>صفحة {userPage} من {userPages} ({userTotal} مستخدم)</span>
              <button className={styles.pageBtn} disabled={userPage >= userPages} onClick={() => setUserPage(p => p + 1)}><ChevronLeft size={14} /></button>
            </div>
          )}
        </>
      )}

      {/* ═══ Plans ═══ */}
      {tab === 'plans' && stats && (
        <>
          <div className={styles.statsGrid}>
            {(['FREE', 'STARTER', 'GROWTH', 'ENTERPRISE'] as const).map(tier => (
              <div key={tier} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>{PLAN_NAMES[tier]}</span>
                  <div className={styles.statIcon} style={{ background: `${PLAN_COLORS[tier]}15`, color: PLAN_COLORS[tier] }}><Crown size={18} /></div>
                </div>
                <div className={styles.statValue}>{stats.plans[tier] || 0}</div>
                <div className={styles.statMeta}>منظمة</div>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}><Wallet size={15} /> ملخص الإيرادات</div></div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}><span className={styles.infoLabel}>الإيرادات الشهرية</span><span className={styles.infoValue}>{stats.revenue.monthly} ر.س</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>إجمالي التوكنات المخصصة</span><span className={styles.infoValue}>{(stats.tokens.budget / 1000).toFixed(0)}K</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>إجمالي التوكنات المستخدمة</span><span className={styles.infoValue}>{(stats.tokens.used / 1000).toFixed(0)}K</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>نسبة الاستخدام</span><span className={styles.infoValue}>{stats.tokens.budget > 0 ? ((stats.tokens.used / stats.tokens.budget) * 100).toFixed(1) : 0}%</span></div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className={styles.card}>
            <div className={styles.cardHeader}><div className={styles.cardTitle}><Crown size={15} /> توزيع الباقات</div></div>
            <div className={styles.cardBody}>
              <div className={styles.planBar}>
                {Object.entries(stats.plans).map(([tier, count]) => (
                  <div key={tier} className={styles.planSegment} style={{ width: `${stats.totals.totalTenants > 0 ? (count / stats.totals.totalTenants) * 100 : 0}%`, background: PLAN_COLORS[tier] }} />
                ))}
              </div>
              <div className={styles.planLegend}>
                {Object.entries(stats.plans).map(([tier, count]) => (
                  <div key={tier} className={styles.planLegendItem}>
                    <div className={styles.planDot} style={{ background: PLAN_COLORS[tier] }} />
                    {PLAN_NAMES[tier]} — {count} منظمة
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Tenant Detail Drawer ═══ */}
      {(detail || detailLoading) && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setDetail(null)} />
          <div className={styles.drawer}>
            {detailLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 size={28} className={styles.spinner} style={{ color: '#818CF8' }} />
              </div>
            ) : detail && (
              <>
                <div className={styles.drawerHeader}>
                  <div className={styles.drawerTitle}>{detail.tenant.name}</div>
                  <button className={styles.drawerClose} onClick={() => setDetail(null)}><X size={18} /></button>
                </div>

                {/* Info */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>معلومات عامة</div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الرابط</span><span className={styles.infoValue}>{detail.tenant.slug}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>المجال</span><span className={styles.infoValue}>{detail.tenant.industry || 'غير محدد'}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>التسجيل</span><span className={styles.infoValue}>{formatDate(detail.tenant.createdAt)}</span></div>
                </div>

                {/* Subscription */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>الاشتراك</div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>الباقة</span>
                    <select className={styles.planSelect} value={detail.tenant.subscription?.tier || 'FREE'} onChange={e => changePlan(detail.tenant.id, e.target.value)}>
                      <option value="FREE">مجاني</option>
                      <option value="STARTER">مبتدئ — 49 ر.س</option>
                      <option value="GROWTH">متقدم — 199 ر.س</option>
                      <option value="ENTERPRISE">احترافي — 649 ر.س</option>
                    </select>
                  </div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>التوكنات</span><span className={styles.infoValue}>{detail.tenant.subscription?.tokensUsed?.toLocaleString() || 0} / {detail.tenant.subscription?.tokensBudget?.toLocaleString() || '10,000'}</span></div>
                </div>

                {/* Stats */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>الإحصائيات</div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>المهام</span><span className={styles.infoValue}>{detail.taskStats.completed} مكتملة / {detail.taskStats.total} إجمالي</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الموظفون</span><span className={styles.infoValue}>{detail.tenant.hiredAgents.length}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>المعرفة</span><span className={styles.infoValue}>{detail.tenant._count.knowledge}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>المستندات</span><span className={styles.infoValue}>{detail.tenant._count.documents}</span></div>
                </div>

                {/* Members */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>الأعضاء ({detail.tenant.members.length})</div>
                  {detail.tenant.members.map(m => (
                    <div key={m.id} className={styles.memberItem}>
                      <div className={styles.memberAvatar}>{(m.name || m.email)[0].toUpperCase()}</div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{m.name || m.email.split('@')[0]} {m.isSuperAdmin && <Shield size={11} style={{ color: '#F59E0B' }} />}</div>
                        <div className={styles.memberEmail}>{m.email}</div>
                      </div>
                      <span className={styles.memberRole} style={{ background: m.role === 'OWNER' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: m.role === 'OWNER' ? '#FBBF24' : '#818CF8' }}>
                        {m.role === 'OWNER' ? 'مالك' : m.role === 'ADMIN' ? 'مدير' : 'عضو'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hired Agents */}
                {detail.tenant.hiredAgents.length > 0 && (
                  <div className={styles.drawerSection}>
                    <div className={styles.drawerSectionTitle}>الموظفون المعيّنون ({detail.tenant.hiredAgents.length})</div>
                    {detail.tenant.hiredAgents.map((ha, i) => (
                      <div key={i} className={styles.memberItem}>
                        <div className={styles.memberAvatar} style={{ background: `${ha.agent.color}20`, color: ha.agent.color }}>{ha.agent.nameAr[0]}</div>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberName}>{ha.agent.nameAr}</div>
                          <div className={styles.memberEmail}>{ha.agent.roleAr}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{ha.agent.salary} ر.س</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
