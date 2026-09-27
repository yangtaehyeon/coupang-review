import { getAllReviews, getCategoryName, getLastUpdated } from "@/lib/content";
import { toRfc822 } from "@/lib/format";
import { cdata, reviewToHtml } from "@/lib/rss";
import { absoluteUrl, reviewPath } from "@/lib/seo";
import { escapeHtml } from "@/lib/text";
import { siteConfig } from "@/site.config";

// RSS 2.0. 빌드 시점에 정적 파일로 만든다 (GET 라우트는 기본이 동적이라 force-static 필요)
export const dynamic = "force-static";

export function GET() {
  const reviews = getAllReviews();
  const lastUpdated = getLastUpdated(reviews);
  const feedUrl = absoluteUrl("/rss.xml");

  const items = reviews
    .map((review) => {
      const url = absoluteUrl(reviewPath(review.slug));
      return [
        "    <item>",
        `      <title>${escapeHtml(review.h1)}</title>`,
        `      <link>${escapeHtml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeHtml(url)}</guid>`,
        `      <pubDate>${toRfc822(review.publishedAt)}</pubDate>`,
        `      <category>${escapeHtml(getCategoryName(review.category))}</category>`,
        ...review.tags.map((t) => `      <category>${escapeHtml(t)}</category>`),
        `      <description>${cdata(reviewToHtml(review))}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeHtml(siteConfig.name)}</title>`,
    `    <link>${escapeHtml(absoluteUrl("/"))}</link>`,
    `    <description>${escapeHtml(siteConfig.description)}</description>`,
    "    <language>ko</language>",
    ...(lastUpdated ? [`    <lastBuildDate>${toRfc822(lastUpdated)}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeHtml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
