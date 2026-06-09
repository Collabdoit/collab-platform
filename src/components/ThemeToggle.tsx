'use client';

import { useState, useEffect } from 'react';

const STYLE = {
  toggle: {
    position: 'fixed' as const,
    bottom: '20px',
    insetInlineStart: '20px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    zIndex: 999,
    transition: 'all 250ms ease',
    boxShadow: 'var(--shadow-md)',
  },
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <button
      onClick={toggle}
      style={STYLE.toggle}
      title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
