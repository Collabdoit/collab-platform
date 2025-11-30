'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CreatorRegisterPage() {
    const t = useTranslations('Auth.CreatorRegister');
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        instagram: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    role: 'CREATOR',
                    instagram: formData.instagram
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            // Login after successful registration
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push('/dashboard/creator');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('nameLabel')}</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('instagramLabel')}</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>@</span>
                            <input
                                type="text"
                                required
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', direction: 'ltr', textAlign: 'right' }}
                                placeholder="username"
                            />
                        </div>
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
