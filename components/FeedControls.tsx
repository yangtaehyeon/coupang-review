"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { feedHref, PER_PAGE_OPTIONS, type SortValue } from "@/lib/paging";
import styles from "./FeedView.module.css";

/** 몇 개씩 보기 드롭다운. 바꾸면 같은 정렬로 1페이지로 돌아간다 */
export function FeedControls({ basePath, per, sort }: { basePath: string; per: number; sort: SortValue }) {
  const router = useRouter();
  return (
    <label className={styles.control}>
      <span className="visually-hidden">한 페이지에 보여 줄 글 수</span>
      <select
        className={styles.select}
        value={per}
        onChange={(e) =>
          router.push(feedHref(basePath, { page: 1, per: Number(e.target.value), sort }, false) as Route, {
            scroll: false,
          })
        }
      >
        {PER_PAGE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}개씩 보기
          </option>
        ))}
      </select>
    </label>
  );
}
