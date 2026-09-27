import type { Route } from "next";
import Link from "next/link";
import type { Crumb } from "@/lib/seo";
import styles from "./Breadcrumbs.module.css";

/** 화면 브레드크럼. JSON-LD BreadcrumbList 와 같은 배열을 넘겨 이름과 순서를 맞춘다 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav className={styles.crumbs} aria-label="이동 경로">
      <ol role="list">
        {items.map((item, i) => (
          <li key={item.path}>
            {i === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.path as Route}>{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
