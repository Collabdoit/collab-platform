'use client';

import Link from 'next/link';
import { LayoutDashboard, User, Settings, LogOut, Wand2 } from 'lucide-react';
import styles from '../dashboard.module.css';
import { useTranslations } from 'next-intl';

export default function BrandDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('Dashboard.Layout');

    return (
        <>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Collab
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard/brand" className={styles.navLink}>
                        <LayoutDashboard size={20} />
                        <span>{t('dashboard')}</span>
                    </Link>
                    <Link href="/dashboard/profile" className={styles.navLink}>
                        <User size={20} />
                        <span>{t('profile')}</span>
                    </Link>
                    <Link href="/dashboard/settings" className={styles.navLink}>
                        <Settings size={20} />
                        <span>{t('settings')}</span>
                    </Link>
                    <Link href="/dashboard/brand/ai-studio" className={styles.navLink}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Wand2 size={20} />
                            AI Studio
                        </span>
                    </Link>
                    <Link href="/dashboard/brand/campaigns" className={styles.navLink}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            {t('myCampaigns') || 'Campaigns'}
                        </span>
                    </Link>
                    <Link href="/dashboard/brand/search" className={styles.navLink}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            {t('searchCreators') || 'Find Creators'}
                        </span>
                    </Link>
                </nav>

                <div className={styles.logout}>
                    <button className={styles.navLink} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <LogOut size={20} />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>{t('dashboard')}</h1>
                    <div className={styles.userMenu}>
                        <div className={styles.avatar}>B</div>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </>
    );
}
