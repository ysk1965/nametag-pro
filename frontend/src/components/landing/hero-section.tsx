'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle2, Download, Sparkles, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 플로팅 요소들
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 그라데이션 블러 서클들 */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-[20%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 left-[10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-40 left-[30%] w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"
      />

      {/* 작은 플로팅 아이콘들 */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-32 right-[15%] bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border hidden lg:block"
      >
        <Users className="text-blue-500" size={24} />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-32 right-[25%] bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border hidden lg:block"
      >
        <FileText className="text-purple-500" size={24} />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, 15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-48 left-[5%] bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border hidden lg:block"
      >
        <Sparkles className="text-amber-500" size={24} />
      </motion.div>
    </div>
  );
}

// 3D 명찰 카드 컴포넌트
function NametagCard3D() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      {/* 뒤쪽 그림자/깊이 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl transform translate-x-4 translate-y-4 blur-xl opacity-50" />

      {/* 메인 카드 컨테이너 */}
      <motion.div
        animate={{
          rotateX: isHovered ? -mousePosition.y : 0,
          rotateY: isHovered ? mousePosition.x : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl aspect-[4/3] flex items-center justify-center p-8 border shadow-2xl"
      >
        {/* 빛 반사 효과 */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${50 + mousePosition.x * 5}% ${50 + mousePosition.y * 5}%, rgba(255,255,255,0.8) 0%, transparent 50%)`
              : 'none',
          }}
        />

        {/* 명찰 카드 */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white rounded-xl shadow-2xl border-2 border-slate-100 p-8 w-full max-w-sm relative overflow-hidden"
          style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}
        >
          {/* 카드 상단 장식 */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

          <div className="text-center space-y-4 pt-2">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            >
              NT
            </motion.div>
            <div className="text-2xl font-bold text-slate-800">홍길동</div>
            <div className="text-slate-500 font-medium">참가자</div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400">2026 Conference</div>
            </div>
          </div>
        </motion.div>

        {/* 배경 그리드 패턴 */}
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </motion.div>

      {/* PDF Ready 플로팅 카드 */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute -bottom-6 -left-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white p-5 rounded-2xl shadow-xl border backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-green-100 text-green-600 p-2.5 rounded-full"
            >
              <Download size={20} />
            </motion.div>
            <div className="font-bold text-slate-800">PDF Ready</div>
          </div>
          <div className="text-sm text-slate-500">
            248 nametags generated successfully.
            <br />
            <span className="text-green-600 font-medium">Ready for print.</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 추가 플로팅 뱃지 */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -30 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute -top-4 -right-4"
      >
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1"
        >
          <Sparkles size={14} />
          300 DPI
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-1.5 rounded-lg shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              NameTag Pro
            </span>
          </motion.div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors hidden sm:block">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors hidden sm:block">
              How it works
            </a>
            <Link href="/editor">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="shadow-md hover:shadow-lg transition-shadow">Start for Free</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white via-blue-50/30 to-white py-20 lg:py-28 border-b overflow-hidden">
        <FloatingElements />

        <motion.div style={{ y: y1, opacity }} className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
          <div className="space-y-8 relative z-10">
            {/* New Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New: Batch PDF Generation 2.0
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              Create{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 animate-gradient">
                  Perfect
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-2 left-0 h-3 bg-blue-200/50 -z-10 rounded"
                />
              </span>{' '}
              <br className="hidden lg:block" />
              Nametags in Seconds.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-lg leading-relaxed"
            >
              Upload your guest list and design template. We'll automatically
              generate high-resolution printable PDFs for your entire event.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link href="/editor">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg group">
                    Create Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} className="ml-2" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
              <div className="text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  Free for up to 50 names
                </span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-8 pt-4 border-t border-slate-200"
            >
              {[
                { value: '10K+', label: 'Events' },
                { value: '500K+', label: 'Nametags' },
                { value: '4.9/5', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - 3D Card */}
          <div className="relative hidden lg:block">
            <NametagCard3D />
          </div>
        </motion.div>
      </section>
    </>
  );
}
