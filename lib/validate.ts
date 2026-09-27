import type { Block, Category, Review, Section, TagInfo } from "@/content/types";
import { isValidDate } from "./format";

// 콘텐츠 검증. 구조 오류(중복 슬러그, 없는 카테고리, 잘못된 태그, 중복 섹션 id 등)는 빌드를 멈추고,
// 문구/정책 관련 의심 사항은 경고만 출력한다.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** 태그: 띄어쓰기, #, /, ?, %, 따옴표 없이 1~20자 */
const TAG_RE = /^[^\s#/?%"'&<>\\]{1,20}$/;

/** 사양 섹션 id. 콘텐츠에 이 id 섹션이 있으면 페이지와 RSS 모두 사양표를 그 섹션 안에 넣는다 */
export const SPECS_SECTION_ID = "specs";

/**
 * 리뷰 페이지 템플릿이 직접 쓰는 앵커 id. 콘텐츠 섹션 id 와 겹치면 안 된다.
 * "specs" 는 예외: 콘텐츠에 id "specs" 섹션이 있으면 사양 타일을 그 섹션 안에 넣고, 없으면 템플릿이 "주요 사양" 섹션을 만든다.
 */
export const RESERVED_REVIEW_IDS = [
  "main",
  "summary",
  "summary-title",
  "product",
  "product-title",
  "fit",
  "fit-title",
  "toc-title-inline",
  "toc-title-side",
  "pros-cons",
  "pros-cons-title",
  "specs-title",
  "faq",
  "faq-title",
  "verdict",
  "verdict-title",
  "method",
  "method-title",
  "author",
  "author-title",
  "related",
  "related-title",
] as const;

/** 태그 허브 페이지 템플릿이 직접 쓰는 앵커 id */
export const RESERVED_TAG_IDS = ["main", "posts", "posts-title", "faq", "faq-title", "co-tags-title"] as const;

/** 실사용처럼 보이거나 과장으로 읽힐 수 있는 표현 (공정위 추천·보증 심사지침, 쿠팡 파트너스 가이드) */
const RISKY_PHRASES = [
  "실사용",
  "써보니",
  "써 보니",
  "사용해보니",
  "사용해 보니",
  "직접 써",
  "내돈내산",
  "솔직 후기",
  "솔직후기",
  "체험 후기",
  "한 달 사용",
  "최저가",
  "1위",
  "최고의",
  "역대급",
  "끝판왕",
] as const;

let warnedOnce = false;

function collectSectionIds(sections: readonly Section[], reserved: readonly string[], where: string, errors: string[]) {
  const seen = new Set<string>();
  for (const section of sections) {
    if (!SLUG_RE.test(section.id)) errors.push(`${where}: 섹션 id "${section.id}" 는 영문 소문자 kebab-case 여야 합니다`);
    if (seen.has(section.id)) errors.push(`${where}: 섹션 id "${section.id}" 가 중복됩니다`);
    if (reserved.includes(section.id)) errors.push(`${where}: 섹션 id "${section.id}" 는 템플릿이 쓰는 예약어입니다`);
    seen.add(section.id);
  }
}

function checkBlocks(blocks: readonly Block[], where: string, warnings: string[]) {
  blocks.forEach((block, i) => {
    if (block.type === "table") {
      block.rows.forEach((row, r) => {
        if (row.length !== block.head.length) {
          warnings.push(`${where} 블록 ${i + 1}: 표 ${r + 1}행의 칸 수(${row.length})가 머리글(${block.head.length})과 다릅니다`);
        }
      });
    }
    if (block.type === "img" && !block.alt.trim()) {
      warnings.push(`${where} 블록 ${i + 1}: 이미지 alt 가 비어 있습니다`);
    }
  });
}

function checkWording(review: Review, warnings: string[]) {
  const where = `리뷰 "${review.slug}"`;
  const headline = `${review.title} ${review.h1} ${review.description} ${review.hook ?? ""}`;
  for (const phrase of RISKY_PHRASES) {
    if (headline.includes(phrase)) warnings.push(`${where}: 제목/h1/설명/hook 에 "${phrase}" 표현이 있습니다 (실사용 오인, 과장 표현 주의)`);
  }
  if (/[–—]/.test(JSON.stringify(review))) {
    warnings.push(`${where}: 긴 대시(—, –)가 있습니다. 쉼표, 괄호, 하이픈(-)으로 바꾸세요`);
  }
  const descLength = review.description.length;
  if (descLength < 60 || descLength > 120) {
    warnings.push(`${where}: description 이 ${descLength}자입니다 (권장 70~110자)`);
  }
  if (review.title.length > 40) {
    warnings.push(`${where}: title 이 ${review.title.length}자입니다. 사이트명까지 붙으면 검색 결과에서 잘릴 수 있습니다`);
  }
  if (!review.product.affiliateUrl.startsWith("https://link.coupang.com/")) {
    warnings.push(`${where}: affiliateUrl 이 쿠팡 파트너스 링크(https://link.coupang.com/...)가 아닙니다. 공개 전 파트너스 대시보드에서 만든 링크로 교체하세요`);
  }
  if (review.pros.length + review.cons.length < 2) {
    warnings.push(`${where}: 장점과 단점을 합쳐 2개 이상이어야 구글 장단점 구조화 데이터 요건을 채웁니다`);
  }
  if (review.summary.length !== 3) {
    warnings.push(`${where}: summary(3줄 요약)가 ${review.summary.length}줄입니다. 3줄로 맞추세요`);
  }
  if (review.tags.length < 3 || review.tags.length > 8) {
    warnings.push(`${where}: 태그가 ${review.tags.length}개입니다 (권장 3~8개)`);
  }
}

function checkTags(tags: readonly string[], where: string, errors: string[]) {
  const seen = new Set<string>();
  for (const tag of tags) {
    if (!TAG_RE.test(tag)) errors.push(`${where}: 태그 "${tag}" 는 띄어쓰기·#·/·?·%·따옴표 없이 1~20자여야 합니다`);
    if (seen.has(tag)) errors.push(`${where}: 태그 "${tag}" 가 중복됩니다`);
    seen.add(tag);
  }
}

export function validateContent(
  reviews: readonly Review[],
  categories: readonly Category[],
  tagInfos: readonly TagInfo[],
): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  const categorySlugs = new Set<string>();
  for (const category of categories) {
    const where = `카테고리 "${category.slug}"`;
    if (!SLUG_RE.test(category.slug)) errors.push(`${where}: 슬러그는 영문 소문자 kebab-case 여야 합니다`);
    if (categorySlugs.has(category.slug)) errors.push(`${where}: 슬러그가 중복됩니다`);
    categorySlugs.add(category.slug);
  }

  const usedTags = new Set(reviews.flatMap((r) => r.tags));
  const tagNames = new Set<string>();
  for (const info of tagInfos) {
    const where = `태그 허브 "${info.name}"`;
    checkTags([info.name], where, errors);
    if (tagNames.has(info.name)) errors.push(`${where}: content/tags.ts 에 중복으로 있습니다`);
    tagNames.add(info.name);
    if (!usedTags.has(info.name)) warnings.push(`${where}: 이 태그를 쓴 리뷰가 없어 페이지가 만들어지지 않습니다`);
    if (info.guide) {
      collectSectionIds(info.guide, RESERVED_TAG_IDS, where, errors);
      info.guide.forEach((s) => checkBlocks(s.body, `${where} 섹션 "${s.id}"`, warnings));
    }
  }

  const reviewSlugs = new Set<string>();
  for (const review of reviews) {
    const where = `리뷰 "${review.slug}"`;
    if (!SLUG_RE.test(review.slug)) errors.push(`${where}: 슬러그는 영문 소문자 kebab-case 여야 합니다`);
    if (reviewSlugs.has(review.slug)) errors.push(`${where}: 슬러그가 중복됩니다`);
    reviewSlugs.add(review.slug);
    if (!categorySlugs.has(review.category)) errors.push(`${where}: 카테고리 "${review.category}" 가 content/categories.ts 에 없습니다`);
    if (review.tags.length === 0) errors.push(`${where}: 태그가 하나도 없습니다`);
    checkTags(review.tags, where, errors);
    for (const [key, value] of [
      ["publishedAt", review.publishedAt],
      ["updatedAt", review.updatedAt],
    ] as const) {
      if (value !== undefined && !isValidDate(value)) errors.push(`${where}: ${key} "${value}" 는 YYYY-MM-DD 형식이어야 합니다`);
    }
    if (isValidDate(review.publishedAt) && isValidDate(review.updatedAt) && review.updatedAt < review.publishedAt) {
      errors.push(`${where}: updatedAt 이 publishedAt 보다 이릅니다`);
    }
    if (!(review.rating >= 1 && review.rating <= 5) || Math.round(review.rating * 2) !== review.rating * 2) {
      errors.push(`${where}: rating 은 1~5 사이 0.5 단위여야 합니다 (현재 ${review.rating})`);
    }
    collectSectionIds(review.sections, RESERVED_REVIEW_IDS, where, errors);
    review.sections.forEach((s) => checkBlocks(s.body, `${where} 섹션 "${s.id}"`, warnings));
    checkWording(review, warnings);
  }

  for (const review of reviews) {
    for (const slug of review.related ?? []) {
      if (slug === review.slug) errors.push(`리뷰 "${review.slug}": related 에 자기 자신이 들어 있습니다`);
      else if (!reviewSlugs.has(slug)) errors.push(`리뷰 "${review.slug}": related 의 "${slug}" 리뷰가 없습니다`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`[content] 콘텐츠 검증 실패\n- ${errors.join("\n- ")}`);
  }
  // 라우트 번들마다 모듈이 따로 로드되므로 프로세스 단위로 한 번만 출력한다
  const flags = globalThis as { __contentWarned?: boolean };
  if (warnings.length > 0 && !warnedOnce && !flags.__contentWarned) {
    warnedOnce = true;
    flags.__contentWarned = true;
    console.warn(`[content] 확인이 필요한 항목 ${warnings.length}개\n- ${warnings.join("\n- ")}`);
  }
}
