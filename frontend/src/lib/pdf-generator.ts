import type { Template, Person, TextConfig, ExportConfig, TextField } from '@/types';
import { getLayoutDimensions } from './utils';

// Dynamic import for jsPDF (client-side only)
async function getJsPDF() {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
}

// 렌더링 설정 상수
const RENDER_WIDTH = 400; // 프리뷰와 동일
const RENDER_SCALE = 2; // 2x 스케일 (메모리 절약, 여전히 고품질)
const IMAGE_QUALITY = 0.85; // JPEG 품질 (0.85는 좋은 품질 유지하면서 크기 줄임)

/**
 * 기본 템플릿을 Canvas에 HTML 스타일로 렌더링 (찌그러지지 않음)
 * @param headerColor - 헤더 색상 (기본값: 파란색 #3b82f6)
 */
function renderDefaultTemplateToCanvas(
  person: Person,
  textFields: TextField[],
  targetWidth: number,
  targetHeight: number,
  headerColor: string = '#3b82f6'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    canvas.width = targetWidth * RENDER_SCALE;
    canvas.height = targetHeight * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 내부 카드 영역 (3% 여백)
    const padding = Math.min(targetWidth, targetHeight) * 0.03;
    const cardX = padding;
    const cardY = padding;
    const cardWidth = targetWidth - padding * 2;
    const cardHeight = targetHeight - padding * 2;
    const borderRadius = Math.min(cardWidth, cardHeight) * 0.05;

    // 카드 배경 (흰색, 둥근 모서리)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, borderRadius);
    ctx.fill();

    // 카드 테두리
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 상단 헤더 (동적 색상)
    const headerHeight = cardHeight * 0.22;
    ctx.fillStyle = headerColor;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, headerHeight, [borderRadius, borderRadius, 0, 0]);
    ctx.fill();

    // 헤더 텍스트 "NAME TAG"
    const headerFontSize = Math.min(cardWidth * 0.08, headerHeight * 0.5);
    ctx.font = `bold ${headerFontSize}px "Pretendard", "Arial", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NAME TAG', cardX + cardWidth / 2, cardY + headerHeight / 2);

    // 하단 구분선
    const lineY = cardY + cardHeight - cardHeight * 0.18;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + cardWidth * 0.1, lineY);
    ctx.lineTo(cardX + cardWidth * 0.9, lineY);
    ctx.stroke();

    // 하단 텍스트 "Company / Organization"
    const footerFontSize = Math.min(cardWidth * 0.045, 12);
    ctx.font = `${footerFontSize}px "Pretendard", "Arial", sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Company / Organization', cardX + cardWidth / 2, lineY + cardHeight * 0.08);

    // 사용자 텍스트 필드 렌더링
    for (const field of textFields) {
      const text = person.data[field.column] || '';
      if (!text) continue;

      const fontWeight = field.style.fontWeight >= 700 ? 'bold' : 'normal';
      const fontSize = field.style.fontSize;
      ctx.font = `${fontWeight} ${fontSize}px ${field.style.fontFamily}, "Pretendard", "Noto Sans KR", sans-serif`;
      ctx.fillStyle = field.style.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = targetWidth * (field.position.x / 100);
      const textY = targetHeight * (field.position.y / 100);

      ctx.fillText(text, textX, textY);
    }

    resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
  });
}

/**
 * Canvas에 명찰 이미지를 렌더링 (템플릿 + 여러 텍스트 필드)
 * @param headerColor - 기본 템플릿 헤더 색상 (옵션)
 */
async function renderNametagToCanvas(
  template: Template,
  person: Person,
  textFields: TextField[],
  targetWidth: number,
  targetHeight: number,
  headerColor?: string
): Promise<string> {
  // 기본 템플릿인 경우 HTML 스타일로 렌더링
  if (template.id === 'default-template') {
    return renderDefaultTemplateToCanvas(person, textFields, targetWidth, targetHeight, headerColor);
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // 2x 스케일로 충분한 품질 유지 (3x에서 감소)
    canvas.width = targetWidth * RENDER_SCALE;
    canvas.height = targetHeight * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 템플릿 이미지 그리기
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 모든 텍스트 필드 렌더링
      for (const field of textFields) {
        const text = person.data[field.column] || '';
        if (!text) continue;

        const fontWeight = field.style.fontWeight >= 700 ? 'bold' : 'normal';
        const fontSize = field.style.fontSize;
        ctx.font = `${fontWeight} ${fontSize}px ${field.style.fontFamily}, "Pretendard", "Noto Sans KR", sans-serif`;
        ctx.fillStyle = field.style.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = targetWidth * (field.position.x / 100);
        const textY = targetHeight * (field.position.y / 100);

        ctx.fillText(text, textX, textY);
      }

      // JPEG 포맷으로 변환 (PNG보다 크기 작음)
      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };

    img.onerror = () => {
      reject(new Error('Failed to load template image'));
    };

    img.src = template.dataUrl || template.imageUrl;
  });
}

