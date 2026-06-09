'use client';

import { useState } from 'react';
import styles from './agents.module.css';

interface Skill {
  id: string;
  nameAr: string;
  icon: string;
}

interface Agent {
  id: string;
  nameAr: string;
  roleAr: string;
  avatar: string;
  color: string;
  personalityAr: string;
  departmentAr: string;
  tier: string;
  salary: number;
  skills: Skill[];
  isHired: boolean;
}

// Demo agents
const demoAgents: Agent[] = [
  {
    id: '1',
    nameAr: 'نورة',
    roleAr: 'استراتيجية المحتوى',
    avatar: '👩‍💼',
    color: '#8B5CF6',
    personalityAr: 'منظمة ودقيقة، تحب التخطيط المسبق وتؤمن بأن المحتوى الجيد يبدأ بخطة محكمة.',
    departmentAr: 'المحتوى',
    tier: 'STARTER',
    salary: 99,
    skills: [
      { id: 's1', nameAr: 'تقويم المحتوى', icon: '📅' },
      { id: 's2', nameAr: 'هيكل المقال', icon: '📝' },
      { id: 's3', nameAr: 'خطاطيف السوشيال ميديا', icon: '🎯' },
    ],
    isHired: true,
  },
  {
    id: '2',
    nameAr: 'فهد',
    roleAr: 'كاتب إعلانات',
    avatar: '👨‍💻',
    color: '#F59E0B',
    personalityAr: 'مبدع وجريء في الأفكار، يحب التلاعب بالكلمات وصياغة عبارات لا تُنسى.',
    departmentAr: 'الإعلانات',
    tier: 'STARTER',
    salary: 99,
    skills: [
      { id: 's4', nameAr: 'كتابة نص إعلاني', icon: '✍️' },
      { id: 's5', nameAr: 'عناوين بديلة', icon: '🔥' },
      { id: 's6', nameAr: 'تحسين CTA', icon: '🎯' },
    ],
    isHired: true,
  },
  {
    id: '3',
    nameAr: 'ريم',
    roleAr: 'محللة SEO',
    avatar: '👩‍🔬',
    color: '#10B981',
    personalityAr: 'تحليلية وذكية، تحب الأرقام والبيانات. تشرح المفاهيم التقنية بأسلوب بسيط.',
    departmentAr: 'التحليلات',
    tier: 'GROWTH',
    salary: 199,
    skills: [
      { id: 's7', nameAr: 'تدقيق SEO', icon: '🔍' },
      { id: 's8', nameAr: 'بحث الكلمات المفتاحية', icon: '🔑' },
      { id: 's9', nameAr: 'مولّد Meta Tags', icon: '🏷️' },
    ],
    isHired: true,
  },
  {
    id: '4',
    nameAr: 'سلطان',
    roleAr: 'راوي العلامة التجارية',
    avatar: '👨‍🎨',
    color: '#EC4899',
    personalityAr: 'قصصي وملهم، يرى العلامة التجارية كقصة تُروى. يمزج بين الإبداع والاستراتيجية.',
    departmentAr: 'المحتوى',
    tier: 'GROWTH',
    salary: 199,
    skills: [
      { id: 's10', nameAr: 'قصة العلامة', icon: '📖' },
      { id: 's11', nameAr: 'صفحة عن الشركة', icon: '📄' },
      { id: 's12', nameAr: 'بيان المهمة', icon: '🎯' },
    ],
    isHired: false,
  },
  {
    id: '5',
    nameAr: 'لمى',
    roleAr: 'مخططة الحملات',
    avatar: '👩‍💼',
    color: '#06B6D4',
    personalityAr: 'قيادية واستراتيجية، ترى الصورة الكبيرة دائماً. تخطط بدقة وتنفذ باحترافية.',
    departmentAr: 'الإعلانات',
    tier: 'ENTERPRISE',
    salary: 349,
    skills: [
      { id: 's13', nameAr: 'استراتيجية الحملة', icon: '📊' },
      { id: 's14', nameAr: 'خطة الوسائط', icon: '📺' },
      { id: 's15', nameAr: 'توزيع الميزانية', icon: '💰' },
    ],
    isHired: false,
  },
  {
    id: '6',
    nameAr: 'تركي',
    roleAr: 'محلل الأداء',
    avatar: '👨‍📊',
    color: '#EF4444',
    personalityAr: 'دقيق ومنهجي، يحول البيانات إلى قرارات. يحب الجداول والرسوم البيانية.',
    departmentAr: 'التحليلات',
    tier: 'ENTERPRISE',
    salary: 349,
    skills: [
      { id: 's16', nameAr: 'تحليل القمع', icon: '📈' },
      { id: 's17', nameAr: 'لوحة المؤشرات', icon: '📊' },
      { id: 's18', nameAr: 'خطة اختبار A/B', icon: '🧪' },
    ],
    isHired: false,
  },
];

