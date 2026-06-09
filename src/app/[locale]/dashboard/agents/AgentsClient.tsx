'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Users, Calendar, FileText, Target, PenTool, Flame, Search, Key, Tag,
  BookOpen, FileCheck, Crosshair, BarChart3, Tv, Wallet, TrendingUp,
  LayoutDashboard, FlaskConical, MessageCircle, Mic, UserCheck, XCircle,
  BriefcaseBusiness, Sparkles, Microscope, Palette, Megaphone, LineChart,
  Monitor, Mail, Globe, Briefcase, Layout, Languages, Loader2
} from 'lucide-react';
import styles from './agents.module.css';

const InterviewModal = dynamic(() => import('@/components/interview/InterviewModal'), { ssr: false });

interface Skill { id: string; nameAr: string; icon: string; }

interface Agent {
  id: string; nameAr: string; roleAr: string; color: string;
  personalityAr: string; departmentAr: string; tier: string;
  salary: number; minSalary: number;
  skills: Skill[];
  isHired: boolean;
  agreedSalary?: number | null;
}

// ─── Icon Maps ────────────────────────────────────────────
const AGENT_AVATAR_ICONS: Record<string, React.ReactNode> = {
  'نورة': <BriefcaseBusiness size={28} />,
  'فهد': <PenTool size={28} />,
  'ريم': <Microscope size={28} />,
  'سلطان': <Palette size={28} />,
  'لمى': <Megaphone size={28} />,
  'تركي': <LineChart size={28} />,
  'عبدالله': <Monitor size={28} />,
  'هند': <Sparkles size={28} />,
  'خالد': <Mail size={28} />,
  'دانة': <BarChart3 size={28} />,
  'يزيد': <Tag size={28} />,
  'سارة': <Layout size={28} />,
  'محمد': <Languages size={28} />,
  'العنود': <Briefcase size={28} />,
};

const SKILL_ICON_MAP: Record<string, React.ReactNode> = {
  '📅': <Calendar size={16} />, '📝': <FileText size={16} />, '🎯': <Target size={16} />,
  '✍️': <PenTool size={16} />, '🔥': <Flame size={16} />, '🔎': <Search size={16} />,
  '🔑': <Key size={16} />, '🏷️': <Tag size={16} />, '📖': <BookOpen size={16} />,
  '✅': <FileCheck size={16} />, '🎯 ': <Crosshair size={16} />, '📊': <BarChart3 size={16} />,
  '📺': <Tv size={16} />, '💰': <Wallet size={16} />, '📈': <TrendingUp size={16} />,
  '📋': <LayoutDashboard size={16} />, '🧪': <FlaskConical size={16} />,
  '🖼️': <Monitor size={16} />, '🎨': <Palette size={16} />, '📐': <Target size={16} />,
  '🛡️': <FileCheck size={16} />, '📧': <Mail size={16} />, '✨': <Sparkles size={16} />,
  '👋': <Users size={16} />, '👥': <Users size={16} />, '🔮': <Globe size={16} />,
  '📦': <BriefcaseBusiness size={16} />, '🔍': <Search size={16} />, '🗺️': <Layout size={16} />,
  '🔄': <Languages size={16} />, '🇸🇦': <Globe size={16} />,
  '🚀': <TrendingUp size={16} />,
};

const getSkillIcon = (iconStr: string) => SKILL_ICON_MAP[iconStr] || <Sparkles size={16} />;

const TIER_LABELS: Record<string, string> = { STARTER: 'مبتدئ', GROWTH: 'متقدم', ENTERPRISE: 'احترافي' };
const TIER_GRADIENTS: Record<string, string> = {
  STARTER: 'linear-gradient(135deg, #10B981, #34D399)',
  GROWTH: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  ENTERPRISE: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
};

export default function AgentsClient() {
  const router = useRouter();
  const [filter, setFilter] = useState('الكل');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<string[]>(['الكل']);
  const [loading, setLoading] = useState(true);
  const [interviewAgent, setInterviewAgent] = useState<Agent | null>(null);

  // Fetch agents from API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || []);
          // Extract unique departments
          const depts = [...new Set((data.agents || []).map((a: Agent) => a.departmentAr))] as string[];
          setDepartments(['الكل', ...depts]);
        }
      } catch (err) {
        console.error('Failed to load agents:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const handleFire = async (agentId: string) => {
    try {
      const res = await fetch('/api/agents/fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      if (res.ok) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, isHired: false, agreedSalary: undefined } : a
          )
        );
      }
    } catch (err) {
      console.error('Fire error:', err);
    }
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

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><Users size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />سوق الموظفين</h1>
          <p className={styles.subtitle}>
            قابل الموظفين، تفاوض على الراتب، ووظّف من يناسب احتياجاتك — {agents.length} موظف متاح
          </p>
        </div>
        <div className={styles.filters}>
          {departments.map((dept) => (
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
              animationDelay: `${i * 0.06}s`,
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
                {AGENT_AVATAR_ICONS[agent.nameAr] || <Globe size={28} />}
              </div>
              <div className={styles.agentInfo}>
                <div className={styles.agentName}>{agent.nameAr}</div>
                <div className={styles.agentRole}>{agent.roleAr}</div>
                <span className={styles.agentDept}>{agent.departmentAr}</span>
              </div>
              <span className={styles.tierBadge} style={{ background: TIER_GRADIENTS[agent.tier] || TIER_GRADIENTS.STARTER }}>
                {TIER_LABELS[agent.tier] || agent.tier}
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
                    <span className={styles.skillIcon}>{getSkillIcon(skill.icon)}</span>
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
          agent={{
            ...interviewAgent,
            avatar: AGENT_AVATAR_ICONS[interviewAgent.nameAr] || <Globe size={28} />,
            skills: interviewAgent.skills.map(s => ({ ...s, icon: getSkillIcon(s.icon) })),
          }}
          onClose={() => setInterviewAgent(null)}
          onHired={(salary) => handleHired(interviewAgent.id, salary)}
        />
      )}
    </div>
  );
}
