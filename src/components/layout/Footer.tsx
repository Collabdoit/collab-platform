import Link from 'next/link';
import styles from './Footer.module.css';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <div style={{ marginBottom: '1rem' }}>
                            <img src="/logo.svg" alt="Collab Logo" style={{ height: '60px' }} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.6' }}>
                            {t('description')}
                        </p>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('platformTitle')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/brands" className={styles.link}>{t('links.brands')}</Link></li>
                            <li><Link href="/creators" className={styles.link}>{t('links.creators')}</Link></li>
                            <li><Link href="/pricing" className={styles.link}>{t('links.pricing')}</Link></li>
                            <li><Link href="/case-studies" className={styles.link}>{t('links.caseStudies')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('companyTitle')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/about" className={styles.link}>{t('links.about')}</Link></li>
                            <li><Link href="/blog" className={styles.link}>{t('links.blog')}</Link></li>
                            <li><Link href="/contact" className={styles.link}>{t('links.contact')}</Link></li>
                            <li><Link href="/careers" className={styles.link}>{t('links.careers')}</Link></li>
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>{t('legalTitle')}</h3>
                        <ul className={styles.links}>
                            <li><Link href="/privacy" className={styles.link}>{t('links.privacy')}</Link></li>
                            <li><Link href="/terms" className={styles.link}>{t('links.terms')}</Link></li>
                            <li><Link href="/gcam" className={styles.link}>{t('links.gcam')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>{t('copyright', { year: new Date().getFullYear() })}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Social Icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
