'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Users, Wallet, Brain, Database, Building2, TrendingUp,
  BriefcaseBusiness, Crown, Shield, UserPlus, Settings,
  Sparkles, Zap, CheckCircle2, Plus, Globe, Loader2,
  Languages, LayoutDashboard, FileKey, Bell, Palette,
  Save, Trash2, Lock, Eye, EyeOff, LogOut, Mail, User,
  ToggleLeft, ToggleRight, Monitor, Smartphone, ArrowRight,
  BookOpen, Package, Target, FileText, PenTool, Microscope,
  Megaphone, LineChart, BarChart3
} from 'lucide-react';
import styles from './admin.module.css';

// ─── Types ────────────────────────────────────────────────
type SettingsTab = 'overview' | 'profile' | 'language' | 'users' | 'layout' | 'license' | 'notifications' | 'ai';

interface TenantData {
  name: string;
  industry: string | null;
  slug: string;
  _count: { hiredAgents: number; tasks: number; knowledge: number };
  subscription: { tier: string } | null;
  members: { id: string; name: string | null; email: string; role: string }[];
}

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard size={16} /> },
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={16} /> },
  { id: 'language', label: 'اللغة', icon: <Languages size={16} /> },
  { id: 'users', label: 'المستخدمون', icon: <Users size={16} /> },
  { id: 'layout', label: 'تخصيص الواجهة', icon: <Palette size={16} /> },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell size={16} /> },
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: <Brain size={16} /> },
  { id: 'license', label: 'الترخيص والباقة', icon: <FileKey size={16} /> },
];

