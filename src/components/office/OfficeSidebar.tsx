'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Building2, Users, ClipboardList, Package, Wallet, Briefcase,
  MessageSquare, LayoutDashboard, LogOut, User, Loader2, BookOpen, FileText
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
  { icon: <BookOpen size={18} />, label: 'التدريب', href: '/dashboard/training' },
  { icon: <FileText size={18} />, label: 'المستندات', href: '/dashboard/documents' },
  { icon: <MessageSquare size={18} />, label: 'غرفة الاجتماعات', href: '/dashboard/meeting' },
];

const settingsNav: NavItem[] = [
  { icon: <Wallet size={18} />, label: 'الرواتب', href: '/dashboard/payroll' },
  { icon: <LayoutDashboard size={18} />, label: 'لوحة الإدارة', href: '/dashboard/admin' },
];

export default function OfficeSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Strip locale prefix for matching
  const cleanPath = pathname.replace(/^\/(ar|en)/, '') || '/dashboard';

  const isActive = (href: string) => {
    if (href === '/dashboard') return cleanPath === '/dashboard';
    return cleanPath.startsWith(href);
  };

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
  const userEmail = session?.user?.email || '';
  const userInitials = userName
    ? userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : '?';

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

      {/* User Profile + Footer */}
      <div className={styles.sidebarFooter}>
        {status === 'loading' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
          </div>
        ) : session?.user ? (
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {session.user.image ? (
                <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userEmail}>{userEmail}</div>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="تسجيل الخروج"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            <User size={14} /> تسجيل الدخول
          </Link>
        )}
      </div>
    </aside>
  );
}
