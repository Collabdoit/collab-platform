import Pricing from '@/components/home/Pricing';
import { useTranslations } from 'next-intl';

export default function PricingPage() {
    const t = useTranslations('HomePage.Pricing');

    return (
        <div style={{ paddingTop: '4rem' }}>
            <Pricing />

            <div className="container" style={{ textAlign: 'center', paddingBottom: '4rem' }}>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    {t('enterprisePrice') === 'Custom' || t('enterprisePrice') === 'مخصص' ?
                        (t('enterpriseCta') === 'Contact Sales' ? 'Need a custom plan? Contact our sales team.' : 'هل تحتاج خطة مخصصة؟ تواصل مع فريق المبيعات.')
                        : ''}
                </p>
            </div>
        </div>
    );
}
