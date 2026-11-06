import { HashIcon, SquaresFourIcon } from "@phosphor-icons/react/ssr";
import type { Route } from "next";
import type { ReactNode } from "react";
import { getActiveCategories, getAllReviews, getReviewsInCategory } from "@/lib/content";
import { categoryPath, TAGS_PATH } from "@/lib/seo";
import { CategoryIcon } from "./CategoryIcon";
import { NavLink } from "./NavLink";
import styles from "./CategoryNav.module.css";

type Item = { href: Route; label: string; tone: string; icon: ReactNode; count?: number };

/**
 * 헤더 바로 아래 카테고리 메뉴 (글 수 포함). 모든 페이지에 한 번만 그린다.
 * 좁은 화면: 아이콘 타일 격자 (화면 밖으로 밀려나는 항목 없이 전부 보인다) / 넓은 화면: 한 줄 탭.
 */
export function CategoryNav() {
  const items: Item[] = [
    {
      href: "/",
      label: "전체",
      tone: "brand",
      icon: <SquaresFourIcon weight="duotone" aria-hidden="true" />,
      count: getAllReviews().length,
    },
    ...getActiveCategories().map(
      (c): Item => ({
        href: categoryPath(c.slug) as Route,
        label: c.name,
        tone: c.tone,
        icon: <CategoryIcon icon={c.icon} />,
        count: getReviewsInCategory(c.slug).length,
      }),
    ),
    { href: TAGS_PATH, label: "태그", tone: "slate", icon: <HashIcon weight="bold" aria-hidden="true" /> },
  ];

  return (
    <nav className={styles.nav} aria-label="카테고리">
      <div className="container">
        <ul role="list" className={styles.list}>
          {items.map((item) => (
            <li key={item.href} data-tone={item.tone}>
              <NavLink href={item.href} className={styles.link}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>
                  {item.label}
                  {item.count !== undefined ? (
                    <span className={styles.count}>
                      {item.count}
                      <span className="visually-hidden">개</span>
                    </span>
                  ) : null}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
