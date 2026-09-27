import type { Metadata, Route } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getAllTags } from "@/lib/content";
import { buildMetadata, tagPath, TAGS_PATH, type Crumb } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import styles from "./tags.module.css";

export const metadata: Metadata = buildMetadata({
  title: "태그 모아보기",
  description: `${siteConfig.name}의 모든 리뷰 태그를 모았어요. 제품군, 브랜드, 특징별로 관련 글을 한 번에 찾아보세요.`,
  path: TAGS_PATH,
});

export default function TagsPage() {
  const tags = getAllTags();
  const crumbs: Crumb[] = [
    { name: siteConfig.name, path: "/" },
    { name: "태그", path: TAGS_PATH },
  ];
  return (
    <div className="container page">
      <Breadcrumbs items={crumbs} />
      <header className={styles.head}>
        <h1 className="page-title">태그 모아보기</h1>
      </header>
      <ul className={styles.cloud} role="list">
        {tags.map((t) => (
          <li key={t.name}>
            <Link href={tagPath(t.name) as Route} className={styles.tag}>
              <span className={styles.hash}>#</span>
              {t.name}
              <span className={styles.count}>{t.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
