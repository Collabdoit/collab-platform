'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'ar' ? 'en' : 'ar';
        // Replace the locale in the pathname
        // e.g. /ar/about -> /en/about
        // e.g. /ar -> /en
        const segments = pathname.split('/');
        segments[1] = nextLocale;
        const nextPath = segments.join('/');

        startTransition(() => {
            router.replace(nextPath);
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            disabled={isPending}
            style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            {locale === 'ar' ? 'English' : 'العربية'}
        </button>
    );
}
