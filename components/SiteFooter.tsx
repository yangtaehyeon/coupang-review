import { RssSimpleIcon } from "@phosphor-icons/react/ssr";
import type { Route } from "next";
import Link from "next/link";
import { getActiveCategories, getAllReviews, getLastUpdated } from "@/lib/content";
import { categoryPath, reviewPath, TAGS_PATH } from "@/lib/seo";
import { COUPANG_DISCLOSURE, siteConfig } from "@/site.config";
import { Logo } from "./Logo";
import styles from "./SiteFooter.module.css";

const RECENT_COUNT = 5;

/** 모든 페이지 아래: 소개와 대가성 문구, 카테고리, 최근 리뷰, 둘러보기 링크 */
export function SiteFooter() {
  const recent = getAllReviews().slice(0, RECENT_COUNT);
  const categories = getActiveCategories();
  // 빌드 시각이 아니라 마지막 글 날짜로 연도를 정해 같은 내용이면 같은 HTML 이 나오게 한다
  const year = (getLastUpdated() ?? "").slice(0, 4);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.about}>
          <Link href="/" className={styles.brand}>
            <Logo className={styles.logo} />
          </Link>
          <p className={styles.tagline}>{siteConfig.author.tagline}</p>
          <p className={styles.disclosure}>{COUPANG_DISCLOSURE}</p>
        </div>

        <nav className={styles.col} aria-labelledby="footer-categories">
          <p id="footer-categories" className={styles.colTitle}>
            카테고리
          </p>
          <ul role="list" className={styles.links}>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryPath(c.slug) as Route} className={styles.link}>
                  {c.h1}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {recent.length > 0 ? (
          <nav className={`${styles.col} ${styles.recentCol}`} aria-labelledby="footer-recent">
            <p id="footer-recent" className={styles.colTitle}>
              최근 리뷰
            </p>
            <ul role="list" className={styles.links}>
              {recent.map((r) => (
                <li key={r.slug}>
                  <Link href={reviewPath(r.slug) as Route} className={styles.link}>
                    <span className={styles.clamp}>{r.h1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <nav className={styles.col} aria-labelledby="footer-more">
          <p id="footer-more" className={styles.colTitle}>
            둘러보기
          </p>
          <ul role="list" className={styles.links}>
            <li>
              <Link href="/" className={styles.link}>
                전체 리뷰
              </Link>
            </li>
            <li>
              <Link href={TAGS_PATH} className={styles.link}>
                태그 모아보기
              </Link>
            </li>
            <li>
              <Link href="/search" className={styles.link}>
                리뷰 검색
              </Link>
            </li>
            <li>
              <a href="/rss.xml" className={`${styles.link} ${styles.rss}`}>
                <RssSimpleIcon weight="bold" aria-hidden="true" />
                RSS 구독
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {siteConfig.name} <span lang="en">{siteConfig.alternateName}</span>
        </p>
        <p>가격과 재고는 쿠팡에서 수시로 바뀌니 구매 전에 꼭 확인해 주세요.</p>
      </div>
    </footer>
  );
}
