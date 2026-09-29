import type { Route } from "next";
import { getActiveCategories, getAllReviews, getReviewsInCategory } from "@/lib/content";
import { categoryPath, reviewPath } from "@/lib/seo";
import { NavLink } from "./NavLink";
import styles from "./SiteSidebar.module.css";

const RECENT_COUNT = 5;

/** 모든 페이지 왼쪽에 붙는 사이드바: 카테고리(글 수)와 최근 글. 데스크톱에서는 스크롤을 따라온다 */
export function SiteSidebar() {
  const reviews = getAllReviews();
  const categories = getActiveCategories();
  const recent = reviews.slice(0, RECENT_COUNT);
  return (
    <aside className={styles.sidebar} aria-label="카테고리와 최근 글">
      <div className={styles.sticky}>
        <nav className={styles.box} aria-labelledby="sidebar-category-title">
          <h2 id="sidebar-category-title" className={styles.title}>
            카테고리
          </h2>
          <ul role="list" className={styles.catList}>
            <li>
              <NavLink href="/" className={styles.catLink}>
                전체보기
                <span className={styles.count}>{reviews.length}</span>
              </NavLink>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <NavLink href={categoryPath(c.slug) as Route} className={`${styles.catLink} ${styles.sub}`}>
                  {c.name}
                  <span className={styles.count}>{getReviewsInCategory(c.slug).length}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {recent.length > 0 ? (
          <section className={`${styles.box} ${styles.recentBox}`} aria-labelledby="sidebar-recent-title">
            <h2 id="sidebar-recent-title" className={styles.title}>
              최근 글
            </h2>
            <ul role="list" className={styles.recentList}>
              {recent.map((r) => (
                <li key={r.slug}>
                  <NavLink href={reviewPath(r.slug) as Route} className={styles.recentLink}>
                    {r.h1}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
