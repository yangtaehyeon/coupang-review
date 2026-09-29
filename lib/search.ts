import type { ReactNode } from "react";

// 사이트 안 검색. 띄어쓰기와 대소문자를 무시하고, 검색어를 띄어 쓰면 모든 단어가 들어간 글만 찾는다.

export type SearchItem = { key: string; text: string; node: ReactNode };

export function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

export function matchesQuery(text: string, query: string): boolean {
  const whole = normalizeSearch(query);
  if (!whole) return true;
  if (text.includes(whole)) return true;
  const words = query.split(/\s+/).map(normalizeSearch).filter(Boolean);
  return words.length > 1 && words.every((word) => text.includes(word));
}
