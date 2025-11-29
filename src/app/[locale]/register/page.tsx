'use client';

import Link from 'next/link';
import { Building2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const t = useTranslations('Auth.Register');

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F9FAFB',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                textAlign: 'center'
            }}>
                <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem' }}>
                    <img src="/logo.svg" alt="Collab" style={{ height: '50px' }} />
                </Link>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-cairo)' }}>{t('title')}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.125rem' }}>{t('subtitle')}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Brand Card */}
                    <Link href="/register/brand" style={{ textDecoration: 'none' }}>
                        <div className="card-hover" style={{
                            backgroundColor: 'white',
                            padding: '3rem 2rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: '#EEF2FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: 'var(--color-primary)'
                            }}>
                                <Building2 size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('brandTitle')}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {t('brandDesc')}
                            </p>
                        </div>
                    </Link>

                    {/* Creator Card */}
                    <Link href="/register/creator" style={{ textDecoration: 'none' }}>
                        <div className="card-hover" style={{
                            backgroundColor: 'white',
                            padding: '3rem 2rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s ease',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: '#F0FDF4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: '#10B981'
                            }}>
                                <User size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('creatorTitle')}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {t('creatorDesc')}
                            </p>
                        </div>
                    </Link>
                </div>

                <div style={{ marginTop: '3rem', color: 'var(--text-secondary)' }}>
                    {t('alreadyAccount')} <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('loginLink')}</Link>
                </div>
            </div>
        </div>
    );
}
