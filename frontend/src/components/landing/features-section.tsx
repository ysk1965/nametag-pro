'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Edit, Download, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Bulk Upload',
    description:
      'Import your Excel or CSV list. We support automatic column mapping for names and roles.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    icon: Edit,
    title: 'Interactive Editor',
    description:
      'Drag and drop the name position. Choose fonts, sizes, and colors that match your branding.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    shadowColor: 'shadow-purple-500/20',
  },
  {
    icon: Download,
    title: 'Print-Ready PDF',
    description:
      'Download A4 PDFs with 2x2, 2x3, or 3x3 grids. High 300dpi resolution for crisp text.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    shadowColor: 'shadow-amber-500/20',
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate hundreds of nametags in seconds, not hours.',
    color: 'text-yellow-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is processed locally and never stored on our servers.',
    color: 'text-green-500',
  },
  {
    icon: Globe,
    title: 'Multi-language',
    description: 'Full support for Korean, English, Japanese, and Chinese characters.',
    color: 'text-blue-500',
  },
];

// 애니메이션 설정
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -8,
        rotateX: 5,
        rotateY: index === 0 ? 5 : index === 2 ? -5 : 0,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="group relative bg-white p-8 rounded-2xl border hover:border-slate-200 transition-all duration-300"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* 호버 시 그라데이션 배경 */}
      <div className={`absolute inset-0 ${feature.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* 그림자 효과 */}
      <div className={`absolute inset-0 rounded-2xl shadow-xl ${feature.shadowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />

      <div className="relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
        >
          <feature.icon size={28} className="text-white" />
        </motion.div>
        <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
        <p className="text-slate-500 leading-relaxed">
          {feature.description}
        </p>

        {/* 화살표 아이콘 */}
        <motion.div
          initial={{ x: 0, opacity: 0 }}
          whileHover={{ x: 5 }}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Learn more <ArrowRight size={16} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* 섹션 헤더 */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold"
          >
            Features
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              event planning
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Streamlined workflow designed for busy event organizers.
            Create professional nametags without any design skills.
          </p>
        </motion.div>

        {/* 메인 기능 카드들 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 mb-20"
          style={{ perspective: '1000px' }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>

        {/* 추가 기능들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all"
            >
              <div className={`${feature.color} mt-1`}>
                <feature.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{feature.title}</h4>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
