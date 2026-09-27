import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/site.config";

// 모든 크롤러(네이버 Yeti, Googlebot 포함)에 전체 허용. /_next/ 의 JS, CSS 도 막지 않는다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
