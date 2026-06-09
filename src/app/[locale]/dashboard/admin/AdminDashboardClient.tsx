'use client';

import { useState } from 'react';
import {
  Users, Wallet, Brain, Database, Building2, TrendingUp, TrendingDown,
  BriefcaseBusiness, PenTool, Microscope, Palette, Megaphone, LineChart,
  BookOpen, Target, Layers, Crown, Shield, UserPlus, Settings,
  FileText, Sparkles, Zap, Clock, CheckCircle2, BarChart3, Plus,
  Trash2, ToggleLeft, ToggleRight, Package, Globe
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

interface HiredAgentInfo {
  id: string;
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

interface MemoryItem {
  id: string;
  type: string;
  content: string;
  agentName: string;
  createdAt: string;
}

// ─── Demo Data ────────────────────────────────────────────
const DEMO_STATS: TenantStats = {
  totalAgents: 4,
  totalTasks: 47,
  completedTasks: 42,
  monthlyBudget: 646,
  tokensUsed: 73400,
  tokensBudget: 100000,
  memoryCount: 28,
  knowledgeCount: 6,
};

const DEMO_AGENTS: HiredAgentInfo[] = [
  { id: '1', nameAr: 'نورة', roleAr: 'استراتيجية المحتوى', color: '#8B5CF6', salary: 99, status: 'IDLE', provider: 'claude' },
  { id: '2', nameAr: 'فهد', roleAr: 'كاتب إعلانات', color: '#F59E0B', salary: 99, status: 'WORKING', provider: 'gpt' },
  { id: '3', nameAr: 'ريم', roleAr: 'محللة SEO', color: '#10B981', salary: 199, status: 'IDLE', provider: 'claude' },
  { id: '5', nameAr: 'لمى', roleAr: 'مخططة الحملات', color: '#06B6D4', salary: 349, status: 'IDLE', provider: 'gpt' },
];

const DEMO_KNOWLEDGE: KnowledgeItem[] = [
  { id: 'k1', category: 'brand', title: 'دليل الهوية البصرية', isActive: true },
  { id: 'k2', category: 'product', title: 'كتالوج المنتجات 2024', isActive: true },
  { id: 'k3', category: 'audience', title: 'شرائح الجمهور المستهدف', isActive: true },
  { id: 'k4', category: 'guidelines', title: 'سياسة المحتوى والنبرة', isActive: true },
  { id: 'k5', category: 'competitor', title: 'تحليل المنافسين', isActive: false },
  { id: 'k6', category: 'brand', title: 'قصة العلامة التجارية', isActive: true },
];

const DEMO_MEMORIES: MemoryItem[] = [
  { id: 'm1', type: 'task_summary', content: 'نفّذت تقويم محتوى لشهر يوليو — تركز على منتجات الصيف', agentName: 'نورة', createdAt: 'منذ ساعتين' },
  { id: 'm2', type: 'feedback', content: 'تقييم 5/5 — العميل راضٍ جداً عن جودة النصوص الإعلانية', agentName: 'فهد', createdAt: 'منذ 4 ساعات' },
  { id: 'm3', type: 'user_preference', content: 'العميل يفضل النبرة الرسمية مع لمسة ودية في الإعلانات', agentName: 'فهد', createdAt: 'منذ يوم' },
  { id: 'm4', type: 'learned_fact', content: 'أفضل أوقات النشر للجمهور السعودي: 8-10 مساءً بتوقيت الرياض', agentName: 'ريم', createdAt: 'منذ يومين' },
  { id: 'm5', type: 'task_summary', content: 'أنجزت تحليل SEO شامل — زيادة 40% في الزيارات العضوية متوقعة', agentName: 'ريم', createdAt: 'منذ 3 أيام' },
];

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

const MEMORY_COLORS: Record<string, string> = {
  task_summary: '#6366F1',
  feedback: '#F59E0B',
  user_preference: '#10B981',
  learned_fact: '#EC4899',
};

// ─── Component ────────────────────────────────────────────
export default function AdminDashboardClient() {
  const [stats] = useState(DEMO_STATS);
  const [agents] = useState(DEMO_AGENTS);
  const [knowledge, setKnowledge] = useState(DEMO_KNOWLEDGE);
  const [memories] = useState(DEMO_MEMORIES);

  const tokenPercent = Math.round((stats.tokensUsed / stats.tokensBudget) * 100);
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const toggleKnowledge = (id: string) => {
    setKnowledge(prev => prev.map(k =>
      k.id === id ? { ...k, isActive: !k.isActive } : k
    ));
  };

  return (
    <div className={styles.adminPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>لوحة تحكم المنظمة</h1>
          <div className={styles.headerSub}>إدارة الموظفين، المعرفة، والذاكرة</div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn}>
            <Settings size={14} /> الإعدادات
          </button>
          <button className={styles.headerBtnPrimary}>
            <UserPlus size={14} /> دعوة عضو
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الموظفون النشطون</span>
            <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
              <Users size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalAgents}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            <TrendingUp size={12} /> +2 هذا الشهر
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>المهام المنجزة</span>
            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.completedTasks}/{stats.totalTasks}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            <TrendingUp size={12} /> {completionRate}% معدل الإنجاز
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>الميزانية الشهرية</span>
            <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#FBBF24' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.monthlyBudget} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>ر.س</span></div>
          <div className={`${styles.statChange} ${styles.statDown}`}>
            <TrendingDown size={12} /> رواتب {stats.totalAgents} موظفين
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>ذاكرة الوكلاء</span>
            <div className={styles.statIcon} style={{ background: 'rgba(236,72,153,0.1)', color: '#F472B6' }}>
              <Brain size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.memoryCount}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            <Sparkles size={12} /> {stats.knowledgeCount} عنصر معرفة
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>

        {/* Token Usage Card */}
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
                <div
                  className={`${styles.usageBarFill} ${tokenPercent > 85 ? styles.usageBarWarn : ''}`}
                  style={{ width: `${tokenPercent}%` }}
                />
              </div>
              <div className={styles.usageFooter}>
                <span>الحد الأقصى للتجاوز: 10%</span>
                <span>المتبقي: {(stats.tokensBudget - stats.tokensUsed).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Info Card */}
        <div className={styles.card} style={{ animationDelay: '0.15s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Building2 size={15} /> معلومات المنظمة</div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tenantInfo}>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Building2 size={13} /> الاسم</span>
                <span className={styles.tenantValue}>شركة التقنية المتقدمة</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Globe size={13} /> المجال</span>
                <span className={styles.tenantValue}>تجارة إلكترونية</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Users size={13} /> الأعضاء</span>
                <span className={styles.tenantValue}>3 أعضاء</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Crown size={13} /> الباقة</span>
                <span className={styles.tenantValue} style={{ color: '#F59E0B' }}>GROWTH</span>
              </div>
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Shield size={13} /> الدور</span>
                <span className={styles.tenantValue}>مالك</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Providers Card */}
        <div className={styles.card} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Layers size={15} /> مزودي الذكاء الاصطناعي</div>
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
              <div className={styles.tenantRow}>
                <span className={styles.tenantLabel}><Database size={13} /> وضع تجريبي</span>
                <span className={styles.tenantValue} style={{ color: '#6366F1' }}>مُفعّل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hired Agents Card (Wide) */}
        <div className={`${styles.card} ${styles.cardWide}`} style={{ animationDelay: '0.25s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Users size={15} /> الموظفون الحاليون</div>
            <span className={styles.cardBadge}>{agents.length} نشط</span>
          </div>
          <div className={styles.agentList}>
            {agents.map(agent => (
              <div key={agent.id} className={styles.agentItem}>
                <div className={styles.agentAvatar} style={{ background: `${agent.color}15`, color: agent.color }}>
                  {AGENT_ICONS[agent.nameAr] || <BriefcaseBusiness size={16} />}
                </div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>{agent.nameAr}</div>
                  <div className={styles.agentRole}>{agent.roleAr} • {agent.provider === 'claude' ? 'Claude' : 'GPT'}</div>
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

        {/* Knowledge Base Card */}
        <div className={styles.card} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><BookOpen size={15} /> قاعدة المعرفة</div>
            <span className={styles.cardBadge}>{knowledge.filter(k => k.isActive).length} نشط</span>
          </div>
          <div className={styles.knowledgeList}>
            {knowledge.map(item => {
              const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.brand;
              return (
                <div key={item.id} className={styles.knowledgeItem}>
                  <div className={styles.knowledgeIcon} style={{ background: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className={styles.knowledgeInfo}>
                    <div className={styles.knowledgeTitle} style={{ opacity: item.isActive ? 1 : 0.5 }}>{item.title}</div>
                    <div className={styles.knowledgeCat}>{cat.label}</div>
                  </div>
                  <button
                    onClick={() => toggleKnowledge(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.isActive ? '#10B981' : 'var(--text-muted)' }}
                    title={item.isActive ? 'تعطيل' : 'تفعيل'}
                  >
                    {item.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                </div>
              );
            })}
          </div>
          <div className={styles.cardFooter}>
            <button className={styles.headerBtn} style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.72rem' }}>
              <Plus size={12} /> إضافة معرفة
            </button>
          </div>
        </div>

        {/* Agent Memory Timeline (Full Width) */}
        <div className={`${styles.card} ${styles.cardFull}`} style={{ animationDelay: '0.35s' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Brain size={15} /> ذاكرة الوكلاء الأخيرة</div>
            <span className={styles.cardBadge}>{memories.length} ذكرى</span>
          </div>
          <div className={styles.memoryList}>
            {memories.map(memory => (
              <div key={memory.id} className={styles.memoryItem}>
                <div
                  className={styles.memoryDot}
                  style={{ background: MEMORY_COLORS[memory.type] || '#6366F1' }}
                />
                <div className={styles.memoryContent}>
                  <div className={styles.memoryText}>
                    <strong>{memory.agentName}:</strong> {memory.content}
                  </div>
                  <div className={styles.memoryTime}>
                    <Clock size={10} style={{ display: 'inline', marginLeft: 4 }} /> {memory.createdAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
