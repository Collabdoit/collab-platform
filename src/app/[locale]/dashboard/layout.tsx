import Link from 'next/link';
import { LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import styles from './dashboard.module.css';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('Dashboard.Layout');

    return (
        <div className={styles.layout}>
            {children}
        </div>
    );
}
