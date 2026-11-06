import { StarIcon } from "@phosphor-icons/react/ssr";
import type { Route } from "next";
import Link from "next/link";
import type { Review } from "@/content/types";
import { getCategory } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { reviewPath } from "@/lib/seo";
import { Thumbnail } from "./Thumbnail";
import styles from "./PostCards.module.css";

export type HeadingLevel = "h2" | "h3";

/**
 * 리뷰 카드 한 장: 위젯(또는 썸네일)을 금빛 무대에 세우고 아래에 분류·날짜, 제목, 가격대·점수.
 * 좁은 화면은 왼쪽 위젯 + 오른쪽 글의 가로형, 넓은 화면은 세로형. 제목 링크가 카드 전체를 덮는다.
 */
export function PostCard({ review, headingLevel = "h3" }: { review: Review; headingLevel?: HeadingLevel }) {
  const Heading = headingLevel;
  const category = getCategory(review.category);
  const score = review.rating.toFixed(1);
  return (
    <article className={styles.card}>
      <Thumbnail
        review={review}
        sizes="(min-width: 1024px) 17rem, (min-width: 640px) 45vw, 8.5rem"
        className={styles.thumb}
      />
      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.cat} data-tone={category?.tone ?? "slate"}>
            {category?.name ?? review.category}
          </span>
          <time dateTime={review.publishedAt}>{formatDate(review.publishedAt)}</time>
        </p>
        <Heading className={styles.title}>
          <Link href={reviewPath(review.slug) as Route} className={styles.link}>
            {review.h1}
          </Link>
        </Heading>
        <div className={styles.foot}>
          {review.product.priceRange ? (
            <p className={styles.price}>
              <span className={styles.priceLabel}>가격</span>
              <strong className="num">{review.product.priceRange}</strong>
            </p>
          ) : null}
          <p className={styles.score}>
            <StarIcon weight="fill" aria-hidden="true" />
            <span className="visually-hidden">에디터 점수 5점 만점에 </span>
            <span className="num">{score}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

/** 카드 그리드 (관련 글, 404) */
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
