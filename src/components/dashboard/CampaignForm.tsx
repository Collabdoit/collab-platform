'use client';

import { useState } from 'react';
import { Save, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CampaignForm() {
    const t = useTranslations('Dashboard.Brand.CampaignForm');
    const [formData, setFormData] = useState({
        title: '',
        productName: '',
        description: '',
        platforms: {
            instagram: false,
            tiktok: false,
            snapchat: false,
            twitter: false
        },
        budget: '',
        requirements: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformChange = (platform: string) => {
        setFormData(prev => ({
            ...prev,
            platforms: {
                ...prev.platforms,
                // @ts-ignore
                [platform]: !prev.platforms[platform]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Creating campaign:', formData);
        alert(t('successMessage'));
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{t('title')}</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('campaignTitleLabel')}</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                        placeholder={t('campaignTitlePlaceholder')}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('productNameLabel')}</label>
                    <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('descriptionLabel')}</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', minHeight: '100px' }}
                        placeholder={t('descriptionPlaceholder')}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{t('platformsTitle')}</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.platforms.instagram}
                            onChange={() => handlePlatformChange('instagram')}
                        />
                        <span>Instagram</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.platforms.tiktok}
                            onChange={() => handlePlatformChange('tiktok')}
                        />
                        <span>TikTok</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.platforms.snapchat}
                            onChange={() => handlePlatformChange('snapchat')}
                        />
                        <span>Snapchat</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.platforms.twitter}
                            onChange={() => handlePlatformChange('twitter')}
                        />
                        <span>X (Twitter)</span>
                    </label>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{t('requirementsTitle')}</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('contentRequirementsLabel')}</label>
                    <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', minHeight: '80px' }}
                        placeholder={t('contentRequirementsPlaceholder')}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t('budgetLabel')}</label>
                    <input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                        placeholder={t('budgetPlaceholder')}
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                <Plus size={20} />
                <span>{t('submitButton')}</span>
            </button>
        </form>
    );
}
