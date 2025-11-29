'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Truck, ExternalLink, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Applicant {
    id: number;
    name: string;
    instagram: string;
    status: string;
    followers: string;
    shippingAddress?: string;
    trackingNumber?: string;
    postLink?: string;
}

export default function ManageCampaignPage({ params }: { params: { id: string } }) {
    const t = useTranslations('Dashboard.Brand.CampaignDetails');
    // Mock Data - In real app, fetch based on params.id
    const campaign = {
        id: params.id,
        title: 'حملة إطلاق منتج القهوة المختصة',
        status: 'ACTIVE',
        applicants: [
            { id: 1, name: 'أحمد محمد', instagram: '@ahmed_coffee', status: 'PENDING', followers: '15K' },
            { id: 2, name: 'سارة علي', instagram: '@sara.lifestyle', status: 'APPROVED', followers: '45K', shippingAddress: 'الرياض، حي الملز...' },
            { id: 3, name: 'خالد عمر', instagram: '@khaled.vlogs', status: 'SHIPPED', followers: '22K', trackingNumber: 'SA123456789' },
            { id: 4, name: 'نورة سعد', instagram: '@noura.beauty', status: 'POSTED', followers: '80K', postLink: 'https://instagram.com/...' },
        ] as Applicant[]
    };

    const [applicants, setApplicants] = useState<Applicant[]>(campaign.applicants);
    const [trackingInput, setTrackingInput] = useState<{ [key: number]: string }>({});

    const handleStatusChange = (id: number, newStatus: string) => {
        setApplicants(prev => prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
    };

    const handleAddTracking = (id: number) => {
        const tracking = trackingInput[id];
        if (tracking) {
            setApplicants(prev => prev.map(app =>
                app.id === id ? { ...app, status: 'SHIPPED', trackingNumber: tracking } : app
            ));
            alert(`تم إضافة رقم التتبع ${tracking} للمستخدم رقم ${id}`);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return t('statuses.newRequest');
            case 'APPROVED': return t('statuses.awaitingShipping');
            case 'SHIPPED': return t('statuses.shipped');
            case 'POSTED': return t('statuses.posted');
            default: return status;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('title')}: {campaign.title}</h2>
                <div style={{ color: 'var(--text-secondary)' }}>{t('id')}: {campaign.id} • {t('status')}: <span style={{ color: '#059669', fontWeight: 600 }}>{t('active')}</span></div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontWeight: 600, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr' }}>
                    <div>{t('table.creator')}</div>
                    <div>{t('table.followers')}</div>
                    <div>{t('table.status')}</div>
                    <div>{t('table.actions')}</div>
                </div>

                {applicants.map((app) => (
                    <div key={app.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{app.name}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>{app.instagram}</div>
                            {app.status !== 'PENDING' && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{app.shippingAddress}</div>}
                        </div>

                        <div>{app.followers}</div>

                        <div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                backgroundColor: app.status === 'PENDING' ? '#FEF3C7' : app.status === 'APPROVED' ? '#DBEAFE' : app.status === 'SHIPPED' ? '#E0E7FF' : '#D1FAE5',
                                color: app.status === 'PENDING' ? '#92400E' : app.status === 'APPROVED' ? '#1E40AF' : app.status === 'SHIPPED' ? '#4338CA' : '#065F46'
                            }}>
                                {getStatusText(app.status)}
                            </span>
                        </div>

                        <div>
                            {app.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleStatusChange(app.id, 'APPROVED')} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>{t('actions.approve')}</button>
                                    <button onClick={() => handleStatusChange(app.id, 'REJECTED')} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#9B1C1C', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>{t('actions.reject')}</button>
                                </div>
                            )}

                            {app.status === 'APPROVED' && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder={t('actions.trackingNumber')}
                                        onChange={(e) => setTrackingInput(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', width: '120px' }}
                                    />
                                    <button onClick={() => handleAddTracking(app.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', gap: '0.25rem' }}>
                                        <Truck size={14} />
                                        <span>{t('actions.ship')}</span>
                                    </button>
                                </div>
                            )}

                            {app.status === 'SHIPPED' && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {t('actions.trackingNumber')}: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{app.trackingNumber}</span>
                                </div>
                            )}

                            {app.status === 'POSTED' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <a href={app.postLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', gap: '0.25rem', color: 'var(--color-primary)' }}>
                                        <ExternalLink size={14} />
                                        <span>{t('actions.viewPost')}</span>
                                    </a>
                                    <button onClick={() => handleStatusChange(app.id, 'COMPLETED')} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', gap: '0.25rem' }}>
                                        <CheckCircle size={14} />
                                        <span>{t('actions.verify')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
