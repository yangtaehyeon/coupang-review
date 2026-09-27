import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { renderInline } from "@/components/Inline";
import { JsonLd } from "@/components/JsonLd";
import { PostList } from "@/components/PostCards";
import { getActiveCategories, getCategory, getReviewsInCategory } from "@/lib/content";
import { buildMetadata, categoryJsonLd, categoryPath, type Crumb } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import styles from "./category.module.css";

export const dynamicParams = false;

// 리뷰가 있는 카테고리만 페이지를 만든다 (빈 카테고리는 404)
export function generateStaticParams() {
  return getActiveCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  return buildMetadata({
    title: category.title,
    description: category.description,
    path: categoryPath(category.slug),
    keywords: [category.primaryKeyword, ...category.secondaryKeywords],
  });
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const reviews = getReviewsInCategory(category.slug);
  const crumbs: Crumb[] = [
    { name: siteConfig.name, path: "/" },
    { name: category.name, path: categoryPath(category.slug) },
  ];

  return (
    <>
      <JsonLd data={categoryJsonLd(category, reviews, crumbs)} />
      <div className="container">
        <Breadcrumbs items={crumbs} />
        <header className={styles.head}>
          <h1 className="page-title">{category.h1}</h1>
          {category.intro.map((paragraph, i) => (
            <p key={i} className={styles.intro}>
              {renderInline(paragraph)}
            </p>
          ))}
        </header>

        <section id="posts" aria-labelledby="posts-title" className={styles.posts}>
          <h2 id="posts-title" className="feed-title">
            {category.name} 글 <span className="count">{reviews.length}</span>
          </h2>
          <PostList reviews={reviews} />
        </section>
      </div>
    </>
  );
}
