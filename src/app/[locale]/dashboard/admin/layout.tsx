'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Shield } from 'lucide-react';
import styles from '../dashboard.module.css';
import { useTranslations } from 'next-intl';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('Dashboard.Layout');

    return (
        <>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Collab Admin
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard/admin" className={styles.navLink}>
                        <LayoutDashboard size={20} />
                        <span>{t('dashboard')}</span>
                    </Link>
                    <Link href="/dashboard/admin/users" className={styles.navLink}>
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <Link href="/dashboard/admin/licenses" className={styles.navLink}>
                        <FileText size={20} />
                        <span>Licenses</span>
                    </Link>
                    <Link href="/dashboard/settings" className={styles.navLink}>
                        <Settings size={20} />
                        <span>{t('settings')}</span>
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
                    <h1 className={styles.pageTitle}>Admin Dashboard</h1>
                    <div className={styles.userMenu}>
                        <div className={styles.avatar}>A</div>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </>
    );
}
