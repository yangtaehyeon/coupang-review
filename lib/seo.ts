import type { Metadata } from "next";
import type { Category, Faq, Review } from "@/content/types";
import { siteConfig } from "@/site.config";
import { toIsoKst } from "./format";
import { usableImage } from "./images";
import { stripInline } from "./text";

// ─────────────────────────────────────────────────────────────
// URL
// ─────────────────────────────────────────────────────────────

export const reviewPath = (slug: string) => `/reviews/${slug}` as const;
export const categoryPath = (slug: string) => `/category/${slug}` as const;
/** 한글 태그는 항상 퍼센트 인코딩해서 링크·canonical·사이트맵에 쓴다 */
export const tagPath = (tag: string) => `/tag/${encodeURIComponent(tag)}` as const;
export const TAGS_PATH = "/tags";

/** 사이트 기준 절대 URL. "/" 는 끝 슬래시를 붙인 https://도메인/ 으로 만든다 */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${clean}`;
}

/** 파일 기반 OG 이미지 경로 (라우트 폴더의 opengraph-image.tsx 가 만드는 PNG) */
export function ogImageUrl(path: string): string {
  const base = path === "/" ? "" : path;
  return absoluteUrl(`${base}/opengraph-image`);
}

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

type ArticleMeta = {
  publishedTime: string;
  modifiedTime: string;
  section?: string;
  tags?: string[];
};

type BuildMetadataInput = {
  /** <title> 본문. 레이아웃 템플릿("%s | 사이트명")이 뒤에 붙는다 */
  title: string;
  description: string;
  /** 이 페이지의 canonical 경로 ("/reviews/slug") */
  path: string;
  /** true 면 템플릿 없이 title 그대로 쓴다 (홈) */
  absoluteTitle?: boolean;
  type?: "website" | "article" | "profile";
  article?: ArticleMeta;
  /** false 면 noindex, follow (글 1개짜리 태그처럼 얇은 목록 페이지) */
  index?: boolean;
  /** <meta name="keywords">. 중복은 빼고 넣는다 */
  keywords?: readonly string[];
};

const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/rss.xml", title: `${siteConfig.name} RSS` }],
};

/**
 * 페이지별 메타데이터. openGraph, alternates 는 레이아웃 값과 얕게 병합되어 통째로 덮어쓰이므로
 * siteName, locale, RSS 링크까지 매번 다시 넣는다. og:image 는 각 라우트의 opengraph-image.tsx 가 채운다.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { title, description, path } = input;
  const base = {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: path,
    title,
    description,
  };
  const openGraph: Metadata["openGraph"] =
    input.type === "article" && input.article
      ? {
          ...base,
          type: "article",
          publishedTime: input.article.publishedTime,
          modifiedTime: input.article.modifiedTime,
          authors: [absoluteUrl(siteConfig.author.url)],
          section: input.article.section,
          tags: input.article.tags,
        }
      : input.type === "profile"
        ? { ...base, type: "profile" }
        : { ...base, type: "website" };

  return {
    title: input.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, types: RSS_ALTERNATE },
    openGraph,
    twitter: { card: "summary_large_image", title, description },
    ...(input.keywords && input.keywords.length > 0 ? { keywords: [...new Set(input.keywords)] } : {}),
    ...(input.index === false ? { robots: { index: false, follow: true } } : {}),
  };
}

/** 루트 레이아웃 기본값 (페이지가 덮어쓰지 않는 필드만 의미가 있다) */
export function rootMetadata(): Metadata {
  const { verification } = siteConfig;
  const other: Record<string, string> = {};
  if (verification.naver) other["naver-site-verification"] = verification.naver;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.author.name, url: absoluteUrl(siteConfig.author.url) }],
    // nosnippet, nosourceinfo 는 넣지 않는다 (네이버 AI 출처 제외, 스니펫 제한)
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    // canonical 은 여기 두지 않는다: 레이아웃 canonical 은 자기 canonical 이 없는 모든 페이지로 상속된다
    alternates: { types: RSS_ALTERNATE },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, address: false, email: false },
    ...(verification.google || verification.naver
      ? {
          verification: {
            ...(verification.google ? { google: verification.google } : {}),
            ...(Object.keys(other).length > 0 ? { other } : {}),
          },
        }
      : {}),
  };
}

// ─────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────

export type JsonLdValue = string | number | boolean | null | undefined | JsonLdValue[] | JsonLdObject;
export type JsonLdObject = { [key: string]: JsonLdValue };

const ids = {
  website: () => `${absoluteUrl("/")}#website`,
  organization: () => `${absoluteUrl("/")}#organization`,
  author: () => `${absoluteUrl(siteConfig.author.url)}#author`,
};

function authorRef(): JsonLdObject {
  return {
    "@type": "Person",
    "@id": ids.author(),
    name: siteConfig.author.name,
    url: absoluteUrl(siteConfig.author.url),
  };
}

function logo(): JsonLdObject {
  return { "@type": "ImageObject", url: absoluteUrl("/logo-512.png"), width: 512, height: 512 };
}

function organizationRef(withLogo = false): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ids.organization(),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    ...(withLogo ? { logo: logo() } : {}),
  };
}

