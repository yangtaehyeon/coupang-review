// 사이트 전역 설정. 사이트 이름, 도메인, 작성자, 인증 토큰은 모두 여기서 바꾼다.
// 주의: 쿠팡 파트너스 운영정책상 사이트 이름과 도메인에 "쿠팡", "coupang"을 넣으면 안 된다.

function normalizeSiteUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim() || "https://itemangel.com";
  return value.replace(/\/+$/, "");
}

function optionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const siteConfig = {
  /** 사이트 이름 (헤더 워드마크, <title> 템플릿, OG site_name, JSON-LD). TODO(운영자): 확정한 이름으로 교체 */
  name: "아이템 엔젤",
  /** 영문 표기 (JSON-LD alternateName, 한글 폰트를 못 불러올 때 OG 이미지 대체 문구) */
  alternateName: "Item Angel",
  /** 홈 <title> 에 붙는 짧은 설명. 네이버 권고대로 자주 바꾸지 않는다 */
  tagline: "사기 전에 읽는 제품 리뷰",
  /** 홈 h1 과 홈 OG 이미지 제목 */
  headline: "살까 말까 고민될 때, 먼저 읽는 제품 리뷰",
  /** 사이트 기본 meta description (홈에서 사용) */
  description:
    "살까 말까 고민되는 생활가전과 생활용품, 가격과 장단점, 핵심 사양만 한눈에 보이게 정리해요.",
  /** 배포 도메인. NEXT_PUBLIC_SITE_URL 환경 변수로 지정하고, 끝에 / 는 붙이지 않는다 */
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "ko_KR",
  language: "ko-KR",
  author: {
    /** 블로거 닉네임 (헤더 로고 동그라미에 첫 글자가 들어간다). 가상 인물(AI 생성 인물)은 쓰지 않는다 */
    name: "아이템 엔젤",
    /** 프로필 사진 (public 기준 경로, 예: "/profile.jpg"). 없으면 닉네임 첫 글자 동그라미로 표시 */
    avatar: undefined as string | undefined,
    /** 한 줄 소개 (홈 OG 이미지) */
    tagline: "살까 말까 고민될 때 먼저 찾아보는 리뷰 블로그",
    url: "/",
    /** 실제로 운영하는 채널만 넣는다 (예: 네이버 블로그). 없으면 빈 배열로 둔다 */
    sameAs: [] as string[],
  },
  verification: {
    google: optionalEnv(process.env.GOOGLE_SITE_VERIFICATION),
    naver: optionalEnv(process.env.NAVER_SITE_VERIFICATION) ?? "b203fe24ec7aabb2eebcb4d81f641b6559779a1d",
  },
} as const;

/** 쿠팡 파트너스 대가성 문구. 가이드 원문은 "이 포스팅은 ..." (운영자 요청으로 "게시물"로 표기) */
export const COUPANG_DISCLOSURE =
  "이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

/** 제휴 링크 rel 값 (noreferrer 는 넣지 않는다: 등록 매체 확인에 리퍼러가 쓰일 수 있음) */
export const AFFILIATE_REL = "sponsored nofollow noopener";
