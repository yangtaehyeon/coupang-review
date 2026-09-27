import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/ssr";
import type { Review } from "@/content/types";
import { AffiliateButton, PriceNote } from "./Cta";
import { renderInline } from "./Inline";
import { Stars } from "./Stars";
import { Thumbnail } from "./Thumbnail";
import styles from "./PostParts.module.css";

/** 글 머리 상품 박스: 위젯(또는 썸네일), 이름, 점수, 참고 가격, 주 CTA */
export function ProductHero({ review }: { review: Review }) {
  const { product } = review;
  const score = review.rating.toFixed(1);
  return (
    <section id="product" className={styles.hero} aria-labelledby="product-title">
      <Thumbnail review={review} preload sizes="(min-width: 640px) 13rem, 100vw" className={styles.heroThumb} />
      <div className={styles.heroInfo}>
        <p className={styles.heroBrand}>
          {product.brand}
          {product.model ? ` · ${product.model}` : ""}
        </p>
        <h2 id="product-title" className={styles.heroName}>
          {product.name}
        </h2>
        <p className={styles.heroScore}>
          <Stars rating={review.rating} />
          <span className={styles.scoreNum} aria-hidden="true">
            {score}
          </span>
          <span className="visually-hidden">에디터 점수 5점 만점에 {score}점</span>
        </p>
        {product.priceRange ? <p className={styles.heroPrice}>{product.priceRange}</p> : null}
        <div className={styles.heroCta}>
          <AffiliateButton product={product} />
        </div>
        <PriceNote />
      </div>
    </section>
  );
}

/** 핵심 요약 */
export function Summary({ review }: { review: Review }) {
  if (review.summary.length === 0) return null;
  return (
    <section id="summary" className={styles.summary} aria-labelledby="summary-title">
      <h2 id="summary-title" className={styles.summaryTitle}>
        핵심 요약
      </h2>
      <ul className={styles.summaryList} role="list">
        {review.summary.map((line, i) => (
          <li key={i}>
            <CheckCircleIcon weight="fill" aria-hidden="true" />
            <span>{renderInline(line)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 추천 / 비추천 대상 */
export function Fit({ review }: { review: Review }) {
  if (review.recommendedFor.length === 0 && review.notRecommendedFor.length === 0) return null;
  return (
    <section id="fit" aria-labelledby="fit-title">
      <h2 id="fit-title" className="section-title">
        이런 분께 추천해요
      </h2>
      <div className={styles.fitGrid}>
        {review.recommendedFor.length > 0 ? (
          <ul className={`${styles.fitList} ${styles.yes}`} role="list">
            {review.recommendedFor.map((item, i) => (
              <li key={i}>
                <CheckCircleIcon weight="fill" aria-hidden="true" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {review.notRecommendedFor.length > 0 ? (
          <div className={styles.fitNo}>
            <h3 className={styles.fitNoTitle}>이런 분께는 안 맞아요</h3>
            <ul className={`${styles.fitList} ${styles.no}`} role="list">
              {review.notRecommendedFor.map((item, i) => (
                <li key={i}>
                  <XCircleIcon weight="fill" aria-hidden="true" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** 최종 평가: 점수 + 결론 + 마지막 CTA */
export function FinalVerdict({ review }: { review: Review }) {
  const score = review.rating.toFixed(1);
  return (
    <section id="verdict" className={styles.final} aria-labelledby="verdict-title">
      <div className={styles.finalHead}>
        <h2 id="verdict-title" className={styles.finalTitle}>
          결론
        </h2>
        <p className={styles.finalScore}>
          <Stars rating={review.rating} />
          <span className={styles.scoreNum} aria-hidden="true">
            {score}
          </span>
          <span className="visually-hidden">에디터 점수 5점 만점에 {score}점</span>
        </p>
      </div>
      <div className={styles.finalRow}>
        <Thumbnail review={review} sizes="(min-width: 640px) 13rem, 100vw" className={styles.finalThumb} />
        <div>
          <p className={styles.finalText}>{renderInline(review.verdict)}</p>
          <div className={styles.finalCta}>
            <AffiliateButton product={review.product} />
            <PriceNote />
          </div>
        </div>
      </div>
    </section>
  );
}
