'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Mail, Lock, Globe, Loader2, ArrowLeft,
  Users, Zap, Brain, Shield, Star, Sparkles, BarChart3, MessageSquare
} from 'lucide-react';
import styles from './register.module.css';

const FEATURES = [
  { icon: <Users size={20} />, title: '14 موظف ذكاء اصطناعي', desc: 'فريق كامل جاهز للعمل فوراً' },
  { icon: <Brain size={20} />, title: 'ذاكرة مستمرة', desc: 'يتعلم ويتذكر تفاصيل مشروعك' },
  { icon: <Zap size={20} />, title: 'إنجاز فوري', desc: 'نتائج في ثوانٍ بدل أيام' },
  { icon: <Shield size={20} />, title: 'مجاني بالكامل', desc: 'بدون بطاقة ائتمان أو رسوم' },
];

const STATS = [
  { value: '14+', label: 'موظف AI' },
  { value: '40+', label: 'مهارة' },
  { value: '∞', label: 'مهام' },
];

export default function BrandRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ companyName: '', email: '', password: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.companyName,
          role: 'BRAND',
          companyName: formData.companyName,
          website: formData.website
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في إنشاء الحساب');
      }

      const loginResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginResult?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left Panel — Branding */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <div className={styles.logoMark}>
              <div className={styles.logoInner}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="8" width="10" height="16" rx="2" fill="white" opacity="0.9"/>
                  <rect x="18" y="4" width="10" height="24" rx="2" fill="white" opacity="0.7"/>
                  <rect x="11" y="12" width="10" height="12" rx="2" fill="white" opacity="0.5"/>
                </svg>
              </div>
              <div className={styles.logoGlow}></div>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>كولاب</span>
              <span className={styles.logoTag}>Collab AI</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className={styles.brandTitle}>
            مكتبك الافتراضي
            <br />
            <span className={styles.gradientText}>يعمل بالذكاء الاصطناعي</span>
          </h1>
          <p className={styles.brandDesc}>
            وظّف فريق تسويق كامل من الذكاء الاصطناعي — كتّاب محتوى، مصممين، محللين، وأكثر. كل موظف يتعلم ويتذكر ويُنجز.
          </p>

          {/* Stats */}
          <div className={styles.statsRow}>
            {STATS.map((stat, i) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className={styles.featuresList}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureItem} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className={styles.socialProof}>
            <div className={styles.starsRow}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <span>يستخدمه أكثر من 500+ شركة سعودية</span>
          </div>
        </div>

        {/* Background Decoration */}
        <div className={styles.bgOrb1}></div>
        <div className={styles.bgOrb2}></div>
        <div className={styles.bgGrid}></div>
      </div>

      {/* Right Panel — Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* Mobile Logo */}
          <div className={styles.mobileLogo}>
            <div className={styles.logoMark} style={{ width: 44, height: 44 }}>
              <div className={styles.logoInner}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="8" width="10" height="16" rx="2" fill="white" opacity="0.9"/>
                  <rect x="18" y="4" width="10" height="24" rx="2" fill="white" opacity="0.7"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>إنشاء حساب جديد</h2>
            <p className={styles.formSubtitle}>ابدأ مجاناً — بدون بطاقة ائتمان</p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.inputGroup} ${focused === 'company' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Building2 size={14} /> اسم الشركة</label>
              <input
                type="text" required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                onFocus={() => setFocused('company')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="مثال: شركة النخبة للتسويق"
              />
            </div>

            <div className={`${styles.inputGroup} ${focused === 'email' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Mail size={14} /> البريد الإلكتروني</label>
              <input
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="you@company.com"
              />
            </div>

            <div className={`${styles.inputGroup} ${focused === 'password' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Lock size={14} /> كلمة المرور</label>
              <input
                type="password" required minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="6 أحرف على الأقل"
              />
            </div>

            <div className={`${styles.inputGroup} ${focused === 'website' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Globe size={14} /> الموقع الإلكتروني <span className={styles.optional}>(اختياري)</span></label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                onFocus={() => setFocused('website')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="https://yoursite.com"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <><Loader2 size={18} className={styles.spinner} /> جاري الإنشاء...</>
              ) : (
                <>إنشاء الحساب <ArrowLeft size={18} /></>
              )}
            </button>
          </form>

          <div className={styles.terms}>
            بإنشاء حسابك، فإنك توافق على <a href="#">شروط الاستخدام</a> و<a href="#">سياسة الخصوصية</a>
          </div>

          <div className={styles.divider}>
            <span>أو</span>
          </div>

          <div className={styles.loginLink}>
            لديك حساب؟{' '}
            <Link href="/login">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
