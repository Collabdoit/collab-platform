'use client';

import Link from 'next/link';
import { Building2, Briefcase } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0B0F',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            padding: '1rem',
            fontFamily: 'var(--font-cairo), system-ui, sans-serif',
        }}>
            <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                }}>
                    <Briefcase size={28} color="white" />
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#F8FAFC' }}>
                    أنشئ حسابك
                </h1>
                <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '1rem' }}>
                    ابدأ بتوظيف فريق تسويق ذكاء اصطناعي لشركتك
                </p>

                <Link href="/register/brand" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                        background: 'rgba(15, 17, 23, 0.9)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        backdropFilter: 'blur(20px)',
                        textAlign: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}
                    >
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(99,102,241,0.1)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem', color: '#818CF8',
                        }}>
                            <Building2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#F8FAFC' }}>
                            حساب شركة / علامة تجارية
                        </h2>
                        <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.9rem' }}>
                            وظّف موظفي ذكاء اصطناعي لفريق التسويق — محتوى، إعلانات، SEO، وأكثر
                        </p>
                    </div>
                </Link>

                <div style={{ marginTop: '2rem', color: '#64748B', fontSize: '0.85rem' }}>
                    لديك حساب؟{' '}
                    <Link href="/login" style={{ color: '#818CF8', fontWeight: 600, textDecoration: 'none' }}>
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
}
