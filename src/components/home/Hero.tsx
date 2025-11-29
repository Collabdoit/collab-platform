import Link from 'next/link';
import styles from './Hero.module.css';
import { useTranslations } from 'next-intl';

export default function Hero() {
    const t = useTranslations('HomePage');

    return (
        <section className={styles.hero}>
            <div className={styles.splitLayout}>
                <div className={styles.contentSide}>
                    <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: t.raw('title').replace('<highlight>', '<span class="' + styles.highlight + '">').replace('</highlight>', '</span>') }}>
                    </h1>
                    <p className={styles.subtitle}>
                        {t('subtitle')}
                    </p>

                    <div className={styles.buttons}>
                        <Link href="/brands" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)' }}>
                            {t('brandButton')}
                        </Link>
                        <Link href="/creators" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                            {t('creatorButton')}
                        </Link>
                    </div>
                </div>

                <div className={styles.imageSide}>
                    <div className={styles.imageContainer}>
                        <img
                            src="/hero_image_v2.png"
                            alt="Saudi Influencer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className={styles.overlay}></div>

                        {/* Floating Elements */}
                        <div className={styles.floatingCard} style={{ top: '20%', left: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Campaign</span>
                            </div>
                        </div>

                        <div className={styles.floatingCard} style={{ bottom: '15%', right: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>+245%</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Engagement Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
