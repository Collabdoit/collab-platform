'use client';

import {
  Package, BriefcaseBusiness, Microscope, Calendar, Search, Target,
  Star, Copy, Download, Eye
} from 'lucide-react';
import styles from './deliverables.module.css';

const demoDeliverables = [
  {
    id: '1', title: 'تقويم المحتوى لشهر يوليو', agentName: 'نورة', agentAvatar: <BriefcaseBusiness size={20} />,
    agentColor: '#8B5CF6', skillName: 'تقويم المحتوى', skillIcon: <Calendar size={14} />,
    rating: 5, createdAt: 'منذ ٥ دقائق',
    preview: 'تقويم مفصل لـ 4 أسابيع مع مواعيد النشر والمنصات المستهدفة وهاشتاقات مقترحة...',
  },
  {
    id: '2', title: 'تدقيق SEO للموقع الجديد', agentName: 'ريم', agentAvatar: <Microscope size={20} />,
    agentColor: '#10B981', skillName: 'تدقيق SEO', skillIcon: <Search size={14} />,
    rating: 4, createdAt: 'منذ ساعة',
    preview: 'تقرير شامل: تقييم 78/100 مع 12 توصية للتحسين. أبرز المشاكل: سرعة الموقع و...',
  },
  {
    id: '3', title: 'خطاطيف سوشيال ميديا', agentName: 'نورة', agentAvatar: <BriefcaseBusiness size={20} />,
    agentColor: '#8B5CF6', skillName: 'خطاطيف السوشيال', skillIcon: <Target size={14} />,
    rating: null, createdAt: 'منذ يوم',
    preview: '15 خطاف جذاب لتويتر وإنستغرام وتيك توك مع اقتراحات صور وهاشتاقات...',
  },
];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className={styles.noRating}>لم يُقيّم بعد</span>;
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} fill={s <= rating ? '#F59E0B' : 'none'} color={s <= rating ? '#F59E0B' : 'var(--text-muted)'} />
      ))}
    </div>
  );
}

export default function DeliverablesClient() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><Package size={22} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '8px' }} />التسليمات</h1>
        <p className={styles.subtitle}>جميع المخرجات التي أنجزها موظفوك</p>
      </div>

      <div className={styles.list}>
        {demoDeliverables.map((d, i) => (
          <div key={d.id} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardAvatar} style={{ background: `${d.agentColor}15`, color: d.agentColor }}>
                {d.agentAvatar}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>{d.title}</div>
                <div className={styles.cardMeta} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {d.agentName} • <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{d.skillIcon} {d.skillName}</span> • {d.createdAt}
                </div>
              </div>
              <StarRating rating={d.rating} />
            </div>
            <div className={styles.cardPreview}>{d.preview}</div>
            <div className={styles.cardActions}>
              <button className="btn btn-secondary btn-sm"><Copy size={13} /> نسخ</button>
              <button className="btn btn-secondary btn-sm"><Download size={13} /> تحميل</button>
              <button className="btn btn-primary btn-sm"><Eye size={13} /> عرض كامل</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
