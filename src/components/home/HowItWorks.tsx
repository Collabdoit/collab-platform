import styles from './HowItWorks.module.css';
import { useTranslations } from 'next-intl';

export default function HowItWorks() {
    const t = useTranslations('HomePage.HowItWorks');

    const steps = [
        {
            title: t('step1Title'),
            description: t('step1Desc'),
            image: "/step_connect.svg"
        },
        {
            title: t('step2Title'),
            description: t('step2Desc'),
            image: "/step_connect.svg" // Reusing for now, ideally distinct
        },
        {
            title: t('step3Title'),
            description: t('step3Desc'),
            image: "/step_ship.svg"
        },
        {
            title: t('step4Title'),
            description: t('step4Desc'),
            image: "/step_track.svg"
        }
    ];

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('title')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
                </div>

                <div className={styles.steps}>
                    {steps.map((step, index) => (
                        <div key={index} className={styles.step}>
                            <div className={styles.stepImage}>
                                <img src={step.image} alt={step.title} />
                            </div>
                            <div className={styles.stepContent}>
                                <div className={styles.stepNumber}>{index + 1}</div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
