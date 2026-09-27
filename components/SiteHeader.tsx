import type { Route } from "next";
import Link from "next/link";
import { getActiveCategories } from "@/lib/content";
import { categoryPath, TAGS_PATH } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import { Avatar } from "./Avatar";
import { NavLink } from "./NavLink";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const items: { href: Route; label: string }[] = [
    { href: "/", label: "홈" },
    { href: TAGS_PATH, label: "태그" },
  ];
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* 로고는 h1 이 아니다: 페이지마다 h1 은 본문 제목 하나만 둔다 */}
        <Link href="/" className={styles.brand}>
          <Avatar size="s" />
          <span className={styles.name}>{siteConfig.name}</span>
        </Link>
        <nav className={styles.nav} aria-label="주요 메뉴">
          <ul role="list" className={styles.list}>
            {items.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className={styles.link}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
