'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Trash2, Building2, ShoppingBag, Users as UsersIcon,
  Trophy, FileText, Loader2, CheckCircle2, X
} from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'brand', label: 'العلامة التجارية', icon: <Building2 size={16} />, color: '#8B5CF6', desc: 'اسم الشركة، الرؤية، القيم، نبرة الصوت' },
  { value: 'product', label: 'المنتجات والخدمات', icon: <ShoppingBag size={16} />, color: '#F59E0B', desc: 'وصف المنتجات، الأسعار، المميزات' },
  { value: 'audience', label: 'الجمهور المستهدف', icon: <UsersIcon size={16} />, color: '#10B981', desc: 'الفئة العمرية، الاهتمامات، السلوك' },
  { value: 'competitor', label: 'المنافسون', icon: <Trophy size={16} />, color: '#EF4444', desc: 'تحليل المنافسين، نقاط القوة والضعف' },
  { value: 'guidelines', label: 'إرشادات عامة', icon: <FileText size={16} />, color: '#3B82F6', desc: 'قواعد المحتوى، الممنوعات، الأسلوب' },
];

export default function TrainingClient() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('brand');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.knowledge || []);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addEntry() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, title: title.trim(), content: content.trim() }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setShowForm(false);
        setNotification('تم حفظ المعلومات — كل الموظفين سيستخدمونها الآن');
        setTimeout(() => setNotification(null), 3000);
        fetchEntries();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries(prev => prev.filter(e => e.id !== id));
        setNotification('تم حذف المعلومات');
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 999,
          boxShadow: '0 8px 32px rgba(16,185,129,0.3)', fontSize: '0.9rem',
          animation: 'slideDown 0.3s ease-out',
        }}>
          <CheckCircle2 size={18} /> {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'
        }}>
          <BookOpen size={28} style={{ color: '#8B5CF6' }} />
          تدريب الموظفين
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          أضف معلومات شركتك هنا — كل الموظفين سيتعلمونها ويستخدمونها في ردودهم تلقائياً.
          <br />
          كل ما تضيفه من منتجات، خدمات، إرشادات، أو معلومات عن جمهورك سيصبح جزء من معرفة الفريق.
        </p>
      </div>

      {/* Category Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '0.75rem', marginBottom: '1.5rem'
      }}>
        {CATEGORIES.map(cat => {
          const count = entries.filter(e => e.category === cat.value).length;
          return (
            <div key={cat.value} style={{
              padding: '1rem', borderRadius: '0.75rem',
              background: `${cat.color}08`, border: `1px solid ${cat.color}20`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => { setSelectedCategory(cat.value); setShowForm(true); }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.color}50`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.color}20`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: cat.color }}>
                {cat.icon}
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.label}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{cat.desc}</div>
              <div style={{ fontSize: '0.75rem', color: cat.color, fontWeight: 600 }}>{count} معلومة</div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: getCategoryInfo(selectedCategory).color }}>
              <Plus size={18} /> إضافة معلومة — {getCategoryInfo(selectedCategory).label}
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
              borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="العنوان (مثال: منتجاتنا الرئيسية)"
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
              borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="المحتوى — اكتب كل المعلومات التي تريد الموظفين يعرفونها عن هذا الموضوع. كل ما كتبت أكثر كل ما كانت ردودهم أدق."
            rows={6}
            style={{
              width: '100%', padding: '0.75rem', marginBottom: '1rem',
              borderRadius: '0.5rem', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '0.9rem', resize: 'vertical', lineHeight: 1.6,
            }}
          />

          <button
            onClick={addEntry}
            disabled={saving || !title.trim() || !content.trim()}
            style={{
              padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none',
              background: saving ? '#666' : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري الحفظ...</> : <><CheckCircle2 size={16} /> حفظ وتدريب الفريق</>}
          </button>
        </div>
      )}

      {/* Add Button (when form is hidden) */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: '1rem', marginBottom: '1.5rem',
            borderRadius: '0.75rem', border: '2px dashed var(--border-subtle)',
            background: 'transparent', color: '#8B5CF6', fontSize: '0.9rem',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B5CF6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'; }}
        >
          <Plus size={18} /> إضافة معلومات تدريبية جديدة
        </button>
      )}

      {/* Entries List */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          قاعدة المعرفة ({entries.length} معلومة)
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem', color: 'var(--text-muted)',
            background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)',
          }}>
            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>ما عندك معلومات تدريبية بعد</p>
            <p style={{ fontSize: '0.8rem' }}>أضف معلومات عن شركتك ومنتجاتك وجمهورك عشان الموظفين يقدرون يساعدونك بشكل أفضل</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {entries.map(entry => {
              const catInfo = getCategoryInfo(entry.category);
              return (
                <div key={entry.id} style={{
                  padding: '1rem 1.25rem', borderRadius: '0.75rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.7rem',
                        fontWeight: 600, background: `${catInfo.color}15`, color: catInfo.color,
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{entry.title}</span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap', maxHeight: '120px', overflow: 'hidden',
                  }}>
                    {entry.content}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {new Date(entry.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translate(-50%, -1rem); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
