import Link from 'next/link';
import { Check, XCircle } from 'lucide-react';
import styles from './brands.module.css';
import { useTranslations } from 'next-intl';

export default function BrandsPage() {
    const t = useTranslations('BrandsPage');

    return (
        <>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
                    <p className={styles.heroSubtitle}>
                        {t('heroSubtitle')}
                    </p>
                    <Link href="/contact" className="btn btn-primary">{t('heroCta')}</Link>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.content}>
                            <h2>{t('problemTitle')}</h2>
                            <p>
                                {t('problemDesc')}
                            </p>
                            <ul className={styles.featureList}>
                                <li className={styles.featureItem}>
                                    <XCircle size={24} color="#EF4444" />
                                    <span>{t('problemList.0')}</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <XCircle size={24} color="#EF4444" />
                                    <span>{t('problemList.1')}</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <XCircle size={24} color="#EF4444" />
                                    <span>{t('problemList.2')}</span>
                                </li>
                            </ul>
                        </div>
                        {/* Image */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src="/brands-problem.png"
                                alt="Influencer Marketing Challenges"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '1rem' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section} style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="container">
                    <div className={styles.grid} style={{ direction: 'ltr' }}> {/* Reverse layout visually */}
                        <div className={styles.content} style={{ direction: 'rtl' }}>
                            <h2>{t('solutionTitle')}</h2>
                            <p>
                                {t('solutionDesc')}
                            </p>
                            <ul className={styles.featureList}>
                                <li className={styles.featureItem}>
                                    <Check size={24} className={styles.checkIcon} />
                                    <span>{t('solutionList.0')}</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Check size={24} className={styles.checkIcon} />
                                    <span>{t('solutionList.1')}</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Check size={24} className={styles.checkIcon} />
                                    <span>{t('solutionList.2')}</span>
                                </li>
                                <li className={styles.featureItem}>
                                    <Check size={24} className={styles.checkIcon} />
                                    <span>{t('solutionList.3')}</span>
                                </li>
                            </ul>
                        </div>
                        {/* Image */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src="/brands-solution.png"
                                alt="Collab Platform Solution"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '1rem' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className="container">
                    <h2 className={styles.ctaTitle}>{t('ctaTitle')}</h2>
                    <p className={styles.ctaText}>{t('ctaText')}</p>
                    <Link href="/contact" className="btn" style={{ backgroundColor: 'white', color: 'var(--color-primary)' }}>
                        {t('ctaButton')}
                    </Link>
                </div>
            </section>
        </>
    );
}
