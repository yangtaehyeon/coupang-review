import type { Metadata } from "next";
import { Suspense } from "react";
import { PostCard } from "@/components/PostCards";
import { SearchResults } from "@/components/SearchResults";
import { SearchView } from "@/components/SearchView";
import { getAllReviews, getCategoryName } from "@/lib/content";
import { normalizeSearch, type SearchItem } from "@/lib/search";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/site.config";

// 검색 결과 페이지는 검색엔진 색인에서 뺀다 (얇은 중복 페이지 방지)
export const metadata: Metadata = buildMetadata({
  title: "리뷰 검색",
  description: `${siteConfig.name}의 리뷰를 제품명, 브랜드, 키워드로 찾아보세요.`,
  path: "/search",
  index: false,
});

export default function SearchPage() {
  const items: SearchItem[] = getAllReviews().map((review) => ({
    key: review.slug,
    text: normalizeSearch(
      [
        review.h1,
        review.title,
        review.description,
        review.primaryKeyword,
        ...review.secondaryKeywords,
        ...review.tags,
        getCategoryName(review.category),
        review.product.name,
        review.product.brand,
      ].join(" "),
    ),
    node: <PostCard review={review} headingLevel="h2" />,
  }));
  return (
    <div className="page">
      <h1 className="page-title">리뷰 검색</h1>
      <Suspense fallback={<SearchView items={items} query="" />}>
        <SearchResults items={items} />
      </Suspense>
    </div>
  );
}
