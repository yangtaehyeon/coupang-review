import type { Metadata, Viewport } from "next";
// Pretendard 동적 서브셋: 페이지에 쓰인 글자가 든 조각(woff2)만 내려받는다 (font-display: swap)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
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
        {/* main 은 전체 폭: 페이지마다 .container 와 회색 밴드(.band)로 구역을 나눈다 */}
        <main id="main" className="site-main">
          {children}
        </main>
      </body>
    </html>
  );
}
