'use client';

import Link from 'next/link';
import { LayoutDashboard, User, Settings, LogOut, Rocket } from 'lucide-react';
import styles from '../dashboard.module.css';
import { useTranslations } from 'next-intl';

export default function CreatorDashboardLayout({
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
                    <Link href="/dashboard/creator" className={styles.navLink}>
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
                    <Link href="/dashboard/creator/growth-suite" className={styles.navLink}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Rocket size={20} />
                            Growth Suite
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
                        <div className={styles.avatar}>C</div>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </>
    );
}
