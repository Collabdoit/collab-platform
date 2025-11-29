import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const t = await getTranslations('Dashboard.Main');

    if (!session || !session.user) {
        redirect('/login');
    }

    const role = (session.user as any).role;

    if (role === 'BRAND') {
        redirect('/dashboard/brand');
    } else if (role === 'CREATOR') {
        redirect('/dashboard/creator');
    } else if (role === 'ADMIN') {
        redirect('/dashboard/admin');
    }

    // Fallback if no role or unknown role
    return (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>{t('welcome')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>{t('subtitle')}</p>
            <p>Role: {role || 'None'}</p>
        </div>
    );
}
