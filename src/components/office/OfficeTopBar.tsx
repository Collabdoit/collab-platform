'use client';

import { Bell, Settings, Hand } from 'lucide-react';
import styles from './OfficeTopBar.module.css';

export default function OfficeTopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.greeting}>
        <span className={styles.greetingText}>مرحباً بك في مكتبك <Hand size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
        <span className={styles.companyName}>المكتب الافتراضي</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="الإشعارات">
          <Bell size={18} />
          <span className={styles.notifDot}></span>
        </button>
        <button className={styles.iconBtn} aria-label="الإعدادات">
          <Settings size={18} />
        </button>
        <div className={styles.avatar}>م</div>
      </div>
    </header>
  );
}
