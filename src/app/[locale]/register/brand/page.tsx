'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function BrandRegisterPage() {
    const t = useTranslations('Auth.BrandRegister');
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        website: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Mock Registration Logic
        // In a real app, call API to create user & brand
        setTimeout(() => {
            setLoading(false);
            // Auto login after register (mock)
            router.push('/dashboard/brand');
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F9FAFB',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                padding: '2.5rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/register" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'block' }}>
                        ← {t('backLink')}
                    </Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('companyNameLabel')}</label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('emailLabel')}</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('passwordLabel')}</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('websiteLabel')}</label>
                        <input
                            type="text"
                            required
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                            placeholder="https://..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}
                    >
                        {loading ? t('loadingButton') : t('submitButton')}
                    </button>
                </form>
            </div>
        </div>
    );
}
