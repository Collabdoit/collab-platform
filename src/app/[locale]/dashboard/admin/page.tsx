import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>لوحة تحكم الإدارة</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>تراخيص بانتظار المراجعة</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>12</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>إجمالي المستخدمين</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>156</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>حملات نشطة</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>8</div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>طلبات توثيق رخصة GCAM</h3>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontWeight: 600, display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr' }}>
                    <div>صانع المحتوى</div>
                    <div>رقم الترخيص</div>
                    <div>صورة الترخيص</div>
                    <div>الإجراء</div>
                </div>

                {/* Mock Data */}
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>أحمد محمد {i}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ahmed{i}@example.com</div>
                        </div>
                        <div>1029384756</div>
                        <div>
                            <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>عرض الصورة</a>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{ color: '#03543F' }} title="قبول"><CheckCircle size={20} /></button>
                            <button style={{ color: '#9B1C1C' }} title="رفض"><XCircle size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
