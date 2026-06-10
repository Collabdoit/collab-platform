'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Settings, Hand, User, LogOut, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import styles from './OfficeTopBar.module.css';

export default function OfficeTopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
  const userEmail = session?.user?.email || '';
  const initials = userName ? userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.greeting}>
        <span className={styles.greetingText}>
          مرحباً {userName} <Hand size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </span>
        <span className={styles.companyName}>المكتب الافتراضي</span>
      </div>

      <div className={styles.actions}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className={styles.iconBtn}
            aria-label="الإشعارات"
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
          >
            <Bell size={18} />
            <span className={styles.notifDot}></span>
          </button>

          {showNotif && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span>الإشعارات</span>
                <button onClick={() => setShowNotif(false)} className={styles.dropdownClose}><X size={14} /></button>
              </div>
              <div className={styles.dropdownItem}>
                <Bell size={14} style={{ color: '#818CF8', flexShrink: 0 }} />
                <div>
                  <div className={styles.dropdownTitle}>مرحباً بك في كولاب!</div>
                  <div className={styles.dropdownMeta}>ابدأ بتوظيف أول موظف من سوق الموظفين</div>
                </div>
              </div>
              <div className={styles.dropdownItem}>
                <Bell size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                <div>
                  <div className={styles.dropdownTitle}>النظام جاهز</div>
                  <div className={styles.dropdownMeta}>الذكاء الاصطناعي يعمل بكامل طاقته</div>
                </div>
              </div>
              <div className={styles.dropdownEmpty}>لا توجد إشعارات جديدة</div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          className={styles.iconBtn}
          aria-label="الإعدادات"
          onClick={() => router.push('/dashboard/admin')}
        >
          <Settings size={18} />
        </button>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div
            className={styles.avatar}
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            style={{ cursor: 'pointer' }}
          >
            {session?.user?.image ? (
              <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              initials
            )}
          </div>

          {showProfile && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span>الحساب</span>
                <button onClick={() => setShowProfile(false)} className={styles.dropdownClose}><X size={14} /></button>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileAvatar}>{initials}</div>
                <div>
                  <div className={styles.profileName}>{userName}</div>
                  <div className={styles.profileEmail}>{userEmail}</div>
                </div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button
                className={styles.dropdownBtn}
                onClick={() => router.push('/dashboard/admin')}
              >
                <Settings size={14} /> إعدادات الحساب
              </button>
              <button
                className={styles.dropdownBtn}
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ color: '#F43F5E' }}
              >
                <LogOut size={14} /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