function websiteRef(): JsonLdObject {
  return { "@type": "WebSite", "@id": ids.website(), name: siteConfig.name, url: absoluteUrl("/") };
}

export type Crumb = { name: string; path: string };

/** 화면 브레드크럼과 같은 배열로 만든다 (이름, 순서 일치) */
export function breadcrumbJsonLd(crumbs: readonly Crumb[], pagePath: string): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(pagePath)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

function faqJsonLd(faq: readonly Faq[], pagePath: string): JsonLdObject {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(pagePath)}#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: stripInline(f.q),
      acceptedAnswer: { "@type": "Answer", text: stripInline(f.a) },
    })),
  };
}

function itemList(items: readonly string[]): JsonLdObject {
  return {
    "@type": "ItemList",
    itemListElement: items.map((name, i) => ({ "@type": "ListItem", position: i + 1, name: stripInline(name) })),
  };
}

/** 리뷰 페이지: BlogPosting + Product(review 중첩) + BreadcrumbList + FAQPage. aggregateRating, offers 는 넣지 않는다 */
export function reviewJsonLd(review: Review, category: Category | undefined, crumbs: readonly Crumb[]): JsonLdObject {
  const path = reviewPath(review.slug);
  const url = absoluteUrl(path);
  const productId = `${url}#product`;
  const image = usableImage(review.product.image);
  const hasNotes = review.pros.length + review.cons.length >= 2;

  const graph: JsonLdObject[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      headline: review.h1,
      description: review.description,
      inLanguage: siteConfig.language,
      datePublished: toIsoKst(review.publishedAt),
      dateModified: toIsoKst(review.updatedAt),
      author: authorRef(),
      publisher: organizationRef(true),
      isPartOf: websiteRef(),
      image: [ogImageUrl(path), ...(image ? [absoluteUrl(image.src)] : [])],
      articleSection: category?.name,
      keywords: [...new Set([review.primaryKeyword, ...review.secondaryKeywords, ...review.tags])],
      about: { "@id": productId },
    },
    {
      "@type": "Product",
      "@id": productId,
      name: review.product.name,
      brand: { "@type": "Brand", name: review.product.brand },
      model: review.product.model,
      image: image ? absoluteUrl(image.src) : undefined,
      review: {
        "@type": "Review",
        name: review.h1,
        author: authorRef(),
        publisher: organizationRef(),
        datePublished: toIsoKst(review.publishedAt),
        reviewBody: stripInline(review.verdict),
        reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
        positiveNotes: hasNotes && review.pros.length > 0 ? itemList(review.pros) : undefined,
        negativeNotes: hasNotes && review.cons.length > 0 ? itemList(review.cons) : undefined,
      },
    },
    breadcrumbJsonLd(crumbs, path),
  ];
  if (review.faq.length > 0) graph.push(faqJsonLd(review.faq, path));
  return { "@context": "https://schema.org", "@graph": graph };
}

type CollectionInput = {
  path: string;
  name: string;
  description: string;
  listName: string;
  reviews: readonly Review[];
  crumbs: readonly Crumb[];
  faq?: readonly Faq[];
};

/** 목록 페이지 공통: CollectionPage + ItemList + BreadcrumbList (+ 화면에 보이는 FAQ) */
function collectionJsonLd({ path, name, description, listName, reviews, crumbs, faq }: CollectionInput): JsonLdObject {
  const url = absoluteUrl(path);
  const graph: JsonLdObject[] = [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: siteConfig.language,
      isPartOf: websiteRef(),
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#itemlist` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      name: listName,
      numberOfItems: reviews.length,
      itemListElement: reviews.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(reviewPath(r.slug)),
        name: r.h1,
      })),
    },
    breadcrumbJsonLd(crumbs, path),
  ];
  if (faq && faq.length > 0) graph.push(faqJsonLd(faq, path));
  return { "@context": "https://schema.org", "@graph": graph };
}

/** 카테고리 페이지 */
export function categoryJsonLd(category: Category, reviews: readonly Review[], crumbs: readonly Crumb[]): JsonLdObject {
  return collectionJsonLd({
    path: categoryPath(category.slug),
    name: category.h1,
    description: category.description,
    listName: `${category.name} 리뷰 목록`,
    reviews,
    crumbs,
  });
}

/** 태그 페이지 (허브 태그는 FAQ 포함) */
export function tagJsonLd(
  tag: string,
  meta: { h1: string; description: string; faq?: readonly Faq[] },
  reviews: readonly Review[],
  crumbs: readonly Crumb[],
): JsonLdObject {
  return collectionJsonLd({
    path: tagPath(tag),
    name: meta.h1,
    description: meta.description,
    listName: `#${tag} 글 목록`,
    reviews,
    crumbs,
    faq: meta.faq,
  });
}

/** 홈 전용: WebSite + Organization. 사이트 이름 결정에 쓰이므로 홈에만 둔다 */
export function homeJsonLd(description: string): JsonLdObject {
  const sameAs = siteConfig.author.sameAs;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...websiteRef(),
        alternateName: [siteConfig.alternateName],
        description,
        inLanguage: siteConfig.language,
        publisher: { "@id": ids.organization() },
      },
      {
        ...organizationRef(true),
        ...(sameAs.length > 0 ? { sameAs: [...sameAs] } : {}),
      },
    ],
  };
}
