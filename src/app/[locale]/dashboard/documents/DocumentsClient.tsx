'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Upload, Trash2, Download, Eye, Image as ImageIcon,
  File, FileSpreadsheet, Loader2, X, Filter, Bot, User as UserIcon,
  CheckCircle2, FolderOpen, MessageCircle, Paperclip
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  url: string;
  source: string;
  agentName: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={24} style={{ color: '#EF4444' }} />,
  image: <ImageIcon size={24} style={{ color: '#3B82F6' }} />,
  doc: <File size={24} style={{ color: '#6366F1' }} />,
  csv: <FileSpreadsheet size={24} style={{ color: '#10B981' }} />,
  other: <File size={24} style={{ color: '#6B7280' }} />,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: '#EF4444', image: '#3B82F6', doc: '#6366F1', csv: '#10B981', other: '#6B7280',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  const diffDay = Math.floor(diffHr / 24);
  return `منذ ${diffDay} يوم`;
}

export default function DocumentsClient() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      let url = '/api/documents';
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterSource) params.set('source', filterSource);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSource]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', 'user_upload');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setNotification(`✅ تم رفع "${file.name}" بنجاح`);
        setTimeout(() => setNotification(null), 3000);
        fetchDocs();
      } else {
        const err = await res.json();
        setNotification(`❌ ${err.error || 'فشل في الرفع'}`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setNotification('❌ فشل في رفع الملف');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDoc(id: string, name: string) {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setNotification(`🗑️ تم حذف "${name}"`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      console.error('Delete failed');
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }

  const filtered = documents;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: notification.startsWith('❌') ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', fontSize: '0.9rem',
        }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'
          }}>
            <FolderOpen size={28} style={{ color: '#6366F1' }} />
            المستندات
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            جميع الملفات — مرفوعة من المستخدم أو أنشأها الموظفون
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.7rem 1.5rem', borderRadius: '0.6rem', border: 'none',
            background: uploading ? '#666' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
          {uploading ? 'جاري الرفع...' : 'رفع ملف'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.csv,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.txt,.json"
          style={{ display: 'none' }}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          padding: '2rem', marginBottom: '1.5rem', borderRadius: '0.75rem',
          border: `2px dashed ${dragOver ? '#6366F1' : 'var(--border-subtle)'}`,
          background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
          textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} style={{ color: dragOver ? '#6366F1' : 'var(--text-muted)', marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          اسحب الملفات هنا أو اضغط للاختيار
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
          PDF, صور, CSV, Word, PowerPoint — حد أقصى 10MB
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {[
          { key: null, label: 'الكل' },
          { key: 'pdf', label: 'PDF' },
          { key: 'image', label: 'صور' },
          { key: 'doc', label: 'مستندات' },
          { key: 'csv', label: 'CSV' },
        ].map(f => (
          <button
            key={f.key || 'all'}
            onClick={() => setFilterType(f.key)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
              border: `1px solid ${filterType === f.key ? '#6366F1' : 'var(--border-subtle)'}`,
              background: filterType === f.key ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: filterType === f.key ? '#6366F1' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: filterType === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}

        <span style={{ color: 'var(--border-subtle)', margin: '0 0.25rem' }}>|</span>

        {[
          { key: null, label: 'الكل', icon: null },
          { key: 'user_upload', label: 'مرفوع', icon: <UserIcon size={12} /> },
          { key: 'agent_generated', label: 'من الموظف', icon: <Bot size={12} /> },
          { key: 'chat_attachment', label: 'من المحادثة', icon: <MessageCircle size={12} /> },
        ].map(f => (
          <button
            key={f.key || 'all-src'}
            onClick={() => setFilterSource(f.key)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
              border: `1px solid ${filterSource === f.key ? '#8B5CF6' : 'var(--border-subtle)'}`,
              background: filterSource === f.key ? 'rgba(139,92,246,0.1)' : 'transparent',
              color: filterSource === f.key ? '#8B5CF6' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: filterSource === f.key ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)',
          background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)',
        }}>
          <FolderOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>لا توجد مستندات</p>
          <p style={{ fontSize: '0.8rem' }}>ارفع ملف أو اطلب من موظفيك إنشاء تقارير</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(doc => (
            <div key={doc.id} style={{
              padding: '1.25rem', borderRadius: '0.75rem',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              transition: 'all 0.2s', position: 'relative',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = TYPE_COLORS[doc.type] || '#6B7280'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'; }}
            >
              {/* Type icon + name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '0.5rem',
                  background: `${TYPE_COLORS[doc.type] || '#6B7280'}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {TYPE_ICONS[doc.type] || TYPE_ICONS.other}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {formatSize(doc.size)} • {timeAgo(doc.createdAt)}
                  </div>
                </div>
              </div>

              {/* Source badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{
                  padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.65rem',
                  fontWeight: 600,
                  background: doc.source === 'agent_generated' ? 'rgba(139,92,246,0.1)' : doc.source === 'chat_attachment' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                  color: doc.source === 'agent_generated' ? '#8B5CF6' : doc.source === 'chat_attachment' ? '#10B981' : '#6366F1',
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                }}>
                  {doc.source === 'agent_generated' ? <Bot size={10} /> : doc.source === 'chat_attachment' ? <Paperclip size={10} /> : <UserIcon size={10} />}
                  {doc.source === 'agent_generated' ? doc.agentName || 'موظف' : doc.source === 'chat_attachment' ? 'من المحادثة' : 'مرفوع'}
                </span>
                <span style={{
                  padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.65rem',
                  fontWeight: 600, background: `${TYPE_COLORS[doc.type]}10`, color: TYPE_COLORS[doc.type],
                }}>
                  {doc.type.toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '0.4rem', borderRadius: '0.4rem', fontSize: '0.75rem',
                    border: '1px solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  }}
                >
                  <Eye size={12} /> عرض
                </a>
                <a
                  href={doc.url}
                  download={doc.name}
                  style={{
                    flex: 1, padding: '0.4rem', borderRadius: '0.4rem', fontSize: '0.75rem',
                    border: '1px solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  }}
                >
                  <Download size={12} /> تحميل
                </a>
                <button
                  onClick={() => deleteDoc(doc.id, doc.name)}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem',
                    border: '1px solid var(--border-subtle)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#EF4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'; }}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Image preview */}
              {doc.type === 'image' && (
                <div style={{
                  marginTop: '0.75rem', borderRadius: '0.5rem', overflow: 'hidden',
                  border: '1px solid var(--border-subtle)', maxHeight: 150,
                }}>
                  <img src={doc.url} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
