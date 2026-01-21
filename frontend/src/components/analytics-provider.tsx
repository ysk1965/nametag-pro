'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getFirebaseAnalytics, logPageView } from '@/lib/firebase';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Firebase Analytics 초기화
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);

  // 페이지 뷰 트래킹
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      logPageView(url, document.title);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
