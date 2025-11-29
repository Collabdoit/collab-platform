import { Mail, MapPin, Phone } from 'lucide-react';
import styles from './contact.module.css';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
    const t = useTranslations('ContactPage');

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.info}>
                        <h2>{t('title')}</h2>
                        <p>
                            {t('desc')}
                        </p>

                        <ul className={styles.contactDetails}>
                            <li className={styles.contactItem}>
                                <Mail className="text-primary" />
                                <span>{t('email')}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <Phone className="text-primary" />
                                <span>+966 11 123 4567</span>
                            </li>
                            <li className={styles.contactItem}>
                                <MapPin className="text-primary" />
                                <span>{t('location')}</span>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.formWrapper}>
                        <form>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.label}>{t('form.nameLabel')}</label>
                                <input type="text" id="name" className={styles.input} placeholder={t('form.namePlaceholder')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>{t('form.emailLabel')}</label>
                                <input type="email" id="email" className={styles.input} placeholder={t('form.emailPlaceholder')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message" className={styles.label}>{t('form.messageLabel')}</label>
                                <textarea id="message" className={styles.textarea} placeholder={t('form.messagePlaceholder')}></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                {t('form.submit')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