const TIER_LABELS: Record<string, string> = {
  STARTER: 'مبتدئ',
  GROWTH: 'متقدم',
  ENTERPRISE: 'احترافي',
};

const TIER_GRADIENTS: Record<string, string> = {
  STARTER: 'linear-gradient(135deg, #10B981, #34D399)',
  GROWTH: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  ENTERPRISE: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
};

const DEPARTMENTS = ['الكل', 'المحتوى', 'الإعلانات', 'التحليلات'];

export default function AgentsClient() {
  const [filter, setFilter] = useState('الكل');
  const [agents, setAgents] = useState(demoAgents);

  const filteredAgents = filter === 'الكل'
    ? agents
    : agents.filter((a) => a.departmentAr === filter);

  const handleHire = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, isHired: !a.isHired } : a
      )
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>👥 سوق الموظفين</h1>
          <p className={styles.subtitle}>
            استعرض الموظفين المتاحين ووظّف من يناسب احتياجاتك
          </p>
        </div>
        <div className={styles.filters}>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              className={`${styles.filterBtn} ${
                filter === dept ? styles.filterBtnActive : ''
              }`}
              onClick={() => setFilter(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className={styles.agentGrid}>
        {filteredAgents.map((agent, i) => (
          <div
            key={agent.id}
            className={`${styles.agentCard} ${
              agent.isHired ? styles.agentCardHired : ''
            }`}
            style={{
              '--agent-color': agent.color,
              animationDelay: `${i * 0.1}s`,
            } as React.CSSProperties}
          >
            {/* Header */}
            <div className={styles.cardHeader}>
              <div
                className={styles.avatarContainer}
                style={{ background: `${agent.color}15` }}
              >
                {agent.avatar}
              </div>
              <div className={styles.agentInfo}>
                <div className={styles.agentName}>{agent.nameAr}</div>
                <div className={styles.agentRole}>{agent.roleAr}</div>
                <span className={styles.agentDept}>
                  {agent.departmentAr}
                </span>
              </div>
              <span
                className={styles.tierBadge}
                style={{ background: TIER_GRADIENTS[agent.tier] }}
              >
                {TIER_LABELS[agent.tier]}
              </span>
            </div>

            {/* Personality */}
            <p
              className={styles.personality}
              style={{ borderColor: `${agent.color}40` }}
            >
              {agent.personalityAr}
            </p>

            {/* Skills */}
            <div>
              <div className={styles.skillsTitle}>المهارات</div>
              <div className={styles.skillsList}>
                {agent.skills.map((skill) => (
                  <div key={skill.id} className={styles.skillItem}>
                    <span className={styles.skillIcon}>{skill.icon}</span>
                    {skill.nameAr}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.cardFooter}>
              <div className={styles.salary}>
                <span className={styles.salaryAmount}>{agent.salary}</span>
                <span className={styles.salaryCurrency}>ر.س</span>
                <span className={styles.salaryPeriod}>/ شهرياً</span>
              </div>
              <button
                className={`btn ${agent.isHired ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}`}
                onClick={() => handleHire(agent.id)}
              >
                {agent.isHired ? 'إنهاء التعاقد' : 'توظيف'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
