import { StarIcon } from "@phosphor-icons/react/ssr";
import type { Route } from "next";
import Link from "next/link";
import type { Review } from "@/content/types";
import { getCategoryName } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { reviewPath } from "@/lib/seo";
import { Thumbnail } from "./Thumbnail";
import styles from "./PostCards.module.css";

export type HeadingLevel = "h2" | "h3";

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

/** 세로 카드 한 장: 위젯(또는 썸네일) + 분류·날짜·점수 + 제목 */
export function PostCard({ review, headingLevel = "h3" }: { review: Review; headingLevel?: HeadingLevel }) {
  const Heading = headingLevel;
  return (
    <article className={styles.mini}>
      <Thumbnail review={review} sizes="(min-width: 640px) 22rem, 100vw" className={styles.miniThumb} />
      <div className={styles.miniBody}>
        <Meta review={review} />
        <Heading className={styles.miniTitle}>
          <Link href={reviewPath(review.slug) as Route} className={styles.link}>
            {review.h1}
          </Link>
        </Heading>
        {review.product.priceRange ? (
          <p className={styles.price}>
            가격: <strong>{review.product.priceRange}</strong>
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** 세로 카드 그리드 (관련 글, 404) */
export function PostGrid({ reviews, headingLevel = "h3" }: { reviews: readonly Review[]; headingLevel?: HeadingLevel }) {
  if (reviews.length === 0) return null;
  return (
    <ul className={styles.grid} role="list">
      {reviews.map((review) => (
        <li key={review.slug}>
          <PostCard review={review} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
