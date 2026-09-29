import type { ReactNode } from "react";

// 글 목록 정렬·몇 개씩 보기·페이지 나누기. 서버(첫 화면 HTML)와 브라우저(?sort=&per=&page= 반영)가 같은 규칙을 쓴다.

export const PER_PAGE_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "price-asc", label: "가격 낮은순" },
  { value: "price-desc", label: "가격 높은순" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "latest";

/** 서버에서 미리 그린 카드 한 장 + 정렬 기준값 */
export type FeedItem = {
  key: string;
  node: ReactNode;
  /** 가격대를 숫자로 바꾼 값 (만원 단위). 가격대가 없으면 null */
  price: number | null;
  /** 게시일 YYYY-MM-DD */
  date: string;
};

export type FeedState = { page: number; per: number; sort: SortValue; totalPages: number };

export function parseFeed(pageRaw: string | null, perRaw: string | null, sortRaw: string | null, total: number): FeedState {
  const perNum = Number(perRaw);
  const per = (PER_PAGE_OPTIONS as readonly number[]).includes(perNum) ? perNum : DEFAULT_PER_PAGE;
  const sort = SORT_OPTIONS.find((o) => o.value === sortRaw)?.value ?? DEFAULT_SORT;
  const totalPages = Math.max(1, Math.ceil(total / per));
  const pageNum = Math.trunc(Number(pageRaw));
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(pageNum, totalPages) : 1;
  return { page, per, sort, totalPages };
}

/** 기본값(1페이지, 12개, 최신순)은 주소에서 빼서 첫 페이지 주소를 하나로 유지한다 */
export function feedHref(basePath: string, state: { page: number; per: number; sort: SortValue }, anchor = true): string {
  const params = new URLSearchParams();
  if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.per !== DEFAULT_PER_PAGE) params.set("per", String(state.per));
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}${anchor ? "#feed" : ""}`;
}

/** 최신순은 날짜 내림차순, 가격순은 가격대 → 같은 가격대면 최신 글 먼저. 가격대가 없는 글은 맨 뒤 */
export function sortFeed(items: readonly FeedItem[], sort: SortValue): FeedItem[] {
  const byDate = (a: FeedItem, b: FeedItem) => b.date.localeCompare(a.date);
  if (sort === "latest") return [...items].sort(byDate);
  const dir = sort === "price-asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (a.price === null || b.price === null) return a.price === b.price ? byDate(a, b) : a.price === null ? 1 : -1;
    return (a.price - b.price) * dir || byDate(a, b);
  });
}

/** 페이지 번호 목록. 7쪽 이하면 전부, 넘으면 처음·끝과 현재 주변 2쪽씩 (사이는 null = 생략 표시) */
export function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

/** "1만원 미만" 0.5, "3천원대" 0.3, "2만원대" 2, "10만원대" 10 (만원 단위). 알 수 없으면 null */
export function priceRangeValue(range: string | undefined): number | null {
  if (!range) return null;
  const text = range.replace(/\s+/g, "");
  const under = /^(\d+(?:\.\d+)?)만원미만$/.exec(text);
  if (under) return Number(under[1]) - 0.5;
  const man = /^(\d+(?:\.\d+)?)만원대$/.exec(text);
  if (man) return Number(man[1]);
  const cheon = /^(\d+)천원대$/.exec(text);
  if (cheon) return Number(cheon[1]) / 10;
  return null;
}
