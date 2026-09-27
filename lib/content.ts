import { categories as categoryList } from "@/content/categories";
import { reviews as reviewList } from "@/content/reviews";
import { tagInfos } from "@/content/tags";
import type { Category, Review, TagInfo } from "@/content/types";
import { latestDate } from "./format";
import { validateContent } from "./validate";

// 모든 페이지는 이 모듈을 통해서만 콘텐츠를 읽는다. 모듈을 처음 불러올 때 한 번 검증한다.
validateContent(reviewList, categoryList, tagInfos);

function byPublishedDesc(a: Review, b: Review): number {
  return (
    b.publishedAt.localeCompare(a.publishedAt) ||
    b.updatedAt.localeCompare(a.updatedAt) ||
    a.slug.localeCompare(b.slug)
  );
}

const sortedReviews: readonly Review[] = [...reviewList].sort(byPublishedDesc);
const reviewBySlug = new Map(reviewList.map((r) => [r.slug, r] as const));
const categoryBySlug = new Map(categoryList.map((c) => [c.slug, c] as const));
const tagInfoByName = new Map(tagInfos.map((t) => [t.name, t] as const));

/** 태그 → 글 목록 (게시일 최신순) */
const reviewsByTag = new Map<string, Review[]>();
for (const review of sortedReviews) {
  for (const tag of review.tags) {
    const list = reviewsByTag.get(tag) ?? [];
    list.push(review);
    reviewsByTag.set(tag, list);
  }
}

// ── 리뷰 ─────────────────────────────────────────────

/** 전체 리뷰 (게시일 최신순) */
export function getAllReviews(): Review[] {
  return [...sortedReviews];
}

export function getReview(slug: string): Review | undefined {
  return reviewBySlug.get(slug);
}

/**
 * 관련 리뷰: review.related 에 적은 순서대로 채우고, 모자라면 태그가 많이 겹치는 글 → 같은 카테고리 최신 글 순으로 채운다.
 */
export function getRelated(review: Review, limit = 3): Review[] {
  const picked: Review[] = [];
  const add = (r: Review | undefined) => {
    if (r && r.slug !== review.slug && !picked.includes(r) && picked.length < limit) picked.push(r);
  };
  for (const slug of review.related ?? []) add(reviewBySlug.get(slug));
  const tags = new Set(review.tags);
  const byOverlap = sortedReviews
    .filter((r) => r.slug !== review.slug)
    .map((r) => ({ r, n: r.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  for (const { r } of byOverlap) add(r);
  for (const r of sortedReviews) if (r.category === review.category) add(r);
  return picked;
}

// ── 카테고리 ─────────────────────────────────────────

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

/** 카테고리 표시 이름 (없으면 슬러그) */
export function getCategoryName(slug: string): string {
  return categoryBySlug.get(slug)?.name ?? slug;
}

export function getReviewsInCategory(slug: string): Review[] {
  return sortedReviews.filter((r) => r.category === slug);
}

/** 리뷰가 1개 이상 있는 카테고리만 (정의 순서). 빈 카테고리는 얇은 페이지가 되므로 페이지·메뉴·사이트맵에서 뺀다 */
export function getActiveCategories(): Category[] {
  return categoryList.filter((c) => getReviewsInCategory(c.slug).length > 0);
}

// ── 태그 ─────────────────────────────────────────────

export type TagSummary = { name: string; count: number; info?: TagInfo };

/** 글이 있는 모든 태그 (글 수 많은 순 → 가나다순) */
export function getAllTags(): TagSummary[] {
  return [...reviewsByTag.entries()]
    .map(([name, list]) => ({ name, count: list.length, info: tagInfoByName.get(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
}

export function getReviewsByTag(tag: string): Review[] {
  return [...(reviewsByTag.get(tag) ?? [])];
}

export function getTagInfo(tag: string): TagInfo | undefined {
  return tagInfoByName.get(tag);
}

/** 태그 이름을 URL 파라미터에서 복원한다 (인코딩된 값과 원래 값 모두 받는다) */
export function resolveTag(param: string): string | undefined {
  if (reviewsByTag.has(param)) return param;
  try {
    const decoded = decodeURIComponent(param);
    return reviewsByTag.has(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 태그 페이지를 검색 노출(index)할지: 허브 태그(content/tags.ts)이거나 글이 2개 이상일 때만.
 * 글 1개짜리 태그 페이지는 리뷰 글과 내용이 겹치는 얇은 페이지라 noindex, follow 로 둔다.
 */
export function isTagIndexable(tag: string): boolean {
  return tagInfoByName.has(tag) || (reviewsByTag.get(tag)?.length ?? 0) >= 2;
}

// ── 공통 ─────────────────────────────────────────────

/** 목록의 가장 최근 수정일 (사이트맵, RSS lastBuildDate 용) */
export function getLastUpdated(list: readonly Review[] = sortedReviews): string | undefined {
  return latestDate(list.map((r) => r.updatedAt));
}
