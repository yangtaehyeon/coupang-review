import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import Form from "next/form";
import Link from "next/link";
import { Logo } from "./Logo";
import { TrendTicker } from "./TrendTicker";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* 로고는 h1 이 아니다: 페이지마다 h1 은 본문 제목 하나만 둔다 */}
        <Link href="/" className={styles.brand}>
          <Logo />
        </Link>
        <Form action="/search" className={styles.search} role="search">
          <label htmlFor="site-search-q" className="visually-hidden">
            리뷰 검색
          </label>
          <input
            id="site-search-q"
            name="q"
            type="search"
            placeholder="어떤 제품을 찾으세요?"
            className={styles.input}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" className={styles.button} aria-label="검색">
            <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
          </button>
        </Form>
        <TrendTicker />
      </div>
    </header>
  );
}
