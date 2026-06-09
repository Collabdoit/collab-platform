'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, Users, ClipboardList, Package, Wallet, Briefcase,
  MessageSquare, LayoutDashboard
} from 'lucide-react';
import styles from './OfficeSidebar.module.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const mainNav: NavItem[] = [
  { icon: <Building2 size={18} />, label: 'المكتب', href: '/dashboard' },
  { icon: <Users size={18} />, label: 'الموظفين', href: '/dashboard/agents' },
  { icon: <ClipboardList size={18} />, label: 'المهام', href: '/dashboard/tasks' },
  { icon: <Package size={18} />, label: 'التسليمات', href: '/dashboard/deliverables' },
  { icon: <MessageSquare size={18} />, label: 'غرفة الاجتماعات', href: '/dashboard/meeting' },
];

const settingsNav: NavItem[] = [
  { icon: <Wallet size={18} />, label: 'الرواتب', href: '/dashboard/payroll' },
  { icon: <LayoutDashboard size={18} />, label: 'لوحة الإدارة', href: '/dashboard/admin' },
];

export default function OfficeSidebar() {
  const pathname = usePathname();

  // Strip locale prefix for matching
  const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/dashboard';

  const isActive = (href: string) => {
    if (href === '/dashboard') return cleanPath === '/dashboard';
    return cleanPath.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Header / Logo */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}><Briefcase size={22} /></div>
        <span className={styles.logoText}>المكتب</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>القائمة الرئيسية</div>
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              isActive(item.href) ? styles.navItemActive : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}

        <div className={styles.navSection}>الإعدادات</div>
        {settingsNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              isActive(item.href) ? styles.navItemActive : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.tierBadge}>
          <span className={styles.tierDot}></span>
          <span>الباقة: مبتدئ</span>
        </div>
      </div>
    </aside>
  );
}