/**
 * Legacy 렌더링 함수 (하위 호환성)
 */
async function renderNametagToCanvasLegacy(
  template: Template,
  name: string,
  textConfig: TextConfig,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    canvas.width = targetWidth * RENDER_SCALE;
    canvas.height = targetHeight * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const fontWeight = textConfig.style.fontWeight >= 700 ? 'bold' : 'normal';
      const fontSize = textConfig.style.fontSize;
      ctx.font = `${fontWeight} ${fontSize}px ${textConfig.style.fontFamily}, "Pretendard", "Noto Sans KR", sans-serif`;
      ctx.fillStyle = textConfig.style.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = targetWidth * (textConfig.position.x / 100);
      const textY = targetHeight * (textConfig.position.y / 100);

      ctx.fillText(name, textX, textY);

      resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };

    img.onerror = () => {
      reject(new Error('Failed to load template image'));
    };

    img.src = template.dataUrl || template.imageUrl;
  });
}

export interface GeneratePDFOptions {
  templates: Template[];
  persons: Person[];
  textConfig: TextConfig;
  exportConfig: ExportConfig;
  roleMappings?: Record<string, string>;
  roleColors?: Record<string, string>;  // 기본 명찰 역할별 색상
  templateColumn?: string | null;
  textFields?: TextField[];
}

export type ProgressCallback = (current: number, total: number) => void;

