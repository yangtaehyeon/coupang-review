"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./TrendTicker.module.css";

const SLIDE_MS = 2500;
const HOUR_MS = 3_600_000;

/** 씨앗이 같으면 항상 같은 난수열을 내는 작은 난수기 (mulberry32) */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시간대(seed)마다 정해지는 순위. 같은 시간대에는 누가 봐도 같은 순서다 */
function rankFor(words: readonly string[], seed: number): string[] {
  const random = seededRandom(seed * 2654435761);
  const list = [...words];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// 현재 시간대 번호. 서버(빌드)에서는 0 으로 그려 두고, 브라우저에서 실제 시각으로 바꾼다.
// 1분마다 다시 확인해 정각이 지나면 순위가 바뀐다.
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};
const currentHour = () => Math.floor(Date.now() / HOUR_MS);
const serverHour = () => 0;

/** 직전 시간대와 비교한 순위 변동: 상승 ▲n, 하락 ▼n, 그대로 - */
function Change({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className={`${styles.change} ${styles.up}`}>
        <span aria-hidden="true">▲</span>
        <span className="visually-hidden">상승 </span>
        {value}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className={`${styles.change} ${styles.down}`}>
        <span aria-hidden="true">▼</span>
        <span className="visually-hidden">하락 </span>
        {-value}
      </span>
    );
  }
  return (
    <span className={`${styles.change} ${styles.same}`}>
      <span aria-hidden="true">-</span>
      <span className="visually-hidden">변동 없음</span>
    </span>
  );
}

/**
 * 인기 검색어: 한 줄씩 위로 미끄러지는 순위 + 누르면 아래로 펼쳐지는 전체 순위 패널.
 * 패널의 검색어를 누르면 그 단어로 사이트 안 검색을 한다.
 */
export function TrendRanks({ words }: { words: readonly string[] }) {
  const hour = useSyncExternalStore(subscribe, currentHour, serverHour);
  const before = rankFor(words, hour - 1);
  const ranks = rankFor(words, hour).map((word, i) => ({ word, rank: i + 1, change: before.indexOf(word) - i }));
  const count = ranks.length;

  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  // index === count 는 맨 뒤에 붙인 1위 복제본: 거기까지 미끄러진 뒤 애니메이션 없이 0 으로 되돌려 끊김 없이 돈다
  const [slide, setSlide] = useState({ index: 0, animate: true });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open || paused || count < 2) return;
    const id = setInterval(() => {
      setSlide((s) => (s.index >= count ? { index: 0, animate: false } : { index: s.index + 1, animate: true }));
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [open, paused, count]);

  // 열려 있을 때 바깥을 누르거나 Esc 를 누르면 닫는다
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const listStyle: CSSProperties = {
    transform: `translateY(calc(var(--row) * ${-slide.index}))`,
    transition: slide.animate ? undefined : "none",
  };

  return (
    <div
      ref={rootRef}
      className={styles.ticker}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="trend-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.label}>인기 검색어</span>
        <span className={styles.window} aria-hidden="true">
          <span
            className={styles.list}
            style={listStyle}
            onTransitionEnd={() => setSlide((s) => (s.index >= count ? { index: 0, animate: false } : s))}
          >
            {[...ranks, ranks[0]].map((r, i) => (
              <span key={`${r.word}-${i}`} className={styles.item}>
                <span className={styles.rank}>{r.rank}</span>
                <span className={styles.word}>{r.word}</span>
                <Change value={r.change} />
              </span>
            ))}
          </span>
        </span>
        <span className="visually-hidden">전체 순위 {open ? "닫기" : "펼치기"}</span>
        <CaretDownIcon weight="bold" className={styles.caret} aria-hidden="true" />
      </button>

      <div id="trend-panel" className={styles.panel} data-open={open} inert={!open}>
        <div className={styles.panelInner}>
          <p className={styles.panelTitle}>
            인기 검색어 <span className={styles.panelNote}>1시간마다 갱신</span>
          </p>
          <ol className={styles.panelList} role="list">
            {ranks.map((r) => (
              <li key={r.word}>
                <Link
                  href={`/search?q=${encodeURIComponent(r.word)}` as Route}
                  className={styles.panelLink}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.rank}>{r.rank}</span>
                  <span className={styles.word}>{r.word}</span>
                  <Change value={r.change} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
