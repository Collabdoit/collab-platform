import styles from './about.module.css';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('AboutPage');

    return (
        <>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>{t('heroTitle')}</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                        {t('heroSubtitle')}
                    </p>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <div className={styles.story}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>{t('storyTitle')}</h2>
                        <p>
                            {t('storyP1')}
                        </p>
                        <p style={{ marginTop: '1.5rem' }}>
                            {t('storyP2')}
                        </p>
                    </div>

                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <h3 className={styles.valueTitle}>{t('values.transparencyTitle')}</h3>
                            <p>{t('values.transparencyDesc')}</p>
                        </div>
                        <div className={styles.valueCard}>
                            <h3 className={styles.valueTitle}>{t('values.complianceTitle')}</h3>
                            <p>{t('values.complianceDesc')}</p>
                        </div>
                        <div className={styles.valueCard}>
                            <h3 className={styles.valueTitle}>{t('values.winwinTitle')}</h3>
                            <p>{t('values.winwinDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
