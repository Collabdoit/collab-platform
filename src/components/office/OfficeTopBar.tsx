'use client';

import styles from './OfficeTopBar.module.css';

export default function OfficeTopBar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.greeting}>
        <span className={styles.greetingText}>مرحباً بك في مكتبك 👋</span>
        <span className={styles.companyName}>المكتب الافتراضي</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="الإشعارات">
          🔔
          <span className={styles.notifDot}></span>
        </button>
        <button className={styles.iconBtn} aria-label="الإعدادات">
          ⚙️
        </button>
        <div className={styles.avatar}>م</div>
      </div>
    </header>
  );
}
