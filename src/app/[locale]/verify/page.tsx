'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!email) {
            router.push('/login');
        } else {
            // Auto-send OTP on load
            sendOtp();
        }
    }, [email]);

    const sendOtp = async () => {
        if (loading) return;
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, method: 'email' })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.isMock) {
                    setMessage('⚠️ Mock Mode: Email not sent (API Key missing). Check console for code.');
                    console.log('Mock Mode enabled. Check server logs for OTP.');
                } else {
                    setMessage('Code sent to your email!');
                }
            } else {
                setError(data.error || 'Failed to send code');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            // Sign in immediately after verification
            // We need the user's password to sign in automatically, but we don't have it here.
            // So we redirect to login, OR we can use a custom credential provider that accepts email only if verified (advanced).
            // For simplicity, let's redirect to login with a success message.

            router.push('/login?verified=true');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Verify Your Account</h1>
                <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '2rem' }}>
                    We sent a code to <strong>{email}</strong>
                </p>

                {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}
                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
                        maxLength={6}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7C3AED', color: 'white', borderRadius: '0.5rem', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <button
                    onClick={sendOtp}
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        color: loading ? '#9CA3AF' : '#6B7280',
                        fontSize: '0.875rem',
                        background: 'none',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    {loading ? 'Sending...' : 'Resend Code'}
                </button>
            </div>
        </div>
    );
}
