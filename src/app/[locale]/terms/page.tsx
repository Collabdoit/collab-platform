import { useTranslations } from 'next-intl';

export default function TermsPage() {
    const t = useTranslations('Legal.Terms');

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>{t('title')}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('intro')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.definitions.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.definitions.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.eligibility.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.eligibility.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.services.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.services.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.obligations.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.obligations.content')}</p>
                    <ul style={{ listStyle: 'disc', paddingRight: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        <li>{t('sections.obligations.items.gcam')}</li>
                        <li>{t('sections.obligations.items.content')}</li>
                        <li>{t('sections.obligations.items.accuracy')}</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.payment.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.payment.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.liability.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.liability.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.governing.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.governing.content')}</p>
                </section>

                <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    <p>{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>
                </section>
            </div>
        </div>
    );
}
