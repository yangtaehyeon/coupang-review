import { renderOgImage } from "@/lib/og";

export const alt = "태그 모아보기 페이지 썸네일";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    theme: "brand",
    label: "태그",
    title: "#태그 모아보기",
    hook: "제품군·브랜드·특징별로 찾아보기",
  });
}
