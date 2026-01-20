'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <>
      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">NameTag Pro</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 hidden sm:block">
              Features
            </a>
            <Link href="/editor">
              <Button>Start for Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-20 border-b overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              New: Batch PDF Generation 2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Create{' '}
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">
                Perfect
              </span>{' '}
              Nametags in Seconds.
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              Upload your guest list and design template. We'll automatically
              generate high-resolution printable PDFs for your entire event.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/editor">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Create Now <ArrowRight size={20} />
                </Button>
              </Link>
              <div className="text-sm text-slate-400">
                No credit card required. <br /> Free for up to 50 names.
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="bg-slate-100 rounded-2xl aspect-[4/3] flex items-center justify-center p-8 border shadow-inner">
              <div className="bg-white rounded-lg shadow-2xl border p-8 w-full max-w-sm">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
                    NT
                  </div>
                  <div className="text-2xl font-bold">홍길동</div>
                  <div className="text-slate-500">참가자</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border max-w-xs animate-bounce">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <Download size={20} />
                </div>
                <div className="font-bold">PDF Ready</div>
              </div>
              <div className="text-sm text-slate-500">
                248 nametags generated successfully. Ready for print.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
