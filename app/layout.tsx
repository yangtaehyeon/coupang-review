import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
// Pretendard 동적 서브셋: 페이지에 쓰인 글자가 든 조각(woff2)만 내려받는다 (font-display: swap)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { CategoryNav } from "@/components/CategoryNav";
import { HeaderBanner } from "@/components/HeaderBanner";
import { RailBanner } from "@/components/RailBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { rootMetadata } from "@/lib/seo";

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <CategoryNav />
        <div className="site-body">
          <HeaderBanner />
          <main id="main" className="container site-main">
            {children}
          </main>
          <RailBanner />
        </div>
        <SiteFooter />
        {/* Vercel Web Analytics: 쿠키 없이 방문자·페이지뷰를 집계한다 */}
        <Analytics />
      </body>
    </html>
  );
}
