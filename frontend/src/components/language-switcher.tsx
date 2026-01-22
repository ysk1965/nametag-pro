'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'footer';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('languageSwitcher');

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const localeLabels: Record<string, string> = {
    ko: '한국어',
    en: 'EN',
  };

  if (variant === 'footer') {
    return (
      <div className="flex items-center gap-1">
        {routing.locales.map((loc, index) => (
          <span key={loc} className="flex items-center">
            <button
              onClick={() => handleLocaleChange(loc)}
              className={`text-sm transition-colors ${
                locale === loc
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {localeLabels[loc]}
            </button>
            {index < routing.locales.length - 1 && (
              <span className="text-slate-600 mx-2">/</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            locale === loc
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
