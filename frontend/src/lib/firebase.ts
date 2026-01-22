import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 앱 초기화 (싱글톤)
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else if (!app) {
    app = getApps()[0];
  }
  return app;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;

  if (!analytics) {
    const supported = await isSupported();
    if (supported) {
      const app = getFirebaseApp();
      analytics = getAnalytics(app);
    }
  }
  return analytics || null;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

export async function signInWithGoogle(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return idToken;
}

export async function signOutFromFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

// 페이지 뷰 트래킹
export async function logPageView(pagePath: string, pageTitle?: string) {
  const analytics = await getFirebaseAnalytics();
  if (analytics) {
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// 커스텀 이벤트 트래킹
export async function logCustomEvent(eventName: string, params?: Record<string, unknown>) {
  const analytics = await getFirebaseAnalytics();
  if (analytics) {
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, eventName, params);
  }
}

// 주요 이벤트 헬퍼 함수들
export const analyticsEvents = {
  // 명단 관련
  uploadRoster: (count: number) => logCustomEvent('upload_roster', { person_count: count }),
  manualEntryRoster: (count: number) => logCustomEvent('manual_entry_roster', { person_count: count }),

  // 템플릿 관련
  selectDesignMode: (mode: 'default' | 'custom') => logCustomEvent('select_design_mode', { mode }),
  uploadTemplate: (fileName: string) => logCustomEvent('upload_template', { file_name: fileName }),

  // PDF 생성 관련
  startPdfGeneration: (count: number) => logCustomEvent('start_pdf_generation', { nametag_count: count }),
  completePdfGeneration: (count: number, duration: number) =>
    logCustomEvent('complete_pdf_generation', { nametag_count: count, duration_ms: duration }),
  downloadPdf: () => logCustomEvent('download_pdf'),

  // 에디터 관련
  addTextField: (column: string) => logCustomEvent('add_text_field', { column }),
  changeFont: (fontFamily: string) => logCustomEvent('change_font', { font_family: fontFamily }),

  // CTA 클릭
  clickCta: (location: string) => logCustomEvent('click_cta', { location }),
};
