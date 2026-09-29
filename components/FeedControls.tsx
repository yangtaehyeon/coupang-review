"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { feedHref, PER_PAGE_OPTIONS, SORT_OPTIONS, type SortValue } from "@/lib/paging";
import styles from "./FeedView.module.css";

/** 정렬·몇 개씩 보기 드롭다운. 바꾸면 1페이지로 돌아간다 */
export function FeedControls({ basePath, per, sort }: { basePath: string; per: number; sort: SortValue }) {
  const router = useRouter();
  const go = (next: { per: number; sort: SortValue }) =>
    router.push(feedHref(basePath, { page: 1, ...next }, false) as Route, { scroll: false });
  return (
    <div className={styles.controls}>
      <label className={styles.control}>
        <span className="visually-hidden">정렬</span>
        <select
          className={styles.select}
          value={sort}
          onChange={(e) => go({ per, sort: e.target.value as SortValue })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.control}>
        <span className="visually-hidden">한 페이지에 보여 줄 글 수</span>
        <select className={styles.select} value={per} onChange={(e) => go({ per: Number(e.target.value), sort })}>
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}개씩 보기
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
