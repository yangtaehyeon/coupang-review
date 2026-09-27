import { StarIcon } from "@phosphor-icons/react/ssr";
import type { Route } from "next";
import Link from "next/link";
import type { Review } from "@/content/types";
import { getCategoryName } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { reviewPath, tagPath } from "@/lib/seo";
import { Thumbnail } from "./Thumbnail";
import styles from "./PostCards.module.css";

type HeadingLevel = "h2" | "h3";

function Meta({ review }: { review: Review }) {
  return (
    <p className={styles.meta}>
      <span className={styles.cat}>{getCategoryName(review.category)}</span>
      <time dateTime={review.publishedAt}>{formatDate(review.publishedAt)}</time>
      <span className={styles.score}>
        <StarIcon weight="fill" className={styles.star} aria-hidden="true" />
        <span className="visually-hidden">에디터 점수 </span>
        <span className="num">{review.rating.toFixed(1)}</span>
      </span>
    </p>
  );
}

/** 해시태그 줄. 카드 전체를 덮는 제목 링크보다 위에 올라와 따로 눌린다 */
export function PostTags({ tags, max = 3, className }: { tags: readonly string[]; max?: number; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <ul className={`${styles.tags} ${className ?? ""}`} role="list" aria-label="태그">
      {tags.slice(0, max).map((tag) => (
        <li key={tag}>
          <Link href={tagPath(tag) as Route} className="hashtag">
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 큰 대표 카드 (홈 첫 글) */
export function FeaturedPost({ review, as: Heading = "h2" }: { review: Review; as?: HeadingLevel }) {
  return (
    <article className={styles.featured}>
      <Thumbnail review={review} preload sizes="(min-width: 1024px) 44rem, 100vw" className={styles.featuredThumb} />
      <div className={styles.featuredBody}>
        <Meta review={review} />
        <Heading className={styles.featuredTitle}>
          <Link href={reviewPath(review.slug) as Route} className={styles.link}>
            {review.h1}
          </Link>
        </Heading>
        <PostTags tags={review.tags} max={3} />
      </div>
    </article>
  );
}

/** 목록 한 줄: 썸네일 + 글 정보 (모바일은 위아래로 쌓임) */
export function PostItem({ review, as: Heading = "h3" }: { review: Review; as?: HeadingLevel }) {
  return (
    <article className={styles.item}>
      <Thumbnail review={review} sizes="(min-width: 640px) 16rem, 100vw" className={styles.itemThumb} />
      <div className={styles.itemBody}>
        <Meta review={review} />
        <Heading className={styles.itemTitle}>
          <Link href={reviewPath(review.slug) as Route} className={styles.link}>
            {review.h1}
          </Link>
        </Heading>
        <PostTags tags={review.tags} max={2} />
      </div>
    </article>
  );
}

/** 글 목록 (블로그 피드) */
export function PostList({ reviews, headingLevel = "h3" }: { reviews: readonly Review[]; headingLevel?: HeadingLevel }) {
  if (reviews.length === 0) return null;
  return (
    <ul className={styles.list} role="list">
      {reviews.map((review) => (
        <li key={review.slug}>
          <PostItem review={review} as={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

/** 세로 카드 그리드 (홈, 관련 글) */
export function PostGrid({ reviews, headingLevel = "h3" }: { reviews: readonly Review[]; headingLevel?: HeadingLevel }) {
  if (reviews.length === 0) return null;
  const Heading = headingLevel;
  return (
    <ul className={styles.grid} role="list">
      {reviews.map((review) => (
        <li key={review.slug}>
          <article className={styles.mini}>
            <Thumbnail review={review} sizes="(min-width: 640px) 22rem, 100vw" className={styles.miniThumb} />
            <div className={styles.miniBody}>
              <Meta review={review} />
              <Heading className={styles.miniTitle}>
                <Link href={reviewPath(review.slug) as Route} className={styles.link}>
                  {review.h1}
                </Link>
              </Heading>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
