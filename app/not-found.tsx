import type { Metadata, Route } from "next";
import Link from "next/link";
import { PostGrid } from "@/components/PostCards";
import { getActiveCategories, getAllReviews } from "@/lib/content";
import { categoryPath, TAGS_PATH } from "@/lib/seo";
import styles from "./not-found.module.css";

// 404 상태로 응답하고 Next.js 가 noindex 를 자동으로 넣는다.
// robots 를 여기서 다시 지정하지 않으면 루트 레이아웃의 "index, follow" 가 함께 출력되어 지시가 충돌한다.
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  description: "요청한 페이지가 없거나 주소가 바뀌었습니다.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const recent = getAllReviews().slice(0, 3);
  const categories = getActiveCategories();
  return (
    <div className="container page">
      <div className={styles.wrap}>
        <p className={styles.code}>404</p>
        <h1 className="page-title">페이지를 찾을 수 없어요</h1>
        <p className={`lede ${styles.text}`}>주소가 바뀌었거나 삭제된 글일 수 있어요. 아래에서 다른 리뷰를 찾아보세요.</p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-dark">
            홈으로 가기
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={categoryPath(c.slug) as Route} className="chip">
              {c.name}
            </Link>
          ))}
          <Link href={TAGS_PATH} className="chip">
            태그
          </Link>
        </div>
      </div>
      {recent.length > 0 ? (
        <section className={styles.recent} aria-labelledby="recent-title">
          <h2 id="recent-title" className="feed-title">
            최근 글
          </h2>
          <PostGrid reviews={recent} />
        </section>
      ) : null}
    </div>
  );
}
