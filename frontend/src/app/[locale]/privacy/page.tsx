'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">{t('backToHome')}</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
              <p className="text-slate-500 mt-1">{t('lastUpdated')}: 2025-01-22</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="prose prose-slate max-w-none">
            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section1.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section1.content')}</p>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section2.title')}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">{t('section2.content')}</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>{t('section2.item1')}</li>
                <li>{t('section2.item2')}</li>
                <li>{t('section2.item3')}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section3.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section3.content')}</p>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section4.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section4.content')}</p>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section5.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section5.content')}</p>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section6.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section6.content')}</p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('section7.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('section7.content')}</p>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-xl p-6 mt-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('contact.title')}</h2>
              <p className="text-slate-600 leading-relaxed">{t('contact.content')}</p>
              <p className="text-slate-600 mt-2">
                <strong>{t('contact.email')}:</strong> support@nametag-pro.com
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
