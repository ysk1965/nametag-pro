import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR, Nanum_Gothic, Nanum_Myeongjo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const nanumGothic = Nanum_Gothic({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nanum-gothic',
  display: 'swap',
});

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nanum-myeongjo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NameTag Pro - 명찰 자동 생성 서비스',
  description: '명단만 있으면 명찰 완성. 엑셀 업로드 한 번으로 수백 장의 명찰을 자동 생성하세요.',
  keywords: ['명찰', '명찰 제작', '이름표', '행사', '컨퍼런스', 'nametag'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 폰트 (CDN) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} ${nanumGothic.variable} ${nanumMyeongjo.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