// ─── Component ────────────────────────────────────────────
export default function AdminDashboardClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [agents, setAgents] = useState<{ agentId: string; nameAr: string; roleAr: string; color: string; salary: number; status: string }[]>([]);
  const [stats, setStats] = useState({ totalAgents: 0, totalTasks: 0, completedTasks: 0, monthlyBudget: 0, tokensUsed: 0, tokensBudget: 10000, memoryCount: 0, knowledgeCount: 0 });

  // Settings state
  const [profileForm, setProfileForm] = useState({ name: '', email: '', company: '', industry: '' });
  const [language, setLanguage] = useState('ar');
  const [layoutPrefs, setLayoutPrefs] = useState({ theme: 'dark', sidebarPosition: 'right', compactMode: false, show3D: true, showActivity: true });
  const [notifPrefs, setNotifPrefs] = useState({ taskComplete: true, newMessage: true, budgetWarning: true, weeklyReport: false, emailNotifs: false });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const [billingRes, tenantRes] = await Promise.all([
          fetch('/api/billing'),
          fetch('/api/tenants'),
        ]);
        if (billingRes.ok) {
          const d = await billingRes.json();
          setStats(d.stats || stats);
          setAgents(d.payroll || []);
        }
        if (tenantRes.ok) {
          const d = await tenantRes.json();
          setTenant(d.tenant);
          if (d.tenant) {
            setProfileForm({
              name: session?.user?.name || '',
              email: session?.user?.email || '',
              company: d.tenant.name || '',
              industry: d.tenant.industry || '',
            });
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    loadData();
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save (persist to localStorage for layout/notif prefs)
    localStorage.setItem('collab_layout', JSON.stringify(layoutPrefs));
    localStorage.setItem('collab_notifs', JSON.stringify(notifPrefs));
    localStorage.setItem('collab_lang', language);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    // Load saved prefs from localStorage
    const savedLayout = localStorage.getItem('collab_layout');
    const savedNotifs = localStorage.getItem('collab_notifs');
    const savedLang = localStorage.getItem('collab_lang');
    if (savedLayout) try { setLayoutPrefs(JSON.parse(savedLayout)); } catch {}
    if (savedNotifs) try { setNotifPrefs(JSON.parse(savedNotifs)); } catch {}
    if (savedLang) setLanguage(savedLang);
  }, []);

  if (loading) {
    return (
      <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#818CF8', marginBottom: '1rem' }} />
          <div style={{ color: '#64748B', fontSize: '0.85rem' }}>جاري تحميل الإعدادات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}><Settings size={22} style={{ verticalAlign: 'middle', marginInlineEnd: 8 }} />الإعدادات</h1>
          <div className={styles.headerSub}>إدارة حسابك، تفضيلاتك، وإعدادات المنظمة</div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className={styles.spinning} /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>

        {/* ═══ Overview ═══ */}
        {activeTab === 'overview' && (
          <div className={styles.settingsGrid}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>الموظفون</span>
                  <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}><Users size={18} /></div>
                </div>
                <div className={styles.statValue}>{stats.totalAgents}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>المهام</span>
                  <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}><CheckCircle2 size={18} /></div>
                </div>
                <div className={styles.statValue}>{stats.completedTasks}/{stats.totalTasks}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>الميزانية</span>
                  <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24' }}><Wallet size={18} /></div>
                </div>
                <div className={styles.statValue}>{stats.monthlyBudget} <span style={{ fontSize: '0.7rem' }}>ر.س</span></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>الذاكرة</span>
                  <div className={styles.statIcon} style={{ background: 'rgba(236,72,153,0.1)', color: '#F472B6' }}><Brain size={18} /></div>
                </div>
                <div className={styles.statValue}>{stats.memoryCount}</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Building2 size={15} /> معلومات المنظمة</div></div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الاسم</span><span className={styles.infoValue}>{tenant?.name || '—'}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>المجال</span><span className={styles.infoValue}>{tenant?.industry || 'غير محدد'}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الأعضاء</span><span className={styles.infoValue}>{tenant?.members?.length || 1}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الباقة</span><span className={styles.infoValue} style={{ color: '#F59E0B' }}>{tenant?.subscription?.tier || 'FREE'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Profile ═══ */}
        {activeTab === 'profile' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><User size={15} /> المعلومات الشخصية</div></div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><User size={13} /> الاسم الكامل</label>
                    <input className={styles.formInput} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="اسمك" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><Mail size={13} /> البريد الإلكتروني</label>
                    <input className={styles.formInput} value={profileForm.email} disabled style={{ opacity: 0.6 }} />
                    <span className={styles.formHint}>البريد لا يمكن تغييره</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><Building2 size={13} /> اسم الشركة</label>
                    <input className={styles.formInput} value={profileForm.company} onChange={e => setProfileForm({...profileForm, company: e.target.value})} placeholder="اسم شركتك" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}><Globe size={13} /> مجال العمل</label>
                    <select className={styles.formInput} value={profileForm.industry} onChange={e => setProfileForm({...profileForm, industry: e.target.value})}>
                      <option value="">اختر المجال</option>
                      <option value="تسويق">تسويق ودعاية</option>
                      <option value="تقنية">تقنية وبرمجيات</option>
                      <option value="تجارة">تجارة إلكترونية</option>
                      <option value="تعليم">تعليم وتدريب</option>
                      <option value="صحة">صحة وطب</option>
                      <option value="عقارات">عقارات</option>
                      <option value="مطاعم">مطاعم وضيافة</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Lock size={15} /> تغيير كلمة المرور</div></div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>كلمة المرور الحالية</label>
                    <div className={styles.inputWithIcon}>
                      <input className={styles.formInput} type={showPassword ? 'text' : 'password'} value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} placeholder="••••••••" />
                      <button className={styles.inputIcon} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>كلمة المرور الجديدة</label>
                    <input className={styles.formInput} type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="6 أحرف على الأقل" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>تأكيد كلمة المرور</label>
                    <input className={styles.formInput} type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="أعد كتابة كلمة المرور" />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card} style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
              <div className={styles.cardHeader}><div className={styles.cardTitle} style={{ color: '#F43F5E' }}><Trash2 size={15} /> منطقة الخطر</div></div>
              <div className={styles.cardBody}>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>تسجيل الخروج من حسابك. بياناتك ستبقى محفوظة.</p>
                <button className={styles.dangerBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut size={14} /> تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Language ═══ */}
        {activeTab === 'language' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Languages size={15} /> لغة الواجهة</div></div>
              <div className={styles.cardBody}>
                <div className={styles.radioGroup}>
                  {[
                    { value: 'ar', label: 'العربية', desc: 'واجهة كاملة باللغة العربية (RTL)', flag: '🇸🇦' },
                    { value: 'en', label: 'English', desc: 'Full English interface (LTR)', flag: '🇺🇸' },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.radioCard} ${language === opt.value ? styles.radioCardActive : ''}`}>
                      <input type="radio" name="lang" value={opt.value} checked={language === opt.value} onChange={() => setLanguage(opt.value)} className={styles.radioHidden} />
                      <div className={styles.radioContent}>
                        <span style={{ fontSize: '1.5rem' }}>{opt.flag}</span>
                        <div>
                          <div className={styles.radioLabel}>{opt.label}</div>
                          <div className={styles.radioDesc}>{opt.desc}</div>
                        </div>
                      </div>
                      <div className={`${styles.radioCheck} ${language === opt.value ? styles.radioCheckActive : ''}`}>
                        {language === opt.value && <CheckCircle2 size={16} />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Globe size={15} /> لغة ردود الوكلاء</div></div>
              <div className={styles.cardBody}>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>الوكلاء يردون باللغة العربية افتراضياً. يمكنك الكتابة بأي لغة وسيرد الوكيل بنفس اللغة.</p>
                <div className={styles.infoRow}><span className={styles.infoLabel}>اللغة الافتراضية</span><span className={styles.infoValue}>العربية (سعودي)</span></div>
                <div className={styles.infoRow}><span className={styles.infoLabel}>اللغات المدعومة</span><span className={styles.infoValue}>العربية، الإنجليزية، +50 لغة</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Users ═══ */}
        {activeTab === 'users' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}><Users size={15} /> أعضاء الفريق</div>
                <button className={styles.headerBtnPrimary} style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                  <UserPlus size={13} /> دعوة عضو
                </button>
              </div>
              <div className={styles.cardBody}>
                {(tenant?.members || []).length > 0 ? (
                  <div className={styles.userList}>
                    {(tenant?.members || []).map(member => (
                      <div key={member.id} className={styles.userItem}>
                        <div className={styles.userAvatar}>
                          {(member.name || member.email)[0].toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{member.name || member.email.split('@')[0]}</div>
                          <div className={styles.userEmail}>{member.email}</div>
                        </div>
                        <div className={styles.userRole}>
                          <span className={`${styles.roleBadge} ${member.role === 'ADMIN' ? styles.roleAdmin : styles.roleMember}`}>
                            {member.role === 'ADMIN' ? 'مدير' : 'عضو'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.userList}>
                    <div className={styles.userItem}>
                      <div className={styles.userAvatar}>{(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}</div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{session?.user?.name || 'أنت'}</div>
                        <div className={styles.userEmail}>{session?.user?.email}</div>
                      </div>
                      <div className={styles.userRole}>
                        <span className={`${styles.roleBadge} ${styles.roleAdmin}`}>مالك</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Shield size={15} /> الأدوار والصلاحيات</div></div>
              <div className={styles.cardBody}>
                <div className={styles.roleGrid}>
                  {[
                    { role: 'مالك', desc: 'وصول كامل + إدارة الفواتير والمستخدمين', color: '#F59E0B' },
                    { role: 'مدير', desc: 'إدارة الموظفين والمهام والمعرفة', color: '#818CF8' },
                    { role: 'عضو', desc: 'إنشاء مهام والتحدث مع الموظفين', color: '#34D399' },
                    { role: 'مشاهد', desc: 'عرض فقط بدون تعديل', color: '#64748B' },
                  ].map(r => (
                    <div key={r.role} className={styles.roleItem}>
                      <div className={styles.roleDot} style={{ background: r.color }}></div>
                      <div>
                        <div className={styles.roleTitle}>{r.role}</div>
                        <div className={styles.roleDesc}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Layout ═══ */}
        {activeTab === 'layout' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Palette size={15} /> المظهر</div></div>
              <div className={styles.cardBody}>
                <div className={styles.radioGroup}>
                  {[
                    { value: 'dark', label: 'الوضع الداكن', desc: 'مظهر داكن مريح للعين', icon: '🌙' },
                    { value: 'light', label: 'الوضع الفاتح', desc: 'مظهر فاتح كلاسيكي (قريباً)', icon: '☀️' },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.radioCard} ${layoutPrefs.theme === opt.value ? styles.radioCardActive : ''}`}>
                      <input type="radio" name="theme" value={opt.value} checked={layoutPrefs.theme === opt.value} onChange={() => setLayoutPrefs({...layoutPrefs, theme: opt.value})} className={styles.radioHidden} disabled={opt.value === 'light'} />
                      <div className={styles.radioContent}>
                        <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                        <div>
                          <div className={styles.radioLabel}>{opt.label}</div>
                          <div className={styles.radioDesc}>{opt.desc}</div>
                        </div>
                      </div>
                      {layoutPrefs.theme === opt.value && <div className={styles.radioCheckActive}><CheckCircle2 size={16} /></div>}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><LayoutDashboard size={15} /> عناصر لوحة التحكم</div></div>
              <div className={styles.cardBody}>
                <div className={styles.toggleList}>
                  {[
                    { key: 'show3D', label: 'المكتب ثلاثي الأبعاد', desc: 'عرض المكتب الافتراضي على لوحة التحكم', icon: <Monitor size={16} /> },
                    { key: 'showActivity', label: 'سجل النشاطات', desc: 'عرض آخر النشاطات في لوحة التحكم', icon: <BarChart3 size={16} /> },
                    { key: 'compactMode', label: 'الوضع المضغوط', desc: 'تقليل المسافات لعرض محتوى أكثر', icon: <Smartphone size={16} /> },
                  ].map(toggle => (
                    <div key={toggle.key} className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleIcon}>{toggle.icon}</span>
                        <div>
                          <div className={styles.toggleLabel}>{toggle.label}</div>
                          <div className={styles.toggleDesc}>{toggle.desc}</div>
                        </div>
                      </div>
                      <button
                        className={styles.toggleBtn}
                        onClick={() => setLayoutPrefs({...layoutPrefs, [toggle.key]: !layoutPrefs[toggle.key as keyof typeof layoutPrefs]})}
                      >
                        {layoutPrefs[toggle.key as keyof typeof layoutPrefs] ? <ToggleRight size={24} style={{ color: '#10B981' }} /> : <ToggleLeft size={24} style={{ color: '#475569' }} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Globe size={15} /> اتجاه الشريط الجانبي</div></div>
              <div className={styles.cardBody}>
                <div className={styles.radioGroup} style={{ flexDirection: 'row', gap: '0.75rem' }}>
                  {[
                    { value: 'right', label: 'يمين (RTL)', icon: <ArrowRight size={16} style={{ transform: 'scaleX(-1)' }} /> },
                    { value: 'left', label: 'يسار (LTR)', icon: <ArrowRight size={16} /> },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.radioCard} ${layoutPrefs.sidebarPosition === opt.value ? styles.radioCardActive : ''}`} style={{ flex: 1 }}>
                      <input type="radio" name="sidebar" value={opt.value} checked={layoutPrefs.sidebarPosition === opt.value} onChange={() => setLayoutPrefs({...layoutPrefs, sidebarPosition: opt.value})} className={styles.radioHidden} />
                      <div className={styles.radioContent}>{opt.icon}<span className={styles.radioLabel}>{opt.label}</span></div>
                      {layoutPrefs.sidebarPosition === opt.value && <div className={styles.radioCheckActive}><CheckCircle2 size={14} /></div>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Notifications ═══ */}
        {activeTab === 'notifications' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Bell size={15} /> إشعارات التطبيق</div></div>
              <div className={styles.cardBody}>
                <div className={styles.toggleList}>
                  {[
                    { key: 'taskComplete', label: 'إنجاز المهام', desc: 'إشعار عند إنجاز موظف لمهمة' },
                    { key: 'newMessage', label: 'رسائل جديدة', desc: 'إشعار عند استلام رسالة من موظف' },
                    { key: 'budgetWarning', label: 'تحذير الميزانية', desc: 'إشعار عند تجاوز 80% من الميزانية' },
                    { key: 'weeklyReport', label: 'تقرير أسبوعي', desc: 'ملخص أسبوعي لأداء الفريق' },
                  ].map(toggle => (
                    <div key={toggle.key} className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <div>
                          <div className={styles.toggleLabel}>{toggle.label}</div>
                          <div className={styles.toggleDesc}>{toggle.desc}</div>
                        </div>
                      </div>
                      <button
                        className={styles.toggleBtn}
                        onClick={() => setNotifPrefs({...notifPrefs, [toggle.key]: !notifPrefs[toggle.key as keyof typeof notifPrefs]})}
                      >
                        {notifPrefs[toggle.key as keyof typeof notifPrefs] ? <ToggleRight size={24} style={{ color: '#10B981' }} /> : <ToggleLeft size={24} style={{ color: '#475569' }} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Mail size={15} /> إشعارات البريد</div></div>
              <div className={styles.cardBody}>
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <div>
                      <div className={styles.toggleLabel}>الإشعارات بالبريد</div>
                      <div className={styles.toggleDesc}>استلام نسخة من الإشعارات على بريدك الإلكتروني</div>
                    </div>
                  </div>
                  <button className={styles.toggleBtn} onClick={() => setNotifPrefs({...notifPrefs, emailNotifs: !notifPrefs.emailNotifs})}>
                    {notifPrefs.emailNotifs ? <ToggleRight size={24} style={{ color: '#10B981' }} /> : <ToggleLeft size={24} style={{ color: '#475569' }} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ AI Providers ═══ */}
        {activeTab === 'ai' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Sparkles size={15} /> مزودي الذكاء الاصطناعي</div></div>
              <div className={styles.cardBody}>
                <div className={styles.providerList}>
                  {[
                    { name: 'Google Gemini', model: 'Gemini 2.0 Flash', status: !!process.env.NEXT_PUBLIC_GEMINI_KEY || true, color: '#4285F4', role: 'أساسي' },
                    { name: 'Groq (Llama 3.3)', model: 'Llama 3.3 70B', status: true, color: '#F97316', role: 'احتياطي' },
                  ].map(p => (
                    <div key={p.name} className={styles.providerItem}>
                      <div className={styles.providerDot} style={{ background: p.color }}></div>
                      <div className={styles.providerInfo}>
                        <div className={styles.providerName}>{p.name}</div>
                        <div className={styles.providerModel}>{p.model}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={styles.providerRole}>{p.role}</span>
                        <span className={styles.providerStatus} style={{ color: p.status ? '#10B981' : '#EF4444' }}>
                          {p.status ? '● متصل' : '● غير متصل'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Brain size={15} /> ذاكرة الوكلاء</div></div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>ذكريات محفوظة</span><span className={styles.infoValue}>{stats.memoryCount}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>عناصر المعرفة</span><span className={styles.infoValue}>{stats.knowledgeCount}</span></div>
                  <div className={styles.infoRow}><span className={styles.infoLabel}>الحد الأقصى / طلب</span><span className={styles.infoValue}>10 ذكريات</span></div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '1rem' }}>الوكلاء يتعلمون تلقائياً من محادثاتك ويحفظون المعلومات المهمة عن مشروعك.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ License ═══ */}
        {activeTab === 'license' && (
          <div className={styles.settingsGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}><Crown size={15} /> الباقة الحالية</div>
                <span className={styles.licenseBadge}>{tenant?.subscription?.tier || 'FREE'}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.licenseInfo}>
                  <div className={styles.licensePlan}>
                    <div className={styles.licensePlanName}>{tenant?.subscription?.tier === 'GROWTH' ? 'الباقة المتقدمة' : tenant?.subscription?.tier === 'ENTERPRISE' ? 'الباقة الاحترافية' : 'الباقة المجانية'}</div>
                    <div className={styles.licensePlanPrice}>
                      {tenant?.subscription?.tier === 'GROWTH' ? '199' : tenant?.subscription?.tier === 'ENTERPRISE' ? '649' : '0'}
                      <span> ر.س/شهرياً</span>
                    </div>
                  </div>
                  <div className={styles.licenseFeatures}>
                    {[
                      { label: 'عدد الموظفين', value: 'غير محدود' },
                      { label: 'التوكنات', value: tenant?.subscription?.tier === 'GROWTH' ? '500,000' : tenant?.subscription?.tier === 'ENTERPRISE' ? '2,000,000' : '10,000' },
                      { label: 'الذاكرة', value: 'مفعّلة' },
                      { label: 'الدعم', value: tenant?.subscription?.tier === 'ENTERPRISE' ? 'مخصص' : 'مجتمعي' },
                    ].map(f => (
                      <div key={f.label} className={styles.licenseRow}>
                        <span className={styles.licenseLabel}><CheckCircle2 size={13} style={{ color: '#10B981' }} /> {f.label}</span>
                        <span className={styles.licenseValue}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}><div className={styles.cardTitle}><Package size={15} /> ترقية الباقة</div></div>
              <div className={styles.cardBody}>
                <div className={styles.upgradeGrid}>
                  {[
                    { tier: 'STARTER', name: 'المبتدئ', price: '49', tokens: '100K', color: '#3B82F6' },
                    { tier: 'GROWTH', name: 'المتقدم', price: '199', tokens: '500K', color: '#8B5CF6', popular: true },
                    { tier: 'ENTERPRISE', name: 'الاحترافي', price: '649', tokens: '2M', color: '#F59E0B' },
                  ].map(plan => (
                    <div key={plan.tier} className={`${styles.planCard} ${plan.popular ? styles.planPopular : ''}`}>
                      {plan.popular && <div className={styles.planBadge}>الأكثر طلباً</div>}
                      <div className={styles.planName} style={{ color: plan.color }}>{plan.name}</div>
                      <div className={styles.planPrice}>{plan.price} <span>ر.س</span></div>
                      <div className={styles.planTokens}>{plan.tokens} توكن/شهر</div>
                      <button className={styles.planBtn} style={{ borderColor: plan.color, color: plan.color }}>
                        {tenant?.subscription?.tier === plan.tier ? 'الباقة الحالية' : 'ترقية'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