// 배치 처리를 위한 유틸리티 (메모리 해제 시간 확보)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generatePDF(
  templates: Template[],
  persons: Person[],
  textConfig: TextConfig,
  exportConfig: ExportConfig,
  roleMappings: Record<string, string> = {},
  templateColumn: string | null = null,
  textFields: TextField[] = [],
  onProgress?: ProgressCallback,
  selectedTemplateId: string | null = null,  // 싱글 모드에서 사용할 템플릿 ID
  roleColors: Record<string, string> = {}    // 기본 명찰 역할별 색상
): Promise<string> {
  // 최대 300명 제한
  const MAX_PERSONS = 300;
  if (persons.length > MAX_PERSONS) {
    throw new Error(`최대 ${MAX_PERSONS}명까지만 생성할 수 있습니다. 현재: ${persons.length}명`);
  }

  const jsPDF = await getJsPDF();

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: exportConfig.paperSize.toLowerCase() as 'a4' | 'letter',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = exportConfig.margin;

  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  let cols: number;
  let rows: number;
  let cellWidth: number;
  let cellHeight: number;
  let useFixedSize = false;
  let fixedWidth = 0;
  let fixedHeight = 0;

  if (exportConfig.sizeMode === 'fixed') {
    // 고정 크기 모드
    useFixedSize = true;
    fixedWidth = exportConfig.fixedWidth;
    fixedHeight = exportConfig.fixedHeight;

    const gap = 2; // mm (명찰 사이 간격)
    cols = Math.max(1, Math.floor((availableWidth + gap) / (fixedWidth + gap)));
    rows = Math.max(1, Math.floor((availableHeight + gap) / (fixedHeight + gap)));

    cellWidth = availableWidth / cols;
    cellHeight = availableHeight / rows;
  } else {
    // 자동 모드 (레이아웃 기반)
    [cols, rows] = getLayoutDimensions(exportConfig.layout);
    cellWidth = availableWidth / cols;
    cellHeight = availableHeight / rows;
  }

  const perPage = cols * rows;

  if (templates.length === 0) {
    throw new Error('No template available');
  }

  const templateMap = new Map(templates.map((t) => [t.id, t]));
  // 싱글 모드에서는 선택된 템플릿 사용, 없으면 첫 번째 템플릿
  const defaultTemplate = selectedTemplateId
    ? templateMap.get(selectedTemplateId) || templates[0]
    : templates[0];

  // 배치 크기 설정 (메모리 관리)
  const BATCH_SIZE = 20;

  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];
    const posIdx = i % perPage;
    const col = posIdx % cols;
    const row = Math.floor(posIdx / cols);

    // 진행 상황 콜백
    if (onProgress) {
      onProgress(i + 1, persons.length);
    }

    // 배치마다 잠시 대기 (메모리 해제 기회 제공)
    if (i > 0 && i % BATCH_SIZE === 0) {
      await delay(10);
    }

    // Add new page if needed
    if (i > 0 && i % perPage === 0) {
      pdf.addPage();
    }

    const cellX = margin + col * cellWidth;
    const cellY = margin + row * cellHeight;

    // 템플릿 선택
    let template: Template | undefined;

    if (person.templateId) {
      template = templateMap.get(person.templateId);
    }

    if (!template && templateColumn) {
      const roleValue = person.data[templateColumn];
      if (roleValue && roleMappings[roleValue]) {
        template = templateMap.get(roleMappings[roleValue]);
      } else if (!roleValue && roleMappings['__no_role__']) {
        template = templateMap.get(roleMappings['__no_role__']);
      }
    }

    if (!template) {
      template = defaultTemplate;
    }

    // 캔버스 렌더링 (캐시 없이 매번 생성 - 메모리 절약)
    try {
      const isDefaultTemplate = template.id === 'default-template';

      // 기본 템플릿 + 고정 크기일 때는 고정 크기 비율로, 아니면 템플릿 비율로
      let renderHeight: number;
      if (isDefaultTemplate && useFixedSize) {
        renderHeight = RENDER_WIDTH * (fixedHeight / fixedWidth);
      } else {
        renderHeight = RENDER_WIDTH * (template.height / template.width);
      }

      // 기본 템플릿 역할별 색상 결정
      let headerColor: string | undefined;
      if (isDefaultTemplate && templateColumn && Object.keys(roleColors).length > 0) {
        const roleValue = person.data[templateColumn];
        if (roleValue && roleColors[roleValue]) {
          headerColor = roleColors[roleValue];
        }
      }

      let nametagDataUrl: string;

      if (textFields.length > 0) {
        nametagDataUrl = await renderNametagToCanvas(
          template,
          person,
          textFields,
          RENDER_WIDTH,
          renderHeight,
          headerColor
        );
      } else {
        const displayName = Object.values(person.data)[0] || 'Name';
        nametagDataUrl = await renderNametagToCanvasLegacy(
          template,
          displayName,
          textConfig,
          RENDER_WIDTH,
          renderHeight
        );
      }

      // 명찰 크기 계산
      let nametagWidth: number;
      let nametagHeight: number;

      if (useFixedSize) {
        // 고정 크기 모드: 지정된 크기 사용
        nametagWidth = fixedWidth;
        nametagHeight = fixedHeight;
      } else {
        // 자동 모드: 템플릿 종횡비에 맞게 셀 내에서 fit-contain 계산
        const templateAspect = template.width / template.height;
        nametagWidth = cellWidth;
        nametagHeight = cellWidth / templateAspect;

        // 셀 높이를 초과하면 높이 기준으로 재계산
        if (nametagHeight > cellHeight) {
          nametagHeight = cellHeight;
          nametagWidth = cellHeight * templateAspect;
        }
      }

      // 셀 중앙에 배치
      const offsetX = (cellWidth - nametagWidth) / 2;
      const offsetY = (cellHeight - nametagHeight) / 2;
      const x = cellX + offsetX;
      const y = cellY + offsetY;

      // PDF에 이미지 추가
      pdf.addImage(nametagDataUrl, 'JPEG', x, y, nametagWidth, nametagHeight);

    } catch (error) {
      console.error(`Failed to render nametag ${i + 1}:`, error);
      // 폴백: 템플릿만 추가
      const imageData = template.dataUrl || template.imageUrl;
      try {
        let nametagWidth: number;
        let nametagHeight: number;

        if (useFixedSize) {
          nametagWidth = fixedWidth;
          nametagHeight = fixedHeight;
        } else {
          const templateAspect = template.width / template.height;
          nametagWidth = cellWidth;
          nametagHeight = cellWidth / templateAspect;
          if (nametagHeight > cellHeight) {
            nametagHeight = cellHeight;
            nametagWidth = cellHeight * templateAspect;
          }
        }
        const offsetX = (cellWidth - nametagWidth) / 2;
        const offsetY = (cellHeight - nametagHeight) / 2;
        pdf.addImage(imageData, 'JPEG', cellX + offsetX, cellY + offsetY, nametagWidth, nametagHeight);
      } catch {
        // 무시하고 계속
      }
    }
  }

  // PDF 생성
  try {
    const blob = pdf.output('blob');
    if (!blob || blob.size === 0) {
      throw new Error('PDF blob is empty');
    }
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to generate PDF blob:', error);
    throw new Error('PDF 생성에 실패했습니다. 데이터를 확인해주세요.');
  }
}

export function calculatePageCount(personCount: number, layout: string): number {
  const [cols, rows] = getLayoutDimensions(layout);
  const perPage = cols * rows;
  return Math.ceil(personCount / perPage);
}
