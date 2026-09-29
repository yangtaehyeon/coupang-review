import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import { AffiliateInlineLink } from "@/components/Cta";
import { Disclosure } from "@/components/Disclosure";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { PostGrid } from "@/components/PostCards";
import { FinalVerdict, Fit, ProductHero, Summary } from "@/components/PostParts";
import { ProsCons } from "@/components/ProsCons";
import { Specs } from "@/components/Specs";
import type { Review } from "@/content/types";
import { getAllReviews, getCategory, getRelated, getReview } from "@/lib/content";
import { toIsoKst } from "@/lib/format";
import { buildMetadata, categoryPath, reviewJsonLd, reviewPath, type Crumb } from "@/lib/seo";
import { SPECS_SECTION_ID as SPECS_ID } from "@/lib/validate";
import { siteConfig } from "@/site.config";
import styles from "./review.module.css";

// 모든 리뷰를 빌드 시점에 정적으로 만든다. 목록에 없는 슬러그는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllReviews().map((review) => ({ slug: review.slug }));
}

function crumbsFor(review: Review): Crumb[] {
  const category = getCategory(review.category);
  return [
    { name: siteConfig.name, path: "/" },
    ...(category ? [{ name: category.name, path: categoryPath(category.slug) }] : []),
    { name: `${review.product.name} 리뷰`, path: reviewPath(review.slug) },
  ];
}

export async function generateMetadata({ params }: PageProps<"/reviews/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) notFound();
  const category = getCategory(review.category);
  return buildMetadata({
    title: review.title,
    description: review.description,
    path: reviewPath(review.slug),
    keywords: [review.primaryKeyword, ...review.secondaryKeywords, ...review.tags],
    type: "article",
    article: {
      publishedTime: toIsoKst(review.publishedAt),
      modifiedTime: toIsoKst(review.updatedAt),
      section: category?.name,
      tags: [...new Set([review.primaryKeyword, ...review.tags])],
    },
  });
}

export default async function ReviewPage({ params }: PageProps<"/reviews/[slug]">) {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) notFound();

  const category = getCategory(review.category);
  const crumbs = crumbsFor(review);
  const related = getRelated(review);
  const { product } = review;
  const hasSpecs = product.specs.length > 0;
  // 콘텐츠에 id "specs" 섹션이 있으면 사양 타일을 그 섹션 안에 넣는다
  const templateSpecs = hasSpecs && !review.sections.some((s) => s.id === SPECS_ID);

  const inlineCta = (
    <p className={styles.inlineCta}>
      <AffiliateInlineLink product={product} />
    </p>
  );

  return (
    <>
      <JsonLd data={reviewJsonLd(review, category, crumbs)} />
      <div className={styles.page}>
        <article>
          <header className={styles.head}>
            <h1 className={styles.h1}>{review.h1}</h1>
            {/* 대가성 문구: 제목 바로 아래, 모든 CTA 보다 위 */}
            <Disclosure />
          </header>

          <div className={styles.flow}>
            <div className={styles.intro}>
              <ProductHero review={review} />
              <Summary review={review} />
            </div>

            <section id="pros-cons" aria-labelledby="pros-cons-title">
              <h2 id="pros-cons-title" className="section-title">
                {review.cons.length > 0 ? "장점과 단점" : "이래서 추천해요"}
              </h2>
              <ProsCons pros={review.pros} cons={review.cons} />
            </section>

            <Fit review={review} />

            {templateSpecs ? (
              <section id={SPECS_ID} aria-labelledby={`${SPECS_ID}-title`}>
                <h2 id={`${SPECS_ID}-title`} className="section-title">
                  주요 사양
                </h2>
                <Specs specs={product.specs} />
                {inlineCta}
              </section>
            ) : null}

            {review.sections.map((section) => {
              const isSpecs = section.id === SPECS_ID;
              return (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                  <h2 id={`${section.id}-title`} className="section-title">
                    {section.heading}
                  </h2>
                  {isSpecs && hasSpecs ? (
                    <div className={styles.specTiles}>
                      <Specs specs={product.specs} />
                    </div>
                  ) : null}
                  <Blocks blocks={section.body} idPrefix={section.id} />
                  {isSpecs ? inlineCta : null}
                </section>
              );
            })}

            <FinalVerdict review={review} />

            <Faq items={review.faq} />
          </div>
        </article>

        {related.length > 0 ? (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className="feed-title">
              함께 보면 좋은 제품
            </h2>
            <PostGrid reviews={related} />
          </section>
        ) : null}
      </div>
    </>
  );
}
