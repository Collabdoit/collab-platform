'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Lock, Loader2, ArrowLeft,
  Zap, Brain, Users, Shield
} from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError('حدث خطأ. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left Brand Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoMark}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="10" height="16" rx="2" fill="white" opacity="0.9"/>
                <rect x="18" y="4" width="10" height="24" rx="2" fill="white" opacity="0.7"/>
                <rect x="11" y="12" width="10" height="12" rx="2" fill="white" opacity="0.5"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>كولاب</span>
              <span className={styles.logoTag}>Collab AI</span>
            </div>
          </div>

          <h1 className={styles.brandTitle}>
            مرحباً بعودتك
            <br />
            <span className={styles.gradientText}>فريقك بانتظارك</span>
          </h1>
          <p className={styles.brandDesc}>
            ادخل إلى مكتبك الافتراضي وتابع العمل مع فريقك من الذكاء الاصطناعي
          </p>

          <div className={styles.featuresList}>
            {[
              { icon: <Brain size={18} />, text: 'موظفوك يتذكرون كل شيء' },
              { icon: <Zap size={18} />, text: 'إنجاز فوري بدون انتظار' },
              { icon: <Users size={18} />, text: 'فريق كامل 24/7' },
              { icon: <Shield size={18} />, text: 'بياناتك آمنة ومحمية' },
            ].map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.bgOrb1}></div>
        <div className={styles.bgOrb2}></div>
        <div className={styles.bgGrid}></div>
      </div>

      {/* Right Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* Mobile Logo */}
          <div className={styles.mobileLogo}>
            <div className={styles.logoMark} style={{ width: 44, height: 44 }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="8" width="10" height="16" rx="2" fill="white" opacity="0.9"/>
                <rect x="18" y="4" width="10" height="24" rx="2" fill="white" opacity="0.7"/>
              </svg>
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>تسجيل الدخول</h2>
            <p className={styles.formSubtitle}>ادخل بريدك الإلكتروني وكلمة المرور</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.inputGroup} ${focused === 'email' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Mail size={14} /> البريد الإلكتروني</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="you@company.com"
              />
            </div>

            <div className={`${styles.inputGroup} ${focused === 'password' ? styles.inputFocused : ''}`}>
              <label className={styles.label}><Lock size={14} /> كلمة المرور</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                className={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <><Loader2 size={18} className={styles.spinner} /> جاري الدخول...</>
              ) : (
                <>تسجيل الدخول <ArrowLeft size={18} /></>
              )}
            </button>
          </form>

          <div className={styles.divider}><span>أو</span></div>

          <div className={styles.loginLink}>
            ليس لديك حساب؟{' '}
            <Link href="/register">إنشاء حساب مجاني</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
