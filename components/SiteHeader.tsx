import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import Form from "next/form";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* 로고는 h1 이 아니다: 페이지마다 h1 은 본문 제목 하나만 둔다 */}
        <Link href="/" className={styles.brand}>
          <Logo />
          <span className={styles.name}>{siteConfig.name}</span>
        </Link>
        <Form action="/search" className={styles.search} role="search">
          <label htmlFor="site-search-q" className="visually-hidden">
            리뷰 검색
          </label>
          <input
            id="site-search-q"
            name="q"
            type="search"
            placeholder="검색어를 입력해 주세요"
            className={styles.input}
            autoComplete="off"
          />
          <button type="submit" className={styles.button} aria-label="검색">
            <MagnifyingGlassIcon weight="bold" aria-hidden="true" />
          </button>
        </Form>
      </div>
    </header>
  );
}
