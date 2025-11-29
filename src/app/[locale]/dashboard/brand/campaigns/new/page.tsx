import CampaignForm from "@/components/dashboard/CampaignForm";
import { useTranslations } from 'next-intl';

export default function NewCampaignPage() {
    const t = useTranslations('Dashboard.Brand.NewCampaign');

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>{t('title')}</h2>
            <CampaignForm />
        </div>
    );
}
