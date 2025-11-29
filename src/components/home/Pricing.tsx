import { Check } from 'lucide-react';
import Link from 'next/link';
import styles from './Pricing.module.css';
import { useTranslations } from 'next-intl';

export default function Pricing() {
    const t = useTranslations('HomePage.Pricing');

    const plans = [
        {
            name: t('starterName'),
            price: t('starterPrice'),
            features: [
                t('starterFeatures.0'),
                t('starterFeatures.1'),
                t('starterFeatures.2'),
                t('starterFeatures.3')
            ],
            cta: t('starterCta'),
            primary: false
        },
        {
            name: t('growthName'),
            price: t('growthPrice'),
            features: [
                t('growthFeatures.0'),
                t('growthFeatures.1'),
                t('growthFeatures.2'),
                t('growthFeatures.3'),
                t('growthFeatures.4')
            ],
            cta: t('growthCta'),
            primary: true
        },
        {
            name: t('enterpriseName'),
            price: t('enterprisePrice'),
            features: [
                t('enterpriseFeatures.0'),
                t('enterpriseFeatures.1'),
                t('enterpriseFeatures.2'),
                t('enterpriseFeatures.3'),
                t('enterpriseFeatures.4')
            ],
            cta: t('enterpriseCta'),
            primary: false
        }
    ];

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('title')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
                </div>

                <div className={styles.grid}>
                    {plans.map((plan, index) => (
                        <div key={index} className={styles.card} style={plan.primary ? { borderColor: 'var(--color-primary)', backgroundColor: 'rgba(0, 108, 53, 0.02)' } : {}}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.price}>{plan.price}</div>
                            </div>

                            <ul className={styles.features}>
                                {plan.features.map((feature, i) => (
                                    <li key={i} className={styles.feature}>
                                        <Check size={20} className={styles.check} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/contact"
                                className={`btn ${plan.primary ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%' }}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
