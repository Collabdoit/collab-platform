import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    const t = useTranslations('Legal.Privacy');

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>{t('title')}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <section>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('intro')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.collection.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.collection.content')}</p>
                    <ul style={{ listStyle: 'disc', paddingRight: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        <li>{t('sections.collection.items.personal')}</li>
                        <li>{t('sections.collection.items.usage')}</li>
                        <li>{t('sections.collection.items.cookies')}</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.purpose.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.purpose.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.sharing.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.sharing.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.rights.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.rights.content')}</p>
                    <ul style={{ listStyle: 'disc', paddingRight: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        <li>{t('sections.rights.items.access')}</li>
                        <li>{t('sections.rights.items.correction')}</li>
                        <li>{t('sections.rights.items.deletion')}</li>
                        <li>{t('sections.rights.items.withdraw')}</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.security.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.security.content')}</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{t('sections.contact.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{t('sections.contact.content')}</p>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.5rem' }}>support@collab.sa</p>
                </section>

                <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    <p>{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>
                </section>
            </div>
        </div>
    );
}
