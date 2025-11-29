import { Users, BarChart3, ShieldCheck, FileText } from 'lucide-react';
import styles from './ValueProps.module.css';
import { useTranslations } from 'next-intl';

export default function ValueProps() {
    const t = useTranslations('HomePage.ValueProps');

    const features = [
        {
            icon: "/icon_authentic.svg",
            title: t('authenticTitle'),
            description: t('authenticDesc')
        },
        {
            icon: "/icon_management.svg",
            title: t('managementTitle'),
            description: t('managementDesc')
        },
        {
            icon: "/icon_risk.svg",
            title: t('riskTitle'),
            description: t('riskDesc')
        },
        {
            icon: "/icon_reports.svg",
            title: t('reportsTitle'),
            description: t('reportsDesc')
        }
    ];

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('title')}</h2>
                    <p className={styles.subtitle}>{t('subtitle')}</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>
                                <img src={feature.icon} alt={feature.title} style={{ width: '48px', height: '48px' }} />
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardText}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
