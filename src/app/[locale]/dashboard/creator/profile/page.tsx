import CreatorProfileForm from "@/components/dashboard/CreatorProfileForm";
import { useTranslations } from 'next-intl';

export default function CreatorProfilePage() {
    const t = useTranslations('Dashboard.Creator.Profile');

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>{t('title')}</h2>
            <CreatorProfileForm />
        </div>
    );
}
