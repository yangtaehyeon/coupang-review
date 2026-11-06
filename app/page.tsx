import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import { PostFeed } from "@/components/PostFeed";
import { getActiveCategories, getAllReviews, getLastUpdated } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { buildMetadata, homeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import styles from "./home.module.css";

// 홈 title 은 브랜드명 중심으로 두고 자주 바꾸지 않는다 (네이버 권고)
const HOME_TITLE = `${siteConfig.name} | ${siteConfig.tagline}`;

export const metadata: Metadata = buildMetadata({
  title: HOME_TITLE,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
  keywords: ["쿠팡 추천템", "쿠팡 생활용품 추천", "생활용품 추천", "살림템 추천", "가전 추천", "뷰티템 추천", "가성비 추천"],
});

export default function HomePage() {
  const reviews = getAllReviews();
  const categoryCount = getActiveCategories().length;
  const updated = getLastUpdated();

  return (
    <>
      <JsonLd data={homeJsonLd(siteConfig.description)} />
      <div className={styles.main}>
        <section className={styles.hero} aria-labelledby="home-title">
          {/* 좁은 화면에서 글이 그림 둘레로 흐르도록(float) 그림을 먼저 둔다 */}
          <div className={styles.art} aria-hidden="true">
            <Image
              src="/images/brand/angel-hero.webp"
              alt=""
              width={800}
              height={800}
              sizes="(min-width: 64rem) 15rem, (min-width: 48rem) 13rem, 6rem"
              loading="eager"
            />
          </div>
          <div className={styles.heroText}>
            <p className="eyebrow">{siteConfig.name} 추천 리뷰</p>
            <h1 id="home-title" className={styles.title}>
              {siteConfig.headline}
            </h1>
            <p className={styles.lede}>{siteConfig.description}</p>
            <dl className={styles.stats}>
              <div>
                <dt>리뷰</dt>
                <dd className="num">{reviews.length}개</dd>
              </div>
              <div>
                <dt>카테고리</dt>
                <dd className="num">{categoryCount}개</dd>
              </div>
              {updated ? (
                <div>
                  <dt>최근 업데이트</dt>
                  <dd>
                    <time dateTime={updated}>{formatDate(updated)}</time>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        <section aria-labelledby="latest-title" className={styles.latest}>
          <h2 id="latest-title" className="feed-title">
            최신 리뷰
          </h2>
          {reviews.length > 0 ? (
            <PostFeed reviews={reviews} basePath="/" />
          ) : (
            <p className={styles.empty}>첫 리뷰를 준비하고 있어요.</p>
          )}
        </section>
      </div>
    </>
  );
}
