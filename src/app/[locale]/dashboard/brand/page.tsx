import Link from 'next/link';
import { Plus, BarChart2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BrandDashboardPage() {
    const t = useTranslations('Dashboard.Brand');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('myCampaigns')}</h2>
                <Link href="/dashboard/brand/campaigns/new" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Plus size={20} />
                    <span>{t('newCampaign')}</span>
                </Link>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('stats.activeCampaigns')}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>3</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('stats.creators')}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>45</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('stats.totalReach')}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>1.2M</div>
                </div>
            </div>

            {/* Campaigns List */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontWeight: 600, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                    <div>{t('table.campaignName')}</div>
                    <div>{t('table.status')}</div>
                    <div>{t('table.participants')}</div>
                    <div>{t('table.actions')}</div>
                </div>

                {/* Mock Data */}
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}>
                        <div style={{ fontWeight: 500 }}>حملة إطلاق منتج القهوة {i}</div>
                        <div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                backgroundColor: i === 1 ? '#DEF7EC' : '#FEECDC',
                                color: i === 1 ? '#03543F' : '#92400E'
                            }}>
                                {i === 1 ? t('table.active') : t('table.underReview')}
                            </span>
                        </div>
                        <div>15</div>
                        <div>
                            <button style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{t('table.viewDetails')}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
