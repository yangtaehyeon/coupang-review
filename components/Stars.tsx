import { StarHalfIcon, StarIcon } from "@phosphor-icons/react/ssr";
import styles from "./Stars.module.css";

/** 별점 (0.5 단위). 장식용이라 숫자 점수와 함께 쓰고 스크린 리더에는 숨긴다 */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={`${styles.stars} ${className ?? ""}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) =>
        rating >= n ? (
          <StarIcon key={n} weight="fill" className={styles.on} />
        ) : rating >= n - 0.5 ? (
          <StarHalfIcon key={n} weight="fill" className={styles.on} />
        ) : (
          <StarIcon key={n} weight="fill" className={styles.off} />
        ),
      )}
    </span>
  );
}
