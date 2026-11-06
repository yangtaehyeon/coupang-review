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
    <div className="page">
      <Breadcrumbs items={crumbs} />
      <header className={styles.head}>
        <p className="eyebrow">
          <span>
            태그 <span className="num">{tags.length}</span>개
          </span>
        </p>
        <h1 className="page-title">태그 모아보기</h1>
        <p className={styles.lede}>제품군, 브랜드, 특징별로 관련 리뷰를 한 번에 찾아보세요. 글이 많은 태그부터 보여 드려요.</p>
      </header>
      <ul className={styles.cloud} role="list">
        {tags.map((t) => (
          <li key={t.name}>
            <Link href={tagPath(t.name) as Route} className={styles.tag} data-hub={t.info ? "true" : undefined}>
              <span className={styles.hash} aria-hidden="true">
                #
              </span>
              {t.name}
              {t.info ? <span className={styles.guide}>가이드</span> : null}
              <span className={styles.count}>
                {t.count}
                <span className="visually-hidden">개</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
