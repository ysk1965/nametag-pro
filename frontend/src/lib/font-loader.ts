import type { CustomFont } from '@/types';
import { generateId } from './utils';

/**
 * 폰트 파일을 읽어서 CustomFont 객체 생성
 */
export async function loadFontFile(file: File): Promise<CustomFont> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const id = generateId();
      const fontFamily = `custom-font-${id}`;

      // 파일명에서 확장자 제거하여 폰트 이름으로 사용
      const name = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');

      const customFont: CustomFont = {
        id,
        name,
        fontFamily,
        fileName: file.name,
        dataUrl,
        loaded: false,
      };

      resolve(customFont);
    };

    reader.onerror = () => {
      reject(new Error('폰트 파일을 읽을 수 없습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 브라우저에 폰트 등록 (Font Face API)
 */
export async function registerFont(font: CustomFont): Promise<void> {
  // 이미 등록된 폰트인지 확인
  const existingFont = Array.from(document.fonts).find(
    (f) => f.family === font.fontFamily
  );

  if (existingFont) {
    return;
  }

  // FontFace 생성 및 로드
  const fontFace = new FontFace(font.fontFamily, `url(${font.dataUrl})`);

  try {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
  } catch (error) {
    console.error(`폰트 로드 실패: ${font.name}`, error);
    throw new Error(`폰트 "${font.name}"을(를) 로드할 수 없습니다.`);
  }
}

/**
 * 브라우저에서 폰트 해제
 */
export function unregisterFont(font: CustomFont): void {
  const existingFont = Array.from(document.fonts).find(
    (f) => f.family === font.fontFamily
  );

  if (existingFont) {
    document.fonts.delete(existingFont);
  }
}

/**
 * 저장된 커스텀 폰트들을 브라우저에 다시 등록 (페이지 로드 시)
 * @returns 로드에 실패한 폰트 ID 목록
 */
export async function reloadCustomFonts(fonts: CustomFont[]): Promise<string[]> {
  const failedFontIds: string[] = [];

  for (const font of fonts) {
    try {
      await registerFont(font);
    } catch (error) {
      console.warn(`폰트 재로드 실패: ${font.name}`, error);
      failedFontIds.push(font.id);
    }
  }

  return failedFontIds;
}

/**
 * 지원하는 폰트 파일 확장자 확인
 */
export function isSupportedFontFile(file: File): boolean {
  const supportedExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
  const fileName = file.name.toLowerCase();
  return supportedExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * 폰트 파일 MIME 타입
 */
export const FONT_ACCEPT = {
  'font/ttf': ['.ttf'],
  'font/otf': ['.otf'],
  'font/woff': ['.woff'],
  'font/woff2': ['.woff2'],
  'application/x-font-ttf': ['.ttf'],
  'application/x-font-opentype': ['.otf'],
};
