'use client';

import OfficeSidebar from './OfficeSidebar';
import OfficeTopBar from './OfficeTopBar';
import styles from './OfficeLayout.module.css';

interface OfficeLayoutProps {
  children: React.ReactNode;
}

export default function OfficeLayout({ children }: OfficeLayoutProps) {
  return (
    <div className={styles.layout}>
      <OfficeSidebar />
      <main className={styles.main}>
        <OfficeTopBar />
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
