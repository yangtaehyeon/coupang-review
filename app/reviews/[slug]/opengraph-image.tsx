import { notFound } from "next/navigation";
import { getAllReviews, getCategory, getCategoryName, getReview } from "@/lib/content";
import { renderOgImage } from "@/lib/og";

export const alt = "제품 이름과 한 줄 요약, 에디터 점수를 담은 리뷰 썸네일";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 이 파일에서도 generateStaticParams 를 내보내야 리뷰마다 빌드 시점에 정적으로 만들어진다
export function generateStaticParams() {
  return getAllReviews().map((review) => ({ slug: review.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = getReview(slug);
  if (!review) notFound();
  const category = getCategory(review.category);
  return renderOgImage({
    theme: category?.tone ?? "slate",
    label: category?.name ?? getCategoryName(review.category),
    tag: review.tags[0],
    title: review.product.name,
    hook: review.hook ?? "리뷰 · 장단점 정리",
    score: review.rating,
  });
}
