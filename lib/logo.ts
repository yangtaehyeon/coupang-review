// 사이트 로고 원본: 파란 둥근 사각형 + 흰 쇼핑백(아이템) + 금색 천사 고리(엔젤).
// 헤더(components/Logo.tsx), 공유 썸네일(lib/og.tsx), 파비콘·앱 아이콘(scripts/make-icons.mjs)이 모두 이 SVG 를 쓴다.
// 모양을 바꾸면 `npm run icons` 로 파비콘 파일을 다시 만든다.

export const LOGO_COLORS = { brand: "#0052CC", halo: "#FFC53D", bag: "#FFFFFF" } as const;

/** rounded=false 는 모서리 없는 정사각형 (애플 기기가 직접 둥글게 자르는 apple-icon 용) */
export function logoSvg({ rounded = true }: { rounded?: boolean } = {}): string {
  const { brand, halo, bag } = LOGO_COLORS;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    `<rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="${brand}"/>`,
    `<ellipse cx="32" cy="13" rx="11.5" ry="3.6" fill="none" stroke="${halo}" stroke-width="3.2"/>`,
    `<path d="M25 30v-3.5a7 7 0 0 1 14 0V30" fill="none" stroke="${bag}" stroke-width="3.2" stroke-linecap="round"/>`,
    `<path d="M17.5 29h29l-2.4 22.6a4.2 4.2 0 0 1-4.2 3.8H24.1a4.2 4.2 0 0 1-4.2-3.8Z" fill="${bag}"/>`,
    "</svg>",
  ].join("");
}
