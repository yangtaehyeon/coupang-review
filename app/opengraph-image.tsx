import { renderOgImage } from "@/lib/og";
import { siteConfig } from "@/site.config";

export const alt = `${siteConfig.name} 대표 이미지`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    theme: "brand",
    profile: true,
    title: siteConfig.headline,
    hook: siteConfig.author.tagline,
  });
}
