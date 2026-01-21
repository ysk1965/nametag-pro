'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Upload, Palette, Download, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: '명단 업로드',
    titleEn: 'Upload Your List',
    description: 'Excel 또는 CSV 파일을 드래그 앤 드롭하세요. 이름, 소속, 역할 등 원하는 정보를 자동으로 인식합니다.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500',
  },
  {
    number: '02',
    icon: Palette,
    title: '디자인 커스터마이징',
    titleEn: 'Customize Design',
    description: '템플릿을 선택하거나 직접 디자인을 업로드하세요. 텍스트 위치, 폰트, 색상을 자유롭게 조정할 수 있습니다.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500',
  },
  {
    number: '03',
    icon: Download,
    title: 'PDF 다운로드',
    titleEn: 'Download PDF',
    description: '고해상도 PDF를 한 번에 생성합니다. A4 용지에 맞게 자동 배치되어 바로 인쇄할 수 있습니다.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500',
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* 섹션 헤더 */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold"
          >
            How it Works
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            3단계로{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              간단하게
            </span>{' '}
            완성
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            복잡한 과정 없이 누구나 쉽게 전문적인 명찰을 만들 수 있습니다.
          </p>
        </motion.div>

        {/* 스텝 카드들 */}
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* 연결 라인 (데스크탑) */}
          <div className="hidden lg:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="relative"
            >
              {/* 스텝 카드 */}
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 border shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* 배경 그라데이션 (호버 시) */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* 스텝 번호 */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10`}
                >
                  <step.icon size={32} className="text-white" />
                </motion.div>

                {/* 번호 배지 */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-slate-100 select-none">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 mb-3 font-medium">{step.titleEn}</p>
                <p className="text-slate-500 leading-relaxed">{step.description}</p>

                {/* 다음 단계 화살표 (마지막 제외) */}
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block z-20"
                  >
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border">
                      <ArrowRight size={16} className="text-slate-400" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* 완료 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-full"
          >
            <CheckCircle size={20} />
            <span className="font-semibold">완성! 인쇄만 하면 끝</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
