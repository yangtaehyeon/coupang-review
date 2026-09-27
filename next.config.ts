import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // X-Powered-By 헤더 제거
  poweredByHeader: false,
  // canonical, sitemap, 내부 링크 모두 끝 슬래시 없는 형태로 통일 (/about/ -> /about 308)
  trailingSlash: false,
  // 잘못된 내부 링크를 타입 검사에서 잡는다
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // 직접 촬영했거나 사용 허락을 받은 사진만 public/images 아래에 둔다
    localPatterns: [{ pathname: "/images/**", search: "" }],
  },
};

export default nextConfig;
