import type { Block, Review } from "@/content/types";
import { COUPANG_DISCLOSURE } from "@/site.config";
import { getCategoryName } from "./content";
import { usableImage } from "./images";
import { absoluteUrl, reviewPath } from "./seo";
import { escapeHtml, inlineToHtml } from "./text";
import { SPECS_SECTION_ID } from "./validate";

// RSS item description 용 본문 전체 HTML (네이버 서치어드바이저는 본문 전체를 요구한다).
// 제휴 링크는 넣지 않고 원문 링크만 둔다 (등록하지 않은 매체에 광고가 노출되지 않게). 대가성 문구는 맨 앞에 둔다.

function list(items: readonly string[], ordered = false): string {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((i) => `<li>${inlineToHtml(i)}</li>`).join("")}</${tag}>`;
}

function blockToHtml(block: Block): string {
  switch (block.type) {
    case "p":
      return `<p>${inlineToHtml(block.text)}</p>`;
    case "h3":
      return `<h3>${escapeHtml(block.text)}</h3>`;
    case "ul":
      return list(block.items);
    case "ol":
      return list(block.items, true);
    case "table": {
      const head = block.head.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join("");
      const rows = block.rows
        .map(
          (row) =>
            `<tr>${row
              .map((cell, c) => (c === 0 ? `<th scope="row">${inlineToHtml(cell)}</th>` : `<td>${inlineToHtml(cell)}</td>`))
              .join("")}</tr>`,
        )
        .join("");
      return `<table><caption>${escapeHtml(block.caption)}</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
    }
    case "callout": {
      const title = block.title ?? { tip: "팁", warn: "주의", info: "참고" }[block.tone];
      return `<p><strong>${escapeHtml(title)}:</strong> ${inlineToHtml(block.text)}</p>`;
    }
    case "img": {
      const image = usableImage(block);
      if (!image) return "";
      const caption = image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : "";
      return `<figure><img src="${escapeHtml(absoluteUrl(image.src))}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}">${caption}</figure>`;
    }
  }
}

export function reviewToHtml(review: Review): string {
  const url = absoluteUrl(reviewPath(review.slug));
  const { product } = review;
  const parts: string[] = [];

  parts.push(`<p><strong>${escapeHtml(COUPANG_DISCLOSURE)}</strong></p>`);

  // 페이지와 같은 순서·소제목: 핵심 요약 → 추천 이유 → 추천 대상 → 사양 → 본문 섹션 → 결론 → 질문
  if (review.summary.length > 0) parts.push(`<h2>핵심 요약</h2>${list(review.summary)}`);

  if (review.cons.length > 0) {
    parts.push(`<h2>장점과 단점</h2>`);
    if (review.pros.length > 0) parts.push(`<h3>장점</h3>${list(review.pros)}`);
    parts.push(`<h3>단점</h3>${list(review.cons)}`);
  } else if (review.pros.length > 0) {
    parts.push(`<h2>이래서 추천해요</h2>${list(review.pros)}`);
  }

  if (review.recommendedFor.length > 0) parts.push(`<h2>이런 분께 추천해요</h2>${list(review.recommendedFor)}`);
  if (review.notRecommendedFor.length > 0) parts.push(`<h3>이런 분께는 안 맞아요</h3>${list(review.notRecommendedFor)}`);

  // 페이지 템플릿과 같은 규칙: 콘텐츠에 사양 섹션이 있으면 그 안에, 없으면 "주요 사양" 섹션을 따로 만든다
  const specsTable =
    product.specs.length > 0
      ? `<table><caption>${escapeHtml(product.name)} 주요 사양</caption><tbody>${product.specs
          .map((s) => `<tr><th scope="row">${escapeHtml(s.label)}</th><td>${escapeHtml(s.value)}</td></tr>`)
          .join("")}</tbody></table>`
      : "";
  const contentHasSpecs = review.sections.some((s) => s.id === SPECS_SECTION_ID);
  if (specsTable && !contentHasSpecs) parts.push(`<h2>주요 사양</h2>${specsTable}`);

  for (const section of review.sections) {
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    if (section.id === SPECS_SECTION_ID && specsTable) parts.push(specsTable);
    parts.push(section.body.map(blockToHtml).join(""));
  }

  parts.push(`<h2>결론</h2>`);
  parts.push(`<p>평점 ${review.rating.toFixed(1)} / 5</p>`);
  parts.push(`<p>${inlineToHtml(review.verdict)}</p>`);

  if (review.faq.length > 0) {
    parts.push(`<h2>자주 묻는 질문</h2>`);
    for (const f of review.faq) parts.push(`<h3>${escapeHtml(f.q)}</h3><p>${inlineToHtml(f.a)}</p>`);
  }

  if (product.priceRange) {
    parts.push(`<p>가격대: ${escapeHtml(product.priceRange)}. 정확한 가격과 재고는 쿠팡에서 확인해 주세요.</p>`);
  }
  parts.push(
    `<p>분류: ${escapeHtml(getCategoryName(review.category))} / 태그: ${review.tags.map((t) => `#${escapeHtml(t)}`).join(" ")}. 원문과 최신 가격 링크는 <a href="${escapeHtml(url)}">${escapeHtml(url)}</a> 에서 볼 수 있습니다.</p>`,
  );

  return parts.join("\n");
}

/** CDATA 안에 "]]>" 가 들어가도 깨지지 않게 나눈다 */
export function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}
