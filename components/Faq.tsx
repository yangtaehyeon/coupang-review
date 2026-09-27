import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import type { Faq as FaqItem } from "@/content/types";
import { renderInline } from "./Inline";
import styles from "./Faq.module.css";

/**
 * 자주 묻는 질문. 질문은 h3, 답변은 접혀 있어도 HTML 본문에 그대로 있다 (검색엔진이 읽는다).
 * 첫 질문만 펼쳐 두어 답변 형식을 바로 보여준다.
 */
export function Faq({ items, id = "faq", title = "자주 묻는 질문" }: { items: readonly FaqItem[]; id?: string; title?: string }) {
  if (items.length === 0) return null;
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId}>
      <h2 id={titleId} className="section-title">
        {title}
      </h2>
      <div className={styles.faq}>
        {items.map((item, i) => (
          <details key={i} className={styles.item} open={i === 0}>
            <summary className={styles.summary}>
              <span className={styles.qMark} aria-hidden="true">
                Q
              </span>
              <h3 className={styles.q}>{item.q}</h3>
              <CaretDownIcon className={styles.caret} weight="bold" aria-hidden="true" />
            </summary>
            <div className={styles.a}>
              <p>{renderInline(item.a)}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
