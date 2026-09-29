import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/Blocks";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { renderInline } from "@/components/Inline";
import { JsonLd } from "@/components/JsonLd";
import { PostFeed } from "@/components/PostFeed";
import { getAllTags, getReviewsByTag, getTagInfo, isTagIndexable, resolveTag } from "@/lib/content";
import { buildMetadata, tagJsonLd, tagPath, TAGS_PATH, type Crumb } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import styles from "./tag.module.css";

export const dynamicParams = false;

// 글이 있는 모든 태그 페이지를 만든다. 값은 인코딩하지 않은 한글 그대로 넘긴다.
export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.name }));
}

/** 허브 정보가 없는 태그의 기본 제목·설명 */
function metaFor(tag: string, count: number) {
  const info = getTagInfo(tag);
  if (info) return { title: info.title, h1: info.h1, description: info.description };
  return {
    title: `${tag} 리뷰 모음`,
    h1: `#${tag}`,
    description: `#${tag} 태그가 붙은 리뷰 ${count}개를 모았어요. 사양과 장단점, 관리법을 공개 자료로 비교해 정리한 글이에요.`,
  };
}

export async function generateMetadata({ params }: PageProps<"/tag/[tag]">): Promise<Metadata> {
  const { tag: param } = await params;
  const tag = resolveTag(param);
  if (!tag) notFound();
  const reviews = getReviewsByTag(tag);
  const meta = metaFor(tag, reviews.length);
  const info = getTagInfo(tag);
  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: tagPath(tag),
    keywords: info ? [info.primaryKeyword, ...info.secondaryKeywords] : [tag],
    index: isTagIndexable(tag),
  });
}

export default async function TagPage({ params }: PageProps<"/tag/[tag]">) {
  const { tag: param } = await params;
  const tag = resolveTag(param);
  if (!tag) notFound();

  const info = getTagInfo(tag);
  const reviews = getReviewsByTag(tag);
  const meta = metaFor(tag, reviews.length);
  const crumbs: Crumb[] = [
    { name: siteConfig.name, path: "/" },
    { name: "태그", path: TAGS_PATH },
    { name: `#${tag}`, path: tagPath(tag) },
  ];

  return (
    <>
      <JsonLd data={tagJsonLd(tag, { ...meta, faq: info?.faq }, reviews, crumbs)} />
      <div className="page">
        <Breadcrumbs items={crumbs} />
        <header className={styles.head}>
          <h1 className={styles.hash}>
            <span aria-hidden="true">#</span>
            {tag}
          </h1>
          {info ? (
            info.intro.slice(0, 1).map((paragraph, i) => (
              <p key={i} className={styles.intro}>
                {renderInline(paragraph)}
              </p>
            ))
          ) : (
            <p className={styles.intro}>{meta.description}</p>
          )}
        </header>

        <section id="posts" aria-labelledby="posts-title" className={styles.posts}>
          <h2 id="posts-title" className="feed-title">
            #{tag} 글 <span className="count">{reviews.length}</span>
          </h2>
          <PostFeed reviews={reviews} basePath={tagPath(tag)} />
        </section>

        {info && (info.intro.length > 1 || (info.guide && info.guide.length > 0)) ? (
          <div className={styles.guide}>
            {info.intro.slice(1).map((paragraph, i) => (
              <p key={i} className={styles.guideIntro}>
                {renderInline(paragraph)}
              </p>
            ))}
            {info.guide?.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={styles.guideSection}>
                <h2 id={`${section.id}-title`} className="section-title">
                  {section.heading}
                </h2>
                <Blocks blocks={section.body} idPrefix={section.id} />
              </section>
            ))}
          </div>
        ) : null}

        {info?.faq && info.faq.length > 0 ? (
          <div className={styles.faq}>
            <Faq items={info.faq} />
          </div>
        ) : null}
      </div>
    </>
  );
}
