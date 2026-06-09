'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Users, Calendar, FileText, Target, PenTool, Flame, Search, Key, Tag,
  BookOpen, FileCheck, Crosshair, BarChart3, Tv, Wallet, TrendingUp,
  LayoutDashboard, FlaskConical, MessageCircle, Mic, UserCheck, XCircle,
  BriefcaseBusiness, Sparkles, Microscope, Palette, Megaphone, LineChart
} from 'lucide-react';
import styles from './agents.module.css';

const InterviewModal = dynamic(() => import('@/components/interview/InterviewModal'), { ssr: false });

interface Skill {
  id: string;
  nameAr: string;
  icon: React.ReactNode;
}

interface Agent {
  id: string;
  nameAr: string;
  roleAr: string;
  avatar: React.ReactNode;
  color: string;
  personalityAr: string;
  departmentAr: string;
  tier: string;
  salary: number;
  minSalary: number;
  skills: Skill[];
  isHired: boolean;
  agreedSalary?: number;
}

const demoAgents: Agent[] = [
  {
    id: '1', nameAr: 'نورة', roleAr: 'استراتيجية المحتوى',
    avatar: <BriefcaseBusiness size={28} />,
    color: '#8B5CF6', personalityAr: 'منظمة ودقيقة، تحب التخطيط المسبق وتؤمن بأن المحتوى الجيد يبدأ بخطة محكمة.',
    departmentAr: 'المحتوى', tier: 'STARTER', salary: 99, minSalary: 79,
    skills: [
      { id: 's1', nameAr: 'تقويم المحتوى', icon: <Calendar size={16} /> },
      { id: 's2', nameAr: 'هيكل المقال', icon: <FileText size={16} /> },
      { id: 's3', nameAr: 'خطاطيف السوشيال ميديا', icon: <Target size={16} /> },
    ],
    isHired: true,
  },
  {
    id: '2', nameAr: 'فهد', roleAr: 'كاتب إعلانات',
    avatar: <PenTool size={28} />,
    color: '#F59E0B', personalityAr: 'مبدع وجريء في الأفكار، يحب التلاعب بالكلمات وصياغة عبارات لا تُنسى.',
    departmentAr: 'الإعلانات', tier: 'STARTER', salary: 99, minSalary: 79,
    skills: [
      { id: 's4', nameAr: 'كتابة نص إعلاني', icon: <PenTool size={16} /> },
      { id: 's5', nameAr: 'عناوين بديلة', icon: <Flame size={16} /> },
      { id: 's6', nameAr: 'تحسين CTA', icon: <Target size={16} /> },
    ],
    isHired: true,
  },
  {
    id: '3', nameAr: 'ريم', roleAr: 'محللة SEO',
    avatar: <Microscope size={28} />,
    color: '#10B981', personalityAr: 'تحليلية وذكية، تحب الأرقام والبيانات. تشرح المفاهيم التقنية بأسلوب بسيط.',
    departmentAr: 'التحليلات', tier: 'GROWTH', salary: 199, minSalary: 159,
    skills: [
      { id: 's7', nameAr: 'تدقيق SEO', icon: <Search size={16} /> },
      { id: 's8', nameAr: 'بحث الكلمات المفتاحية', icon: <Key size={16} /> },
      { id: 's9', nameAr: 'مولّد Meta Tags', icon: <Tag size={16} /> },
    ],
    isHired: false,
  },
  {
    id: '4', nameAr: 'سلطان', roleAr: 'راوي العلامة التجارية',
    avatar: <Palette size={28} />,
    color: '#EC4899', personalityAr: 'قصصي وملهم، يرى العلامة التجارية كقصة تُروى. يمزج بين الإبداع والاستراتيجية.',
    departmentAr: 'المحتوى', tier: 'GROWTH', salary: 199, minSalary: 159,
    skills: [
      { id: 's10', nameAr: 'قصة العلامة', icon: <BookOpen size={16} /> },
      { id: 's11', nameAr: 'صفحة عن الشركة', icon: <FileCheck size={16} /> },
      { id: 's12', nameAr: 'بيان المهمة', icon: <Crosshair size={16} /> },
    ],
    isHired: false,
  },
  {
    id: '5', nameAr: 'لمى', roleAr: 'مخططة الحملات',
    avatar: <Megaphone size={28} />,
    color: '#06B6D4', personalityAr: 'قيادية واستراتيجية، ترى الصورة الكبيرة دائماً. تخطط بدقة وتنفذ باحترافية.',
    departmentAr: 'الإعلانات', tier: 'ENTERPRISE', salary: 349, minSalary: 279,
    skills: [
      { id: 's13', nameAr: 'استراتيجية الحملة', icon: <BarChart3 size={16} /> },
      { id: 's14', nameAr: 'خطة الوسائط', icon: <Tv size={16} /> },
      { id: 's15', nameAr: 'توزيع الميزانية', icon: <Wallet size={16} /> },
    ],
    isHired: false,
  },
  {
    id: '6', nameAr: 'تركي', roleAr: 'محلل الأداء',
    avatar: <LineChart size={28} />,
    color: '#EF4444', personalityAr: 'دقيق ومنهجي، يحول البيانات إلى قرارات. يحب الجداول والرسوم البيانية.',
    departmentAr: 'التحليلات', tier: 'ENTERPRISE', salary: 349, minSalary: 279,
    skills: [
      { id: 's16', nameAr: 'تحليل القمع', icon: <TrendingUp size={16} /> },
      { id: 's17', nameAr: 'لوحة المؤشرات', icon: <LayoutDashboard size={16} /> },
      { id: 's18', nameAr: 'خطة اختبار A/B', icon: <FlaskConical size={16} /> },
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
  const router = useRouter();
  const [filter, setFilter] = useState('الكل');
  const [agents, setAgents] = useState(demoAgents);
  const [interviewAgent, setInterviewAgent] = useState<Agent | null>(null);

  const filteredAgents = filter === 'الكل'
    ? agents
    : agents.filter((a) => a.departmentAr === filter);

  const handleHired = (agentId: string, agreedSalary: number) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, isHired: true, agreedSalary } : a
      )
    );
    setInterviewAgent(null);
  };

  const handleFire = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, isHired: false, agreedSalary: undefined } : a
      )
    );
  };

  const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><Users size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />سوق الموظفين</h1>
          <p className={styles.subtitle}>
            قابل الموظفين، تفاوض على الراتب، ووظّف من يناسب احتياجاتك
          </p>
        </div>
        <div className={styles.filters}>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              className={`${styles.filterBtn} ${filter === dept ? styles.filterBtnActive : ''}`}
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
            className={`${styles.agentCard} ${agent.isHired ? styles.agentCardHired : ''}`}
            style={{
              '--agent-color': agent.color,
              animationDelay: `${i * 0.1}s`,
            } as React.CSSProperties}
            onMouseMove={handleCardTilt}
            onMouseLeave={handleCardLeave}
          >
            {/* Hired Badge */}
            {agent.isHired && (
              <div className={styles.hiredBadge}><UserCheck size={12} style={{ marginInlineEnd: '4px' }} /> موظّف</div>
            )}

            {/* Header */}
            <div className={styles.cardHeader}>
              <div className={styles.avatarContainer} style={{ background: `${agent.color}15`, color: agent.color }}>
                {agent.avatar}
              </div>
              <div className={styles.agentInfo}>
                <div className={styles.agentName}>{agent.nameAr}</div>
                <div className={styles.agentRole}>{agent.roleAr}</div>
                <span className={styles.agentDept}>{agent.departmentAr}</span>
              </div>
              <span className={styles.tierBadge} style={{ background: TIER_GRADIENTS[agent.tier] }}>
                {TIER_LABELS[agent.tier]}
              </span>
            </div>

            {/* Personality */}
            <p className={styles.personality} style={{ borderColor: `${agent.color}40` }}>
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
                {agent.agreedSalary && agent.agreedSalary !== agent.salary ? (
                  <>
                    <span className={styles.salaryAmount}>{agent.agreedSalary}</span>
                    <span className={styles.salaryOriginal}>{agent.salary}</span>
                    <span className={styles.salaryCurrency}>ر.س</span>
                    <span className={styles.salaryPeriod}>/ شهرياً</span>
                  </>
                ) : (
                  <>
                    <span className={styles.salaryAmount}>{agent.salary}</span>
                    <span className={styles.salaryCurrency}>ر.س</span>
                    <span className={styles.salaryPeriod}>/ شهرياً</span>
                  </>
                )}
              </div>
              <div className={styles.cardActions}>
                {agent.isHired ? (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => router.push(`./agents/${agent.id}`)}>
                      <MessageCircle size={14} /> تحدث
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleFire(agent.id)}>
                      <XCircle size={14} /> إنهاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`btn btn-secondary btn-sm ${styles.interviewBtn}`}
                      onClick={() => setInterviewAgent(agent)}
                    >
                      <Mic size={14} /> مقابلة
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interview Modal */}
      {interviewAgent && (
        <InterviewModal
          agent={interviewAgent}
          onClose={() => setInterviewAgent(null)}
          onHired={(salary) => handleHired(interviewAgent.id, salary)}
        />
      )}
    </div>
  );
}
