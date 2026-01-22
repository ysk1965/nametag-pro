'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Github, Twitter, Mail, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/language-switcher';

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Mail, href: '#', label: 'Email' },
];

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: t('features'), href: '#features', isExternal: true },
      { label: t('howItWorks'), href: '#how-it-works', isExternal: true },
      { label: t('pricing'), href: '#', isExternal: true },
      { label: t('faq'), href: '#', isExternal: true },
    ],
    company: [
      { label: t('about'), href: '#', isExternal: true },
      { label: t('blog'), href: '#', isExternal: true },
      { label: t('careers'), href: '#', isExternal: true },
      { label: t('contact'), href: '#', isExternal: true },
    ],
    legal: [
      { label: t('privacy'), href: '/privacy', isExternal: false },
      { label: t('terms'), href: '#', isExternal: true },
      { label: t('cookies'), href: '#', isExternal: true },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-slate-800">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-2 rounded-lg shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-xl font-bold">NameTag Pro</span>
            </motion.div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              {t('description')}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} className="text-slate-400" />
                </motion.a>
              ))}
              <div className="ml-2">
                <LanguageSwitcher variant="footer" />
              </div>
            </div>
          </div>

          {/* 링크 섹션들 */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('product')}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('company')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            {t('copyright', { year: currentYear })}
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            {t('madeWith')} <Heart size={14} className="text-red-500 mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
