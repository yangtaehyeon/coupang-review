# 리뷰노트 (쿠팡 파트너스 리뷰 사이트)

Next.js 16 App Router 로 만든 정적 리뷰 사이트입니다. 모든 페이지를 빌드 시점에 HTML 로 만들고, 페이지마다 title, description, canonical, Open Graph, JSON-LD 를 자동으로 넣습니다.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 정적 생성 + 타입 검사
npm run start
```

> 사이트 이름 "리뷰노트" 는 임시 이름입니다. `site.config.ts` 의 `name` 을 바꾸면 헤더, 푸터, 타이틀, OG 이미지, JSON-LD 가 함께 바뀝니다.
> **사이트 이름과 도메인에 "쿠팡", "coupang" 을 넣으면 쿠팡 파트너스 운영정책 위반입니다.** 프로젝트 폴더 이름(`coupang-review`)을 그대로 배포 프로젝트 이름으로 쓰면 `coupang-review.vercel.app` 같은 주소가 생기므로, 배포 전에 프로젝트 이름을 바꾸고 전용 도메인을 연결하세요.

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `site.config.ts` | 사이트 이름, 도메인, 작성자, 문의 메일, 대가성 문구, 인증 토큰 |
| `content/types.ts` | 콘텐츠 스키마 (Review, Category, Block 등) |
| `content/categories.ts` | 카테고리 목록 |
| `content/reviews/*.ts` | 리뷰 1개당 파일 1개 |
| `content/reviews/index.ts` | 리뷰 등록부 |
| `lib/` | 콘텐츠 조회·검증(`content.ts`, `validate.ts`), SEO·JSON-LD(`seo.ts`), RSS, OG 이미지 |
| `components/` | 화면 컴포넌트와 CSS Modules |
| `app/` | 라우트: `/`, `/reviews/[slug]`, `/category/[slug]`, `/about`, `/disclosure`, `/privacy`, `/sitemap.xml`, `/robots.txt`, `/rss.xml` |

## 새 리뷰 추가하기

**쿠팡 링크와 함께 '리뷰 써줘'라고 하면 add-review 스킬이 조사부터 검증까지 진행합니다.** Claude Code 에서 `/add-review <쿠팡 링크>` 로 불러도 됩니다.

```text
https://www.coupang.com/vp/products/324788226?itemId=3801974770&vendorItemId=86953840553 리뷰 써줘
```

- 같이 주면 좋은 것: 쿠팡 파트너스 링크(`https://link.coupang.com/a/...`), 직접 써 봤다면 사용 기간·소감·사진. 파트너스 링크가 없으면 일반 상품 URL 에 TODO 주석을 달아 두고, 직접 쓰지 않은 제품은 자료 조사로 썼다고 글 첫머리에 밝힙니다.
- 스킬이 하는 일: 제품 자료 조사(가격 기록, 사양, 구매 후기 경향, 공공기관 자료) → 키워드 조사 → 카테고리·태그 결정 → 글 작성 → 등록과 관련 글 연결 → 타입 검사·린트·빌드와 출력물 점검 → 확인할 점과 다음 글 추천을 한국어로 보고.
- 나중에 "파트너스 링크 넣어줘", "사진 추가해줘"라고 하면 기존 글에 반영합니다.
- 작업 순서와 규칙은 `.claude/skills/add-review/SKILL.md`, 파일 틀과 점검 스크립트는 `.claude/skills/add-review/template.md` 에 있습니다.

### 직접 추가할 때

1. `content/reviews/<새-슬러그>.ts` 를 만듭니다. 틀은 `.claude/skills/add-review/template.md`, 완성 예시는 `content/reviews/homeplanet-humidifier-4l.ts`, 필드 설명은 `content/types.ts` 주석에 있습니다. 슬러그는 영문 소문자 kebab-case(`브랜드-제품-핵심사양`)이고 주소가 되므로 정한 뒤에는 바꾸지 않습니다.
   - `category` 에 카테고리 slug 하나, `tags` 에 태그 3~8개를 적습니다 (아래 "카테고리와 태그").
   - `publishedAt`, `updatedAt` 은 `YYYY-MM-DD`. 내용을 실제로 고쳤을 때만 `updatedAt` 을 바꿉니다 (사이트맵 lastmod, JSON-LD dateModified 에 그대로 쓰입니다).
   - `method` 에 작성 방법을 정직하게 적습니다. 첫 문장은 글 상단(대가성 문구 아래)에, 전체 문장은 글 하단 "작성 방법과 평가 기준" 상자에 나오므로 첫 문장에 직접 사용 여부를 적으세요.
   - `summary` 는 한 문장씩 정확히 3줄(3줄 요약), `hook` 은 썸네일 아래줄 문구(18자 이내), `verdict` 는 최종 평가 한두 문장입니다.
   - 제목, h1, description, hook 에 "실사용", "써보니", "내돈내산", "솔직 후기", "최저가", "1위", "역대급" 같은 표현을 쓰지 않습니다.
   - 긴 대시(—, –) 대신 쉼표, 괄호, 하이픈(-)을 씁니다. 본문 강조는 `**굵게**` 만 됩니다.
   - `sections[].id` 는 페이지 안에서 겹치지 않는 영문 kebab-case 입니다. `summary`, `product`, `fit`, `pros-cons`, `faq`, `verdict`, `method`, `author`, `related` 처럼 템플릿이 쓰는 id 는 쓸 수 없습니다 (전체 목록은 `lib/validate.ts` 의 `RESERVED_REVIEW_IDS`).
   - id 가 `specs` 인 섹션을 만들면 `product.specs` 사양 타일이 그 섹션 제목 바로 아래에 들어갑니다. 없으면 "주요 사양" 섹션이 자동으로 생깁니다.
2. `content/reviews/index.ts` 에 등록합니다.
   ```ts
   import { review as newReview } from "./new-slug";
   export const reviews: Review[] = [homeplanetHumidifier4l, newReview];
   ```
3. 같은 제품군·브랜드 태그를 쓰는 기존 글과 `related` 를 서로 채웁니다 (가까운 글부터 최대 3개). 비워 두면 태그가 많이 겹치는 글로 자동으로 채워집니다.
4. `npm run build` 를 실행합니다. 슬러그 중복, 없는 카테고리, 잘못된 태그, 섹션 id 중복·예약어, 잘못된 날짜·점수, 없는 `related` 는 빌드가 멈추며 알려 주고, 문구·길이·3줄 요약·태그 개수 같은 의심 사항은 `[content]` 경고로 출력됩니다.

## 카테고리와 태그

- **카테고리**는 가전(`appliances`), 생활(`living`), 디지털(`digital`), 주방(`kitchen`)처럼 큰 분류 1단계만 둡니다. 주소는 `/category/<slug>` 입니다. 맞는 분류가 없을 때만 `content/categories.ts` 에 새 카테고리를 추가합니다 (`slug`, `name`, `icon`, `tone`, `title`, `h1`, `description`, `primaryKeyword`, `secondaryKeywords`, `intro`). `icon`, `tone` 은 `content/types.ts` 의 `CategoryIconKey`, `Tone` 목록에서 고릅니다. 따로 등록할 타입은 없고, 리뷰가 없는 카테고리는 페이지·메뉴·사이트맵에 나오지 않으므로 미리 만들어 둬도 됩니다.
- **태그**는 리뷰의 `tags` 에 적기만 하면 `/tag/<태그>` 페이지가 자동으로 생깁니다. 제품군 → 브랜드 → 특징 → 사용 환경·가치 순으로 3~8개를 적습니다 (예: `["가습기", "초음파가습기", "홈플래닛", "상부급수", "원룸", "가성비"]`). 띄어쓰기, `#`, `/`, `?`, `%`, `&`, 따옴표 없이 20자 이내로 쓰고, 이미 쓰는 태그는 표기를 그대로 씁니다.
- 태그 페이지는 글이 2개 이상일 때만 검색 노출(index) 대상입니다. `content/tags.ts` 에 적은 **허브 태그**는 글이 1개여도 노출되고 소개글·구매 가이드·FAQ 가 붙습니다. 새 제품군(무선청소기, 에어프라이어 등)을 처음 다룰 때 "<제품군> 고르는 법" 허브를 추가하면 좋습니다 (예시: `가습기` 허브). 허브에는 브랜드·모델 키워드를 쓰지 않습니다 (리뷰와 같은 검색어를 두고 경쟁하지 않도록).

## 키워드 조사 (`scripts/keywords.ps1`)

네이버와 구글 자동완성을 한 번에 모아 미드테일 키워드를 고를 때 씁니다. 프로젝트 루트에서 실행합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 "홈플래닛 가습기" "초음파 가습기 단점"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 -Expand -Top 3 "가습기 세척"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 -SeedFile seeds.txt -OutFile kw.txt
```

- 시드마다 `N`(네이버), `G`(구글), `Both`(양쪽) 자동완성이 나옵니다. `-Expand -Top 3` 은 시드별 상위 자동완성 3개를 한 단계 더 조회하고, `-SeedFile` 은 한 줄에 시드 하나인 UTF-8 파일(`#` 줄은 건너뜀), `-OutFile` 은 결과를 파일로도 저장합니다.
- 마지막 "Strong signals" 목록(`[NG 2] 키워드`)은 양쪽 엔진에 모두 나왔거나 여러 조회에서 반복된 키워드라 주 키워드 후보로 먼저 봅니다.
- 글 하나에 주 키워드는 1개입니다. 다른 글이나 허브 태그가 이미 쓰는 키워드인지 `content/` 에서 검색해 겹치지 않게 합니다.
- 자동완성에 "내돈내산", "디시" 같은 말이 붙어 나와도 제목과 키워드에는 쓰지 않습니다.

## 쿠팡 파트너스 링크 교체

- 각 리뷰 파일의 `product.affiliateUrl` 을 **쿠팡 파트너스 대시보드에서 생성한 링크**(`https://link.coupang.com/a/...`)로 바꿉니다. 이 값이 파트너스 링크가 아니면 빌드 로그에 경고가 나옵니다.
- 링크를 공개하기 전에 사이트 도메인을 파트너스 채널(매체)에 등록합니다.
- 링크는 받은 그대로 씁니다. 단축 URL, 자체 리다이렉트(`/go/...`), 파라미터 수정은 약관 위반입니다.
- 모든 제휴 링크는 `rel="sponsored nofollow noopener"` 와 새 창 열기로 출력됩니다. 문구는 사이트 전체에서 "쿠팡에서 가격 보기" 하나만 씁니다.
- 대가성 문구("이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.")는 리뷰 제목 바로 아래와 RSS 본문 맨 앞에 자동으로 들어갑니다.
- 가격은 `product.priceRange`("2만원대")로만 적습니다. 정확한 금액과 확인 날짜는 쓰지 않습니다.
- 파트너스 위젯(`<iframe src="https://coupa.ng/...">`)은 `product.iframeUrl` 에 src 만 넣으면 카드, 상품 박스, 결론 상자에 나옵니다.

## 사진 넣기

- 직접 찍었거나 사용 허락을 받은 사진만 `public/images/reviews/<슬러그>/` 에 넣습니다. 쿠팡·판매자 상세페이지 사진, 구매 후기 사진, 쿠팡 로고는 쓰면 안 됩니다.
- 대표 사진: 리뷰 파일의 `product.image` 에 `{ src: "/images/reviews/<슬러그>/01.webp", alt, width, height }` 를 적습니다. 정사각형(예: 800x800 WebP, 흰 배경)을 권장합니다. 결론 박스 썸네일, 목록, 홈 대표 이미지에 쓰입니다.
- 본문 사진: 섹션 `body` 에 `{ type: "img", src, alt, width, height, caption }` 블록을 넣습니다. 캡션에 출처(예: "직접 촬영")를 적습니다.
- 파일이 아직 없으면 깨진 이미지 대신 그 자리를 건너뛰고 빌드 로그에 경고만 남깁니다.

## 환경 변수

`.env.example` 을 `.env.local` 로 복사해 채우고, 배포 서비스(예: Vercel)의 환경 변수에도 같은 이름으로 넣습니다.

| 이름 | 설명 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 대표 주소 (예: `https://example.kr`, 끝에 `/` 없이). canonical, sitemap, RSS, OG, JSON-LD 의 절대 URL 이 모두 이 값으로 만들어집니다. **빌드할 때 값이 들어가므로 바꾸면 다시 빌드해야 합니다.** |
| `GOOGLE_SITE_VERIFICATION` | Search Console HTML 태그 인증값. 비우면 태그를 출력하지 않습니다. |
| `NAVER_SITE_VERIFICATION` | 서치어드바이저 HTML 태그 인증값. 비우면 태그를 출력하지 않습니다. |

http → https, www ↔ 루트 도메인은 호스팅(또는 DNS) 설정에서 301 로 하나로 합칩니다. 네이버는 자바스크립트 리다이렉트를 인정하지 않습니다.

## 네이버 서치어드바이저 등록

1. <https://searchadvisor.naver.com> → 웹마스터 도구 → 사이트 등록에 `NEXT_PUBLIC_SITE_URL` 과 같은 주소(https, 대표 호스트)를 넣습니다.
2. 소유확인: "HTML 태그" 방식을 고르고 `content="..."` 값만 `NAVER_SITE_VERIFICATION` 에 넣은 뒤 다시 배포합니다. 태그는 `<head>` 안에 정적으로 들어갑니다.
3. 요청 → 사이트맵 제출: `https://도메인/sitemap.xml`
4. 요청 → RSS 제출: `https://도메인/rss.xml`
5. 새 리뷰를 올리면 요청 → 웹 페이지 수집에서 리뷰 주소를 한 번 요청합니다 (같은 주소를 매일 반복할 필요는 없습니다).
6. 리포트 → 사이트 최적화 / SEO 진단에서 title, description, H1, 이미지 alt 오류가 0건인지 확인합니다.

## Google Search Console 등록

1. <https://search.google.com/search-console> 에서 **도메인 속성**을 추가하고 DNS TXT 레코드로 인증하는 방법을 권장합니다. URL 접두어 속성을 쓰면 HTML 태그 값을 `GOOGLE_SITE_VERIFICATION` 에 넣습니다.
2. Sitemaps 메뉴에 `sitemap.xml` 을 제출합니다.
3. 새 리뷰는 URL 검사 → 색인 생성 요청을 합니다.
4. 배포 후 [리치 결과 테스트](https://search.google.com/test/rich-results)와 <https://validator.schema.org> 로 리뷰 페이지의 JSON-LD 를 확인합니다.

## 공개 전 확인 목록

- [ ] `site.config.ts`: 사이트 이름, `author`(실명 또는 필명, 역할, 소개), `contactEmail`, `sameAs`(실제 운영 채널만)
- [ ] `app/about/page.tsx`, `app/disclosure/page.tsx`: AI 활용 문단 등 운영 방식 설명이 실제와 같은지
- [ ] `app/privacy/page.tsx`: 호스팅, 분석 도구 도입 여부에 맞게 수정
- [ ] 리뷰의 `affiliateUrl` 을 파트너스 링크로 교체, 도메인을 파트너스 채널에 등록
- [ ] `NEXT_PUBLIC_SITE_URL` 설정 후 배포, 페이지 소스에서 `<head>` 의 title, description, canonical, og, 인증 메타 확인
- [ ] `/sitemap.xml`, `/rss.xml`, `/robots.txt` 가 열리는지 확인

## 구현 메모

- 모든 리뷰, 카테고리 페이지와 OG 이미지는 `generateStaticParams` 로 빌드 시점에 만들어집니다 (`dynamicParams = false`, 없는 주소는 404).
- JSON-LD: 리뷰 페이지는 BlogPosting + Product(Review 중첩, 장단점 포함) + BreadcrumbList + FAQPage, 카테고리는 CollectionPage + ItemList + BreadcrumbList, 홈은 WebSite + Organization, 소개는 ProfilePage. `aggregateRating` 과 `offers` 는 넣지 않습니다 (자체 사용자 평점이 없고, 가격은 계속 바뀝니다).
- OG 이미지는 각 라우트의 `opengraph-image.tsx` 가 텍스트로 그립니다. 한글 글꼴은 설치된 `pretendard` 패키지의 OTF 를 먼저 쓰고, 실패하면 Google Fonts 서브셋, 그것도 실패하면 영문 대체 이미지를 만듭니다.
- 파비콘(`app/favicon.ico`), 애플 터치 아이콘(`app/apple-icon.png`), JSON-LD 로고(`public/logo-512.png`)는 단순한 도형 마크입니다. 로고가 생기면 같은 파일 이름으로 바꾸면 됩니다.
