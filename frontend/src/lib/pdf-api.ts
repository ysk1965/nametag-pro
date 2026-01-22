import { apiRequest } from './api-client';
import type { Template, Person, TextField, ExportConfig } from '@/types';

// PDF 생성 요청 타입
export interface PdfGenerateRequest {
  templates: {
    id: string;
    fileName: string;
    imageUrl: string;
    dataUrl?: string;
    width: number;
    height: number;
    role: string | null;
  }[];
  persons: {
    id: string;
    data: Record<string, string>;
    templateId?: string | null;
  }[];
  textFields?: {
    id: string;
    column: string;
    label: string;
    position: { x: number; y: number };
    style: {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
      color: string;
    };
  }[];
  exportConfig: {
    paperSize: string;
    layout: string;
    margin: number;
    dpi: number;
    sizeMode: string;
    gridGap: number;
    fixedWidth: number;
    fixedHeight: number;
    blankPages: number;
    blankPagesPerTemplate: Record<string, number>;
  };
  roleMappings?: Record<string, string>;
  roleColors?: Record<string, string>;
  templateColumn?: string | null;
  selectedTemplateId?: string | null;
  watermarkEnabled?: boolean;
  watermarkText?: string;
  projectName?: string;
  projectId?: string;
}

// PDF 생성 응답 타입
export interface PdfGenerateResponse {
  id: string;
  projectName: string;
  pageCount: number;
  nametagCount: number;
  status: string;
  watermarkEnabled: boolean;
  createdAt: string;
  expiresAt: string;
  downloadUrl: string;
}

// PDF 기록 응답 타입
export interface PdfRecordResponse {
  id: string;
  projectName: string;
  pageCount: number;
  nametagCount: number;
  status: string;
  watermarkEnabled: boolean;
  watermarkText?: string;
  createdAt: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

/**
 * BE에서 PDF 생성 (로그인 유저 전용)
 */
export async function generatePdfViaBackend(
  templates: Template[],
  persons: Person[],
  textFields: TextField[],
  exportConfig: ExportConfig,
  options?: {
    roleMappings?: Record<string, string>;
    roleColors?: Record<string, string>;
    templateColumn?: string | null;
    selectedTemplateId?: string | null;
    watermarkEnabled?: boolean;
    watermarkText?: string;
    projectName?: string;
    projectId?: string;
  }
): Promise<PdfGenerateResponse> {
  const request: PdfGenerateRequest = {
    templates: templates.map((t) => ({
      id: t.id,
      fileName: t.fileName,
      imageUrl: t.imageUrl,
      dataUrl: t.dataUrl,
      width: t.width,
      height: t.height,
      role: t.role,
    })),
    persons: persons.map((p) => ({
      id: p.id,
      data: p.data,
      templateId: p.templateId,
    })),
    textFields: textFields.map((f) => ({
      id: f.id,
      column: f.column,
      label: f.label,
      position: f.position,
      style: {
        fontFamily: f.style.fontFamily,
        fontSize: f.style.fontSize,
        fontWeight: f.style.fontWeight,
        color: f.style.color,
      },
    })),
    exportConfig: {
      paperSize: exportConfig.paperSize,
      layout: exportConfig.layout,
      margin: exportConfig.margin,
      dpi: exportConfig.dpi,
      sizeMode: exportConfig.sizeMode,
      gridGap: exportConfig.gridGap,
      fixedWidth: exportConfig.fixedWidth,
      fixedHeight: exportConfig.fixedHeight,
      blankPages: exportConfig.blankPages,
      blankPagesPerTemplate: exportConfig.blankPagesPerTemplate,
    },
    roleMappings: options?.roleMappings,
    roleColors: options?.roleColors,
    templateColumn: options?.templateColumn,
    selectedTemplateId: options?.selectedTemplateId,
    watermarkEnabled: options?.watermarkEnabled ?? false,
    watermarkText: options?.watermarkText,
    projectName: options?.projectName,
    projectId: options?.projectId,
  };

  return apiRequest<PdfGenerateResponse>('/api/v1/pdf/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 내 PDF 기록 목록 조회
 */
export async function getMyPdfRecords(): Promise<PdfRecordResponse[]> {
  return apiRequest<PdfRecordResponse[]>('/api/v1/pdf/records');
}

/**
 * PDF 다운로드 URL 생성
 */
export function getPdfDownloadUrl(generationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/api/v1/pdf/${generationId}/download`;
}

/**
 * PDF 다운로드 (Blob으로 가져오기)
 */
export async function downloadPdf(generationId: string): Promise<Blob> {
  const response = await apiRequest<Response>(`/api/v1/pdf/${generationId}/download`, {
    method: 'GET',
  });

  // apiRequest가 JSON을 반환하므로 직접 fetch 사용
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const { accessToken } = await import('@/stores/auth-store').then(m => m.useAuthStore.getState());

  const fetchResponse = await fetch(`${baseUrl}/api/v1/pdf/${generationId}/download`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!fetchResponse.ok) {
    throw new Error('PDF 다운로드에 실패했습니다');
  }

  return fetchResponse.blob();
}

/**
 * PDF 기록 삭제
 */
export async function deletePdfRecord(generationId: string): Promise<void> {
  await apiRequest<void>(`/api/v1/pdf/${generationId}`, {
    method: 'DELETE',
  });
}
