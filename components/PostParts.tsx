import { CheckCircleIcon, SealCheckIcon, XCircleIcon } from "@phosphor-icons/react/ssr";
import type { Review } from "@/content/types";
import { AffiliateButton, PriceNote } from "./Cta";
import { renderInline } from "./Inline";
import { Stars } from "./Stars";
import { Thumbnail } from "./Thumbnail";
import styles from "./PostParts.module.css";

/** 별점 + 숫자 점수. 보이는 숫자는 장식으로 두고 스크린 리더에는 문장으로 읽힌다 */
function Score({ rating }: { rating: number }) {
  const score = rating.toFixed(1);
  return (
    <p className={styles.score}>
      <Stars rating={rating} />
      <span className={styles.scoreNum} aria-hidden="true">
        {score}
      </span>
      <span className={styles.scoreLabel} aria-hidden="true">
        에디터 점수
      </span>
      <span className="visually-hidden">에디터 점수 5점 만점에 {score}점</span>
    </p>
  );
}

/** 글 머리 상품 박스: 위젯(또는 썸네일), 브랜드, 이름, 점수, 가격대, 주 CTA */
export function ProductHero({ review }: { review: Review }) {
  const { product } = review;
  return (
    <section id="product" className={styles.hero} aria-labelledby="product-title">
      <Thumbnail review={review} preload sizes="(min-width: 640px) 14rem, 100vw" className={styles.heroThumb} />
      <div className={styles.heroInfo}>
        <p className={styles.heroBrand}>
          {product.brand}
          {product.model ? ` · ${product.model}` : ""}
        </p>
        <h2 id="product-title" className={styles.heroName}>
          {product.name}
        </h2>
        <Score rating={review.rating} />
        {product.priceRange ? (
          <p className={styles.heroPrice}>
            <span className={styles.heroPriceLabel}>가격대</span>
            <strong className="num">{product.priceRange}</strong>
          </p>
        ) : null}
        <div className={styles.heroCta}>
          <AffiliateButton product={product} />
          <PriceNote />
        </div>
      </div>
    </section>
  );
}

/** 핵심 요약 (3줄) */
export function Summary({ review }: { review: Review }) {
  if (review.summary.length === 0) return null;
  return (
    <section id="summary" className={styles.summary} aria-labelledby="summary-title">
      <h2 id="summary-title" className={styles.summaryTitle}>
        <SealCheckIcon weight="fill" aria-hidden="true" />
        핵심 요약
      </h2>
      <ol className={styles.summaryList} role="list">
        {review.summary.map((line, i) => (
          <li key={i}>
            <span className={styles.summaryNum} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{renderInline(line)}</span>
          </li>
        ))}
      </ol>
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

/** 최종 평가: 먹색 상자에 점수 + 결론 + 마지막 CTA */
export function FinalVerdict({ review }: { review: Review }) {
  return (
    <section id="verdict" className={styles.final} aria-labelledby="verdict-title">
      <div className={styles.finalHead}>
        <h2 id="verdict-title" className={styles.finalTitle}>
          결론
        </h2>
        <Score rating={review.rating} />
      </div>
      <div className={styles.finalRow}>
        <Thumbnail review={review} sizes="(min-width: 640px) 12rem, 100vw" className={styles.finalThumb} />
        <div className={styles.finalBody}>
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
