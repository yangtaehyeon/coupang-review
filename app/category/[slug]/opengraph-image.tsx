import { notFound } from "next/navigation";
import { getActiveCategories, getCategory, getReviewsInCategory } from "@/lib/content";
import { renderOgImage } from "@/lib/og";

export const alt = "카테고리 리뷰 모음 썸네일";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getActiveCategories().map((category) => ({ slug: category.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const count = getReviewsInCategory(category.slug).length;
  return renderOgImage({
    theme: category.tone,
    label: "카테고리",
    title: category.h1,
    hook: `리뷰 ${count}개 모아보기`,
  });
}
