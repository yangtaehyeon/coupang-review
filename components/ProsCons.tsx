import { CheckIcon, MinusIcon, ThumbsDownIcon, ThumbsUpIcon } from "@phosphor-icons/react/ssr";
import { renderInline } from "./Inline";
import styles from "./ProsCons.module.css";

/** 장점/단점: 색만이 아니라 제목(h3)과 아이콘으로 의미를 전달한다. JSON-LD positiveNotes/negativeNotes 와 같은 문장 */
export function ProsCons({ pros, cons }: { pros: readonly string[]; cons: readonly string[] }) {
  return (
    <div className={styles.pc}>
      {pros.length > 0 ? (
        <div className={`${styles.col} ${styles.pros}`}>
          <h3 className={styles.colTitle}>
            <span className={styles.badge}>
              <ThumbsUpIcon weight="fill" aria-hidden="true" />
            </span>
            장점
          </h3>
          <ul className={styles.list} role="list">
            {pros.map((item, i) => (
              <li key={i}>
                <CheckIcon weight="bold" aria-hidden="true" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {cons.length > 0 ? (
        <div className={`${styles.col} ${styles.cons}`}>
          <h3 className={styles.colTitle}>
            <span className={styles.badge}>
              <ThumbsDownIcon weight="fill" aria-hidden="true" />
            </span>
            단점
          </h3>
          <ul className={styles.list} role="list">
            {cons.map((item, i) => (
              <li key={i}>
                <MinusIcon weight="bold" aria-hidden="true" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
