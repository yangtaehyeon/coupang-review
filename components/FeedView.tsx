import type { Route } from "next";
import Link from "next/link";
import { type FeedItem, feedHref, pageWindow, sortFeed, type SortValue } from "@/lib/paging";
import { FeedControls } from "./FeedControls";
import cardStyles from "./PostCards.module.css";
import styles from "./FeedView.module.css";

/** 정렬·몇 개씩 보기 드롭다운 + 글 목록 한 페이지 + 페이지 번호. 서버와 브라우저 양쪽에서 그대로 쓴다 */
export function FeedView({
  items,
  basePath,
  page,
  per,
  sort,
  totalPages,
}: {
  items: readonly FeedItem[];
  basePath: string;
  page: number;
  per: number;
  sort: SortValue;
  totalPages: number;
}) {
  const visible = sortFeed(items, sort).slice((page - 1) * per, page * per);
  const href = (p: number) => feedHref(basePath, { page: p, per, sort }) as Route;
  return (
    <div id="feed" className={styles.feed}>
      <div className={styles.toolbar}>
        <p className={styles.total}>
          전체 <strong className="num">{items.length}</strong>개
        </p>
        <FeedControls basePath={basePath} per={per} sort={sort} />
      </div>

      <ul className={cardStyles.grid} role="list">
        {visible.map((item) => (
          <li key={item.key}>{item.node}</li>
        ))}
      </ul>

      <nav className={styles.pager} aria-label="페이지">
        {page > 1 ? (
          <Link href={href(page - 1)} className={styles.pageLink} rel="prev">
            이전
          </Link>
        ) : (
          <span className={`${styles.pageLink} ${styles.disabled}`} aria-disabled="true">
            이전
          </span>
        )}
        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </span>
          ) : (
            <Link key={p} href={href(p)} className={styles.pageLink} aria-current={p === page ? "page" : undefined}>
              {p}
            </Link>
          ),
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={styles.pageLink} rel="next">
            다음
          </Link>
        ) : (
          <span className={`${styles.pageLink} ${styles.disabled}`} aria-disabled="true">
            다음
          </span>
        )}
      </nav>
    </div>
  );
}
