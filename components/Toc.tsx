"use client";

import { useEffect, useState } from "react";
import styles from "./Toc.module.css";

export type TocItem = { id: string; label: string };

/**
 * 리뷰 목차 (넓은 화면 오른쪽, 스크롤을 따라온다). 지금 읽는 섹션을 표시한다.
 * 링크는 HTML 에 그대로 있어 스크립트 없이도 이동된다.
 */
export function Toc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Set<string>();
    // 화면 위쪽 20~35% 띠에 걸친 섹션 중 가장 앞의 것을 "지금 읽는 곳"으로 본다
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = items.find((item) => visible.has(item.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={styles.toc} aria-labelledby="toc-title">
      <p id="toc-title" className={styles.title}>
        목차
      </p>
      <ol role="list" className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.link} aria-current={active === item.id ? "true" : undefined}>
              <span className={styles.label}>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
