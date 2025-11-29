'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function CreatorProfileForm() {
    const [formData, setFormData] = useState({
        bio: '',
        city: '',
        phone: '',
        instagram: '',
        tiktok: '',
        snapchat: '',
        twitter: '',
        gcamLicenseStatus: 'NONE',
        gcamLicenseImage: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call to save profile
        console.log('Saving profile:', formData);
        alert('تم حفظ الملف الشخصي بنجاح (محاكاة)');
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>المعلومات الشخصية</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>نبذة عنك</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', minHeight: '100px' }}
                        placeholder="اكتب نبذة مختصرة عنك وعن محتواك..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>المدينة</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>رقم الجوال</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="05xxxxxxxx"
                        />
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>حسابات التواصل الاجتماعي</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instagram</label>
                        <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="@username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>TikTok</label>
                        <input
                            type="text"
                            name="tiktok"
                            value={formData.tiktok}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="@username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Snapchat</label>
                        <input
                            type="text"
                            name="snapchat"
                            value={formData.snapchat}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="@username"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>X (Twitter)</label>
                        <input
                            type="text"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="@username"
                        />
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>رخصة الإعلان (GCAM)</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>حالة الرخصة</label>
                    <select
                        name="gcamLicenseStatus"
                        value={formData.gcamLicenseStatus}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                    >
                        <option value="NONE">لا أملك رخصة</option>
                        <option value="PENDING">جاري استخراجها</option>
                        <option value="ACTIVE">مفعلة (موثوق)</option>
                        <option value="EXPIRED">منتهية</option>
                    </select>
                </div>

                {formData.gcamLicenseStatus === 'ACTIVE' && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>صورة الترخيص</label>
                        <input
                            type="text"
                            name="gcamLicenseImage"
                            value={formData.gcamLicenseImage}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                            placeholder="رابط صورة الترخيص (للتجربة)"
                        />
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            يرجى رفع صورة واضحة لترخيص "موثوق" الصادر من الهيئة العامة للإعلام المرئي والمسموع.
                        </p>
                    </div>
                )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                <Save size={20} />
                <span>حفظ التغييرات</span>
            </button>
        </form>
    );
}
