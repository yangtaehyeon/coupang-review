import type { Metadata, Viewport } from "next";
// Pretendard 동적 서브셋: 페이지에 쓰인 글자가 든 조각(woff2)만 내려받는다 (font-display: swap)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSidebar } from "@/components/SiteSidebar";
import { rootMetadata } from "@/lib/seo";

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111317" },
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
        {/* 데스크톱: 왼쪽 사이드바(스크롤을 따라옴) + 본문. 모바일: 본문 아래에 사이드바 */}
        <div className="container site-body">
          <main id="main" className="site-main">
            {children}
          </main>
          <SiteSidebar />
        </div>
      </body>
    </html>
  );
}
