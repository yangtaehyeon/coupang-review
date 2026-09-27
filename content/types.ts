// 리뷰 콘텐츠 스키마. 모든 리뷰/카테고리/태그 데이터는 이 타입을 따른다.
// 사이트 구조: 메인 → 카테고리(가전, 생활 같은 큰 분류) / 태그(가습기, 홈플래닛, 가성비 같은 해시태그) → 리뷰 글.
// 페이지 템플릿이 이 구조로 h1~h3, 목차, JSON-LD, 메타 태그를 자동 생성하므로
// 새 리뷰를 쓸 때는 content/reviews/ 에 파일을 추가하고 index.ts 에 등록만 하면 된다.

/** 본문 인라인 텍스트: **굵게** 표기만 지원한다. */
export type InlineText = string;

export type Block =
  | { type: "p"; text: InlineText }
  | { type: "h3"; text: string }
  | { type: "ul"; items: InlineText[] }
  | { type: "ol"; items: InlineText[] }
  | {
      type: "table";
      caption: string;
      head: string[];
      rows: string[][];
    }
  | {
      type: "callout";
      tone: "tip" | "warn" | "info";
      title?: string;
      text: InlineText;
    }
  | {
      type: "img";
      src: string; // /public 기준 경로 (예: /images/reviews/<slug>/01.webp)
      alt: string;
      width: number;
      height: number;
      caption?: string;
    };

export type Section = {
  /** 목차 앵커용 id (영문 kebab-case, 페이지 내 고유) */
  id: string;
  /** h2 제목. 가능하면 보조 키워드를 자연스럽게 포함 */
  heading: string;
  body: Block[];
};

export type Spec = { label: string; value: string };

export type Faq = { q: string; a: string };

/** 파스텔 색상 톤 (카테고리, 썸네일 배경) */
export type Tone = "sky" | "mint" | "peach" | "lilac" | "lemon" | "rose" | "slate";

/** 카테고리 아이콘 키 */
export type CategoryIconKey =
  | "appliance"
  | "humidifier"
  | "air"
  | "cleaning"
  | "kitchen"
  | "coffee"
  | "living"
  | "bath"
  | "furniture"
  | "sleep"
  | "digital"
  | "audio"
  | "beauty"
  | "fashion"
  | "baby"
  | "pet"
  | "health"
  | "food"
  | "sports"
  | "outdoor"
  | "car"
  | "book"
  | "plant"
  | "package";

/** 카테고리: 가전, 생활, 디지털처럼 큰 분류 (1단계). 리뷰가 없는 카테고리는 자동으로 숨는다 */
export type Category = {
  /** URL 슬러그: /category/<slug> (영문 소문자 kebab-case) */
  slug: string;
  /** 짧은 이름 (메뉴, 브레드크럼) */
  name: string;
  icon: CategoryIconKey;
  tone: Tone;
  /** <title> 용 SEO 제목 (사이트명 템플릿이 뒤에 붙음) */
  title: string;
  /** 페이지 h1 */
  h1: string;
  /** meta description (한글 기준 약 70~110자) */
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  /** 카테고리 페이지 상단 소개 문단 */
  intro: InlineText[];
};

/**
 * 태그 설명 (선택). 태그는 리뷰의 tags 에 적기만 하면 /tag/<태그> 페이지가 자동으로 생긴다.
 * 여기 적은 태그는 소개글·구매 가이드·FAQ 가 붙은 허브 페이지가 되고, 글이 1개여도 검색 노출(index) 대상이 된다.
 * 여기 없는 태그는 글이 2개 이상일 때만 검색 노출 대상이 된다 (얇은 페이지 방지).
 */
export type TagInfo = {
  /** 태그 이름 (리뷰 tags 와 똑같이, 띄어쓰기·# 없이) */
  name: string;
  /** 제품군 아이콘 (이 태그가 첫 태그인 리뷰의 상품 타일에 쓰인다). 없으면 카테고리 아이콘 */
  icon?: CategoryIconKey;
  /** <title> 용 SEO 제목 */
  title: string;
  /** 페이지 h1 */
  h1: string;
  /** meta description (한글 기준 약 70~110자) */
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intro: InlineText[];
  guide?: Section[];
  faq?: Faq[];
};

export type Review = {
  /** URL 슬러그: /reviews/<slug> (영문 소문자 kebab-case) */
  slug: string;
  /** 카테고리 슬러그 (content/categories.ts 에 있어야 한다) */
  category: string;
  /**
   * 해시태그 3~8개 (띄어쓰기·# 없이). 첫 태그는 제품군 태그(예: "가습기").
   * 제품군, 브랜드, 특징, 사용 환경 순으로 적는다. 예: ["가습기", "초음파가습기", "홈플래닛", "상부급수", "원룸", "가성비"]
   */
  tags: string[];
  /** <title> 용 SEO 제목. 주 키워드를 앞쪽에 (사이트명 템플릿이 뒤에 붙음) */
  title: string;
  /** 페이지 h1 (title 과 같거나 조금 더 자연스러운 문장) */
  h1: string;
  /** meta description (한글 기준 약 70~110자, 주 키워드 포함) */
  description: string;
  /** 썸네일 아래줄 문구 (짧게, 예: "사기 전 장단점 총정리"). 없으면 "리뷰 · 장단점 정리" */
  hook?: string;
  /** 미드테일 주 키워드 (페이지당 1개) */
  primaryKeyword: string;
  /** 보조 미드테일/롱테일 키워드 */
  secondaryKeywords: string[];
  /** ISO 날짜 (YYYY-MM-DD) */
  publishedAt: string;
  updatedAt: string;
  product: {
    name: string;
    brand: string;
    model?: string;
    /** 쿠팡 상품 ID (vp/products/<id>) */
    coupangProductId: string;
    /** 쿠팡 파트너스 링크 (link.coupang.com/a/...). 반드시 파트너스 대시보드에서 생성한 링크로 교체 */
    affiliateUrl: string;
    /** 대략적인 가격대 (예: "2만원대"). 정확한 금액·확인 날짜는 쓰지 않는다 */
    priceRange?: string;
    /** 운영자가 직접 찍은 사진만 (쿠팡·판매자 이미지 금지) */
    image?: { src: string; alt: string; width: number; height: number };
    /** 쿠팡 상품 iframe URL (https://coupa.ng/...) */
    iframeUrl?: string;
    specs: Spec[];
  };
  /** 작성자 평가 점수 (1~5, 0.5 단위) */
  rating: number;
  /** 3줄 요약 (글 첫머리 요약 박스). 각 줄은 한 문장 */
  summary: InlineText[];
  /** 최종 평가 한두 문장 (글 끝 평가 박스, 구조화 데이터 reviewBody) */
  verdict: InlineText;
  pros: string[];
  cons: string[];
  recommendedFor: string[];
  notRecommendedFor: string[];
  sections: Section[];
  faq: Faq[];
  /** 관련 리뷰 슬러그 (없으면 태그가 겹치는 글로 자동 채움) */
  related?: string[];
};
