---
title: Design System
version: 1.0.0
updated: 2025-01-21
history:
  - v1.0.0: 2025-01-21 - Initial release
---

# Design System

## Color Palette

### Primary Colors (Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#E8F4FD` | Background hover, subtle highlights |
| `primary-100` | `#C5E3FA` | Light backgrounds |
| `primary-200` | `#9ED0F6` | Borders, dividers |
| `primary-300` | `#77BDF2` | Icons, secondary elements |
| `primary-400` | `#5AAFEF` | Hover states |
| `primary-500` | `#3D9FEB` | **Primary buttons, links** |
| `primary-600` | `#3790DC` | Active states |
| `primary-700` | `#2D7CC8` | Pressed states |
| `primary-800` | `#2468B4` | Dark accents |
| `primary-900` | `#104694` | Text on light background |

### Neutral Colors (Slate)

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-0` | `#FFFFFF` | Pure white backgrounds |
| `neutral-50` | `#F8FAFC` | Page background |
| `neutral-100` | `#F1F5F9` | Card backgrounds |
| `neutral-200` | `#E2E8F0` | Borders, dividers |
| `neutral-300` | `#CBD5E1` | Disabled borders |
| `neutral-400` | `#94A3B8` | Placeholder text |
| `neutral-500` | `#64748B` | Secondary text |
| `neutral-600` | `#475569` | Body text |
| `neutral-700` | `#334155` | **Primary text** |
| `neutral-800` | `#1E293B` | Headings |
| `neutral-900` | `#0F172A` | High emphasis text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| `success` | `#22C55E` (green-500) | Success states, confirmations |
| `warning` | `#F59E0B` (amber-500) | Warnings, alerts |
| `error` | `#EF4444` (red-500) | Errors, destructive actions |
| `info` | `#3B82F6` (blue-500) | Information, tips |

### Role Colors (Multi-template Mode)

| Role Type | Default Color | Description |
|-----------|---------------|-------------|
| 역할 1 | `#3B82F6` (Blue) | 첫 번째 역할 그룹 |
| 역할 2 | `#22C55E` (Green) | 두 번째 역할 그룹 |
| 역할 3 | `#F59E0B` (Amber) | 세 번째 역할 그룹 |
| 역할 4 | `#EF4444` (Red) | 네 번째 역할 그룹 |
| 역할 5 | `#8B5CF6` (Violet) | 다섯 번째 역할 그룹 |

---

## Typography

### Font Family

```css
--font-pretendard: "Pretendard Variable", Pretendard, -apple-system,
                   BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue",
                   "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR",
                   "Malgun Gothic", sans-serif;
```

**Available Fonts:**
| Font | Variable | Usage |
|------|----------|-------|
| Pretendard | `--font-pretendard` | 기본 UI 폰트 |
| Noto Sans KR | `--font-noto-sans-kr` | 명찰용 한글 |
| Nanum Gothic | `--font-nanum-gothic` | 명찰용 한글 대안 |
| Nanum Myeongjo | `--font-nanum-myeongjo` | 명찰용 명조체 |

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 16px | Captions, labels |
| sm | 14px | 20px | Secondary text |
| base | 16px | 24px | Body text |
| lg | 18px | 28px | Subtitles |
| xl | 20px | 28px | Section titles |
| 2xl | 24px | 32px | Page titles |
| 3xl | 30px | 36px | Hero subtitles |
| 4xl | 36px | 40px | Hero titles |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings, buttons |

---

## Spacing

Based on 4px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| 0 | 0px | - |
| 0.5 | 2px | Minimal gaps |
| 1 | 4px | Icon padding |
| 2 | 8px | Inline spacing |
| 3 | 12px | Component padding |
| 4 | 16px | Standard padding |
| 5 | 20px | Section padding |
| 6 | 24px | Card padding |
| 8 | 32px | Large gaps |
| 10 | 40px | Section margins |
| 12 | 48px | Page margins |
| 16 | 64px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0px | Sharp corners |
| sm | 4px | Small buttons |
| md | 6px | Inputs, chips |
| lg | 12px | Cards, panels |
| xl | 16px | Modals |
| 2xl | 24px | Large cards |
| full | 9999px | Avatars, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| md | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| lg | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns |
| xl | `0 20px 25px rgba(0,0,0,0.15)` | Modals |
| 2xl | `0 25px 50px rgba(0,0,0,0.25)` | Floating elements |

---

## Component Styles

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #3D9FEB;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #2D7CC8;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #334155;
  border: 1px solid #E2E8F0;
  padding: 10px 20px;
  border-radius: 8px;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #64748B;
  padding: 8px 16px;
}
```

### Cards

```css
.card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.card-hover {
  transition: all 0.2s;
}
.card-hover:hover {
  border-color: #3D9FEB;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
}
```

### Inputs

```css
.input {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}
.input:focus {
  border-color: #3D9FEB;
  outline: none;
  box-shadow: 0 0 0 3px rgba(61, 159, 235, 0.1);
}
```

### Modals

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px rgba(0,0,0,0.15);
  max-width: 520px;
  width: 100%;
}
```

---

## Animations

### Transitions

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| fast | 100ms | ease-out | Micro-interactions |
| normal | 200ms | ease-out | Button states |
| slow | 300ms | ease-in-out | Panel transitions |
| spring | - | spring(25, 300) | Modal enter/exit |

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

### Framer Motion Variants

```typescript
// Modal animation
const modalVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 }
};

// Panel slide
const panelVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};
```

---

## Icons

Using **Lucide React** icon library.

### Common Icons

| Icon | Usage |
|------|-------|
| `FileText` | 파일, 문서 |
| `Upload` | 업로드 |
| `Download` | 다운로드 |
| `Settings` | 설정 |
| `X` | 닫기 |
| `Plus` | 추가 |
| `Trash2` | 삭제 |
| `Edit` | 편집 |
| `Check` | 확인, 완료 |
| `ArrowLeft` | 뒤로 |
| `ArrowRight` | 다음 |
| `ChevronDown` | 드롭다운 |

### Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | 14px | Inline icons |
| sm | 16px | Button icons |
| md | 20px | Standard icons |
| lg | 24px | Panel headers |
| xl | 32px | Feature icons |

---

## Scrollbar

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F1F5F9;
}

::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
```

---

## Dark Mode

다크모드는 `class` 전략을 사용합니다.

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark mode variables */
}
```

현재 다크모드는 구현되지 않았으나, Tailwind 설정에서 활성화되어 있습니다.
