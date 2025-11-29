import Link from 'next/link';
import { Package, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MyApplicationsPage() {
    const t = useTranslations('Dashboard.Creator.Applications');
    // Mock Data
    const applications = [
        {
            id: 101,
            campaign: 'حملة إطلاق منتج القهوة المختصة',
            brand: 'قهوة اليوم',
            status: 'SHIPPED',
            trackingNumber: 'SA123456789',
            date: '2023-11-20',
        },
        {
            id: 102,
            campaign: 'تغطية افتتاح فرع جديد',
            brand: 'مطاعم السعادة',
            status: 'PENDING',
            trackingNumber: null,
            date: '2023-11-22',
        },
        {
            id: 103,
            campaign: 'مراجعة سماعات بلوتوث',
            brand: 'تيك زون',
            status: 'APPROVED',
            trackingNumber: null,
            date: '2023-11-21',
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>{t('statuses.underReview')}</span>;
            case 'APPROVED': return <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>{t('statuses.approved')}</span>;
            case 'SHIPPED': return <span style={{ backgroundColor: '#E0E7FF', color: '#4338CA', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>{t('statuses.shipped')}</span>;
            case 'COMPLETED': return <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>{t('statuses.completed')}</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>{t('title')}</h2>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontWeight: 600, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                    <div>{t('table.campaign')}</div>
                    <div>{t('table.date')}</div>
                    <div>{t('table.status')}</div>
                    <div>{t('table.actions')}</div>
                </div>

                {applications.map((app) => (
                    <div key={app.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{app.campaign}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.brand}</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{app.date}</div>
                        <div>{getStatusBadge(app.status)}</div>
                        <div>
                            {app.status === 'SHIPPED' && (
                                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Package size={14} />
                                    <span>{t('actions.trackShipment')}</span>
                                </button>
                            )}
                            {app.status === 'APPROVED' && (
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('statuses.awaitingShipping')}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
