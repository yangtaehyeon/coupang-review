import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PostGrid } from "@/components/PostCards";
import { getAllReviews } from "@/lib/content";
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
});

export default function HomePage() {
  const reviews = getAllReviews();

  return (
    <>
      <JsonLd data={homeJsonLd(siteConfig.description)} />
      <div className={`container ${styles.main}`}>
        <h1 className="visually-hidden">{siteConfig.headline}</h1>
        {reviews.length > 0 ? (
          <PostGrid reviews={reviews} headingLevel="h2" />
        ) : (
          <p className={styles.empty}>첫 리뷰를 준비하고 있어요.</p>
        )}
      </div>
    </>
  );
}
