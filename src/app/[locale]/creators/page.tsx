import Link from 'next/link';
import { Gift, DollarSign, Star } from 'lucide-react';
import styles from './creators.module.css';
import { useTranslations } from 'next-intl';

export default function CreatorsPage() {
    const t = useTranslations('CreatorsPage');

    return (
        <>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
                    <p className={styles.heroSubtitle}>
                        {t('heroSubtitle')}
                    </p>
                    <Link href="/register" className="btn btn-primary">{t('heroCta')}</Link>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <div className={styles.grid}>
                        <div className={styles.content}>
                            <h2>{t('whyTitle')}</h2>
                            <p>
                                {t('whyDesc')}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Gift className="text-primary" size={32} />
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('features.productsTitle')}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{t('features.productsDesc')}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <DollarSign className="text-primary" size={32} />
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('features.cashTitle')}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{t('features.cashDesc')}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Star className="text-primary" size={32} />
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('features.brandsTitle')}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>{t('features.brandsDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Image */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src="/creators-why-join.png"
                                alt="Why Join Collab"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '1rem' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section} style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2>{t('howTitle')}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{t('howSubtitle')}</p>
                    </div>

                    <div className={styles.steps}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepIcon}>1</div>
                            <h3>{t('steps.1Title')}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{t('steps.1Desc')}</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepIcon}>2</div>
                            <h3>{t('steps.2Title')}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{t('steps.2Desc')}</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepIcon}>3</div>
                            <h3>{t('steps.3Title')}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{t('steps.3Desc')}</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link href="/register" className="btn btn-primary">{t('joinCta')}</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
