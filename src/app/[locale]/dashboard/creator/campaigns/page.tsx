'use client';

import { useState } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BrowseCampaignsPage() {
    const t = useTranslations('Dashboard.Creator.Campaigns');
    const [filter, setFilter] = useState('all');

    // Mock Data
    const campaigns = [
        {
            id: 1,
            title: 'حملة إطلاق منتج القهوة المختصة',
            brand: 'قهوة اليوم',
            image: '/placeholder-coffee.jpg',
            platform: 'Instagram',
            budget: 'منتج مجاني + 200 ريال',
            requirements: 'فيديو ريلز 15 ثانية',
        },
        {
            id: 2,
            title: 'تغطية افتتاح فرع جديد',
            brand: 'مطاعم السعادة',
            image: '/placeholder-restaurant.jpg',
            platform: 'TikTok',
            budget: 'دعوة VIP + 500 ريال',
            requirements: 'تغطية ستوري 3 سنابات',
        },
        {
            id: 3,
            title: 'مراجعة سماعات بلوتوث',
            brand: 'تيك زون',
            image: '/placeholder-tech.jpg',
            platform: 'YouTube',
            budget: 'منتج مجاني (قيمة 800 ريال)',
            requirements: 'فيديو مراجعة تفصيلي',
        }
    ];

    const handleApply = (id: number) => {
        // In a real app, this would call an API
        alert(`تم تقديم طلبك للحملة رقم ${id} بنجاح!`);
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t('title')}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Filter size={20} />
                        <span>{t('filter')}</span>
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {campaigns.map((campaign) => (
                    <div key={campaign.id} style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}>
                        <div style={{ height: '160px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                            صورة الحملة
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#F3F4F6', borderRadius: '999px', color: 'var(--text-secondary)' }}>{campaign.brand}</span>
                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#EEF2FF', borderRadius: '999px', color: 'var(--color-primary)' }}>{campaign.platform}</span>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{campaign.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{campaign.requirements}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{campaign.budget}</span>
                                <button
                                    onClick={() => handleApply(campaign.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    {t('apply')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
