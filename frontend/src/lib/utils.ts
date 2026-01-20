import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function getLayoutDimensions(layout: string): [number, number] {
  const map: Record<string, [number, number]> = {
    '2x2': [2, 2],
    '2x3': [2, 3],
    '3x3': [3, 3],
    '2x4': [2, 4],
  };
  return map[layout] || [2, 2];
}

export function calculatePageCount(totalItems: number, layout: string): number {
  const [cols, rows] = getLayoutDimensions(layout);
  const perPage = cols * rows;
  return Math.ceil(totalItems / perPage);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function detectNameColumn(columns: string[]): string {
  const namePatterns = ['이름', 'name', '성명', '참가자', '참석자', 'Name', '이 름'];
  for (const col of columns) {
    const lowerCol = col.toLowerCase().trim();
    if (namePatterns.some(p => lowerCol.includes(p.toLowerCase()))) {
      return col;
    }
  }
  return columns[0] || '';
}

export function detectRoleColumn(columns: string[]): string | null {
  const rolePatterns = ['역할', 'role', '직분', '구분', '직책', '그룹', '소속', 'Role', '역 할'];
  for (const col of columns) {
    const lowerCol = col.toLowerCase().trim();
    if (rolePatterns.some(p => lowerCol.includes(p.toLowerCase()))) {
      return col;
    }
  }
  return null;
}
