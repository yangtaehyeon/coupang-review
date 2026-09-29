import { Suspense } from "react";
import type { Review } from "@/content/types";
import { type FeedItem, parseFeed, priceRangeValue } from "@/lib/paging";
import { FeedView } from "./FeedView";
import { PagedFeed } from "./PagedFeed";
import { type HeadingLevel, PostCard } from "./PostCards";

/**
 * 정렬·몇 개씩 보기·페이지 나누기가 되는 글 목록. 첫 화면 HTML(검색엔진이 읽는 부분)에는
 * 최신순 1페이지를 그려 두고, 브라우저에서 ?sort=&per=&page= 를 읽어 바꾼다.
 */
export function PostFeed({
  reviews,
  basePath,
  headingLevel = "h3",
}: {
  reviews: readonly Review[];
  basePath: string;
  headingLevel?: HeadingLevel;
}) {
  const items: FeedItem[] = reviews.map((review) => ({
    key: review.slug,
    node: <PostCard review={review} headingLevel={headingLevel} />,
    price: priceRangeValue(review.product.priceRange),
    date: review.publishedAt,
  }));
  const first = parseFeed(null, null, null, items.length);
  return (
    <Suspense fallback={<FeedView items={items} basePath={basePath} {...first} />}>
      <PagedFeed items={items} basePath={basePath} />
    </Suspense>
  );
}
