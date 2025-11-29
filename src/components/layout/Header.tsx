import Link from 'next/link';
import styles from './Header.module.css';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const t = useTranslations('Navigation');

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    <img src="/logo.svg" alt="Collab Logo" style={{ height: '50px' }} />
                </Link>

                <nav className={styles.nav}>
                    <ul className={styles.navLinks}>
                        <li><Link href="/brands" className={styles.navLink}>{t('brands')}</Link></li>
                        <li><Link href="/creators" className={styles.navLink}>{t('creators')}</Link></li>
                        <li><Link href="/how-it-works" className={styles.navLink}>{t('howItWorks')}</Link></li>
                        <li><Link href="/pricing" className={styles.navLink}>{t('pricing')}</Link></li>
                    </ul>
                </nav>

                <div className={styles.actions}>
                    <LanguageSwitcher />
                    <Link href="/login" className="btn btn-secondary">{t('login')}</Link>
                    <Link href="/brands" className="btn btn-primary">{t('register')}</Link>
                </div>
            </div>
        </header>
    );
}
