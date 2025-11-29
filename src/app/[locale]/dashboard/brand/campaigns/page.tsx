'use client';

import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CampaignsPage() {
    const t = useTranslations('Dashboard.Brand');

    // Mock Data
    const campaigns = [
        { id: 1, name: 'حملة إطلاق منتج القهوة المختصة', status: 'ACTIVE', participants: 12, totalReach: '150K' },
        { id: 2, name: 'تخفيضات نهاية العام', status: 'UNDER_REVIEW', participants: 0, totalReach: '-' },
        { id: 3, name: 'مسابقة التصوير الفوتوغرافي', status: 'COMPLETED', participants: 45, totalReach: '500K' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('myCampaigns')}</h1>
                <Link href="/dashboard/brand/campaigns/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} />
                    <span>{t('newCampaign')}</span>
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontWeight: 600, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                    <div>{t('table.campaignName')}</div>
                    <div>{t('table.status')}</div>
                    <div>{t('table.participants')}</div>
                    <div>{t('stats.totalReach')}</div>
                    <div>{t('table.actions')}</div>
                </div>

                {campaigns.map((campaign) => (
                    <div key={campaign.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{campaign.name}</div>
                        <div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                backgroundColor: campaign.status === 'ACTIVE' ? '#D1FAE5' : campaign.status === 'UNDER_REVIEW' ? '#FEF3C7' : '#E5E7EB',
                                color: campaign.status === 'ACTIVE' ? '#065F46' : campaign.status === 'UNDER_REVIEW' ? '#92400E' : '#374151'
                            }}>
                                {campaign.status === 'ACTIVE' ? t('table.active') : campaign.status === 'UNDER_REVIEW' ? t('table.underReview') : 'Completed'}
                            </span>
                        </div>
                        <div>{campaign.participants}</div>
                        <div>{campaign.totalReach}</div>
                        <div>
                            <Link href={`/dashboard/brand/campaigns/${campaign.id}`} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500 }}>
                                <Eye size={16} />
                                <span>{t('table.viewDetails')}</span>
                            </Link>
                        </div>
                    </div>
                ))}

                {campaigns.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No campaigns found. Start your first campaign today!
                    </div>
                )}
            </div>
        </div>
    );
}
