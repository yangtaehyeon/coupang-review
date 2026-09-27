import { notFound } from "next/navigation";
import { getAllTags, getReviewsByTag, getTagInfo, resolveTag } from "@/lib/content";
import { renderOgImage } from "@/lib/og";

export const alt = "태그별 리뷰 모음 썸네일";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 페이지와 같은 목록: 글이 있는 모든 태그를 인코딩하지 않은 한글 그대로 넘긴다
export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.name }));
}

export default async function Image({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: param } = await params;
  const tag = resolveTag(param);
  if (!tag) notFound();
  return renderOgImage({
    theme: "brand",
    label: "태그",
    title: `#${tag}`,
    hook: getTagInfo(tag)?.h1 ?? `관련 글 ${getReviewsByTag(tag).length}개`,
  });
}
