'use client';

import { Loader2 } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  progress: number; // 0-100
  current: number;
  total: number;
  message?: string;
}

export function ProgressModal({
  isOpen,
  progress,
  current,
  total,
  message = 'PDF 생성 중...',
}: ProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-fade-in">
        {/* 로딩 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-100" />
            <div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
          {message}
        </h3>
        <p className="text-sm text-center text-slate-500 mb-6">
          {current} / {total} 명찰 처리 중
        </p>

        {/* 프로그레스 바 */}
        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 안내 */}
        <p className="text-xs text-center text-slate-400 mt-4">
          잠시만 기다려주세요. 창을 닫지 마세요.
        </p>
      </div>
    </div>
  );
}
