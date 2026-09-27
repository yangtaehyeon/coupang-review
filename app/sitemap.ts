import type { MetadataRoute } from "next";
import {
  getActiveCategories,
  getAllReviews,
  getAllTags,
  getLastUpdated,
  getReviewsByTag,
  getReviewsInCategory,
  isTagIndexable,
} from "@/lib/content";
import { toIsoKst } from "@/lib/format";
import { usableImage } from "@/lib/images";
import { absoluteUrl, categoryPath, reviewPath, tagPath, TAGS_PATH } from "@/lib/seo";

// lastModified 는 콘텐츠의 실제 수정일(updatedAt)만 쓴다. new Date() 는 쓰지 않는다 (구글은 부정확한 lastmod 를 무시).
// changefreq, priority 는 구글이 무시하므로 넣지 않는다. noindex 인 태그 페이지(글 1개짜리)는 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  const reviews = getAllReviews();
  const siteUpdated = getLastUpdated(reviews);
  const lastMod = (date: string | undefined) => (date ? { lastModified: toIsoKst(date) } : {});

  const entries: MetadataRoute.Sitemap = [{ url: absoluteUrl("/"), ...lastMod(siteUpdated) }];

  for (const review of reviews) {
    const image = usableImage(review.product.image);
    entries.push({
      url: absoluteUrl(reviewPath(review.slug)),
      lastModified: toIsoKst(review.updatedAt),
      ...(image ? { images: [absoluteUrl(image.src)] } : {}),
    });
  }

  for (const category of getActiveCategories()) {
    entries.push({
      url: absoluteUrl(categoryPath(category.slug)),
      ...lastMod(getLastUpdated(getReviewsInCategory(category.slug))),
    });
  }

  for (const tag of getAllTags()) {
    if (!isTagIndexable(tag.name)) continue;
    entries.push({ url: absoluteUrl(tagPath(tag.name)), ...lastMod(getLastUpdated(getReviewsByTag(tag.name))) });
  }
  entries.push({ url: absoluteUrl(TAGS_PATH), ...lastMod(siteUpdated) });

  return entries;
}
