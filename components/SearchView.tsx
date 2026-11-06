import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import Form from "next/form";
import Image from "next/image";
import { matchesQuery, type SearchItem } from "@/lib/search";
import cardStyles from "./PostCards.module.css";
import styles from "./SearchView.module.css";

/** 검색 입력 + 결과. 검색어가 없으면 전체 글을 보여준다 */
export function SearchView({ items, query }: { items: readonly SearchItem[]; query: string }) {
  const q = query.trim();
  const results = q ? items.filter((item) => matchesQuery(item.text, q)) : items;
  return (
    <>
      <Form action="/search" className={styles.form} role="search">
        <label htmlFor="search-page-q" className="visually-hidden">
          검색어
        </label>
        <MagnifyingGlassIcon weight="bold" className={styles.icon} aria-hidden="true" />
        <input
          key={q}
          id="search-page-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="제품명, 브랜드, 키워드로 찾아보세요"
          className={styles.input}
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit" className={styles.button}>
          검색
        </button>
      </Form>

      <p className={styles.status} role="status">
        {q ? (
          <>
            <strong className={styles.query}>‘{q}’</strong> 검색 결과 <strong className="num">{results.length}</strong>개
          </>
        ) : (
          <>
            전체 리뷰 <strong className="num">{results.length}</strong>개
          </>
        )}
      </p>

      {results.length > 0 ? (
        <ul className={cardStyles.grid} role="list">
          {results.map((item) => (
            <li key={item.key}>{item.node}</li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <Image
            src="/images/brand/angel-search.webp"
            alt=""
            width={800}
            height={800}
            sizes="9rem"
            className={styles.emptyArt}
          />
          <p className={styles.emptyTitle}>찾는 리뷰가 아직 없어요</p>
          <p className={styles.emptyText}>다른 단어로 검색하거나, 위 카테고리에서 둘러보세요.</p>
        </div>
      )}
    </>
  );
}
