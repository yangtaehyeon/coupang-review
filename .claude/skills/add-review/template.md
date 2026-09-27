# add-review templates

Copy what you need, replace every `<...>`, delete comments that no longer apply. Keep the source block at the top of the review file, and keep the two TODO lines while there is no Partners link. The finished reference is `content/reviews/homeplanet-humidifier-4l.ts`.

## 1. Review file: `content/reviews/<slug>.ts`

```ts
import type { Review } from "../types";

// 작성 원칙: 작성자는 이 제품을 아직 직접 사용하지 않았다. (직접 썼다면: YYYY-MM-DD 부터 N주 사용, 입수 경로)
// 모든 수치는 아래 출처에서 가져왔고, 출처끼리 엇갈리는 값은 본문에 그 사실을 밝혔다.
// 실사용 후 사진·소감을 추가할 때 updatedAt 도 함께 고친다.
//
// 출처 (YYYY-MM-DD 확인)
// - 가격대: https://www.lowchart.com/<productId>-<itemId> (priceRange 판단용. 정확한 가격·날짜는 글에 쓰지 않는다)
// - 사양: https://prod.danawa.com/info/?pcode=<pcode>, <노써치·제조사·설명서 URL>
// - 쿠팡 필수 표기(모델명, 제조국, 출시년월, KC, A/S): <그 내용을 옮긴 구매자 블로그 URL>
// - 구매 후기 경향: 네이버 블로그 N건 (YYYY-MM ~ YYYY-MM). 대표: <URL>, <URL>, <URL>
// - 배경 자료: <기관, 자료명, 발표일, URL>
// - 엇갈림: <항목>: <값 A (출처)> vs <값 B (출처)>
// - 확인 못 함: <항목>, <항목>

export const review: Review = {
  slug: "<brand-product-keyspec>", // 파일명과 같게, 영문 소문자 kebab-case. 주소가 되므로 한 번 정하면 바꾸지 않는다
  category: "<appliances>", // content/categories.ts 의 slug 하나
  tags: ["<제품군>", "<세부유형>", "<브랜드>", "<특징>", "<사용환경>", "<가치>"], // 3~8개, 이 순서, 기존 표기 그대로
  title: "<주 키워드> 강력추천, <후기 N건·가격대·강점 문구>", // 40자 이하, 주 키워드로 시작 (" | 사이트명" 은 자동)
  h1: "<후기 N건> <가격대> <제품군> 강력추천: <주 키워드>", // 구매를 부르는 문구 먼저. 예: 후기 5만건 2만원대 가습기 강력추천
  description:
    "<가격대>에 <강점 3개>까지 갖춘 <주 키워드>. <사회적 증거·소모품 없음 같은 장점>을 핵심만 정리했어요.", // 70~110자, 주 키워드 1회, 단점 없이
  hook: "<강점> · <강점> · <강점>", // 18자 이하
  primaryKeyword: "<주 키워드>", // 제품 특정 미드테일 1개
  secondaryKeywords: [
    // 5~8개. 장점, tips 섹션, FAQ 중 한 곳에 자연스럽게 넣는다
    "<브랜드 변형>",
    "<브랜드 모델명>",
    "<설정 질문: 무드등 끄기>",
    "<특징형: 상부급수형 가습기>",
    "<환경형: 원룸 가습기>",
    "<가치형: 가성비 가습기>",
  ],
  publishedAt: "YYYY-MM-DD", // 오늘 (KST)
  updatedAt: "YYYY-MM-DD", // 새 글은 publishedAt 과 같게. 내용을 실제로 고쳤을 때만 바꾼다
  product: {
    name: "<브랜드 제품명 핵심규격>", // 짧게. 브레드크럼, 결론 박스, JSON-LD Product 이름
    brand: "<브랜드>",
    model: "<모델명>", // 확인된 경우만, 아니면 줄을 지운다
    coupangProductId: "<productId>",
    // TODO: 쿠팡 파트너스 대시보드에서 생성한 단축 링크(https://link.coupang.com/a/...)로 교체하세요.
    // 지금 값은 일반 상품 URL이라 파트너스 수수료가 잡히지 않습니다. 링크는 받은 원본 그대로 넣고 가공하지 마세요.
    affiliateUrl:
      "https://www.coupang.com/vp/products/<productId>?itemId=<itemId>&vendorItemId=<vendorItemId>",
    // 운영자가 준 파트너스 위젯 iframe 의 src 만 (없으면 줄을 지운다)
    iframeUrl: "https://coupa.ng/<code>",
    priceRange: "<N만원대>", // 정확한 가격·날짜는 쓰지 않는다
    // 운영자가 찍은 사진이 생겼을 때만 (쿠팡·판매자·후기 사진 금지):
    // image: { src: "/images/reviews/<slug>/01.webp", alt: "<제품명> 본체 정면", width: 800, height: 800 },
    specs: [
      // 6~8행, 값은 짧게. 확인 못 한 값은 넣지 않는다
      { label: "모델명", value: "<모델명> (<옵션·계열>)" },
      { label: "<핵심 규격>", value: "<값> (<출처> 등록 정보)" },
      { label: "<핵심 기능>", value: "<값>" },
      { label: "제조국·출시", value: "<국가> / YYYY년 M월" },
      { label: "품질보증", value: "<기간>, <A/S 연락처>" },
    ],
  },
  rating: 5, // 항상 5
  summary: [
    // 정확히 3줄, 줄마다 짧은 한 문장 (25~50자)
    "<가격대>에 <핵심 기능 3~4개>가 다 들어 있어요.",
    "<가장 강한 장점: 소모품 0원, 후기 N건 등>이에요.",
    "<이런 환경·사람>에게 딱이에요.",
  ],
  verdict: "<가격대>에 <핵심 강점>까지 갖춘 <포지션> 제품이에요. <이런 사람>에게 강력추천해요.", // 1~2문장, 굵게 없이
  pros: [
    // 4개. 짧은 한 문장에 사실 하나 + 좋은 점
    "<사실>이라 <이런 점이 좋아요>.",
  ],
  cons: [], // 항상 비운다
  recommendedFor: ["<구체적 상황>인 분"], // 3개
  notRecommendedFor: [], // 항상 비운다
  sections: [
    // 이 두 개만. specs 섹션은 만들지 않는다 (템플릿이 주요 사양과 중간 구매 링크를 만든다)
    {
      id: "buying-points",
      heading: "<주 키워드> 구매 포인트 <N>가지",
      body: [
        // 5~6쌍: 번호 붙은 h3(보조 키워드 하나) + 출처 있는 사실 2문장
        { type: "h3", text: "1. <보조 키워드>라 <장점>" },
        { type: "p", text: "<사실과 근거>. <그래서 좋은 점>." },
      ],
    },
    {
      id: "how-to-use",
      heading: "<브랜드> <제품군> 사용법과 세척, 위치까지 한 번에",
      body: [
        { type: "h3", text: "사용법: <한 줄 요약>" },
        { type: "ol", items: ["<단계 1>", "<단계 2>", "<단계 3>"] },
        { type: "h3", text: "<브랜드> <제품군> 세척: <한 줄 요약>" },
        { type: "p", text: "<구조가 단순해서 금방 끝나요 같은 긍정형 한 줄>." },
        { type: "ul", items: ["**매일:** <할 일>", "**이틀마다:** <할 일>", "**일주일마다:** <할 일>"] },
        { type: "h3", text: "<사용환경> <제품군> 위치는 이렇게" },
        { type: "ul", items: ["**<라벨>:** <긍정형 팁>", "**<라벨>:** <긍정형 팁>", "**<라벨>:** <긍정형 팁>"] },
      ],
    },
  ],
  faq: [
    // 5개. 보조 키워드로 만든 검색어 같은 질문 (필터, 사용 시간, 설정 방법, 세척 주기, 위치), 답은 1~2문장
    { q: "<제품> <검색어처럼 묻는 질문>?", a: "<직접 답>." },
  ],
  related: [], // 같은 제품군 > 같은 브랜드 > 같은 사용 환경 순으로 최대 3개
};
```

## 2. Register: `content/reviews/index.ts`

```ts
import { review as brandProductKeyspec } from "./brand-product-keyspec";

export const reviews: Review[] = [homeplanetHumidifier4l, brandProductKeyspec];
```

## 3. Hub tag: `content/tags.ts` (TagInfo, append to `tagInfos`)

Model: the `가습기` hub already in that file. No brand or model keywords here.

```ts
  {
    name: "<제품군>", // 리뷰 tags 의 첫 태그와 똑같이
    title: "<제품군> 고르는 법: <기준>·<기준>·<기준> 정리",
    h1: "<제품군> 고르는 법과 리뷰 모음",
    description:
      "<제품군> 종류별 장단점, <크기·용량 기준>, <관리 기준>까지 <제품군> 고르는 법을 정리하고, 자료 조사로 작성한 <제품군> 리뷰를 모았어요.", // 70~110자
    primaryKeyword: "<제품군> 고르는 법",
    secondaryKeywords: ["<제품군> 종류 비교", "<제품군> 종류별 장단점", "<제품군> 용량", "<관리형 키워드>", "<소음·전기형 키워드>"],
    intro: [
      "<제품군> 고르는 법은 <기준 1>, <기준 2>, <기준 3> 순서로 보면 돼요. 이 페이지에는 그 기준과 <제품군> 리뷰를 모았어요.",
      "이 사이트의 <제품군> 리뷰는 제품을 직접 사용하지 않았다면 그 사실을 글 첫머리에 밝히고, 판매처 공개 사양·가격 기록·구매 후기 경향·공공기관 자료를 분석해 작성해요. 직접 사용한 뒤에는 사진과 소감을 덧붙이고 수정일을 고쳐 적어요.",
      "<안전·관리 공통 주의 (공공기관 출처)>",
    ],
    guide: [
      // 3~4개, 출처 있는 일반 정보만. id 는 main, posts, posts-title, faq, faq-title, co-tags-title 을 피한다
      { id: "types", heading: "<제품군> 종류별 장단점 비교: <유형>·<유형>", body: [/* p + table(caption 에 기준일·출처) + callout */] },
      { id: "size", heading: "<공간·용도>에 맞는 <용량·크기> 고르기", body: [] },
      { id: "care", heading: "<관리 쉬운 제품> 고르는 기준", body: [] },
      { id: "checklist", heading: "<소음·전기요금·설치> 체크포인트", body: [] },
    ],
    faq: [
      // 4~6개, 제품군 공통 질문 (특정 제품 질문은 리뷰 FAQ 로)
      { q: "<제품군> <공통 질문>?", a: "<답과 출처>." },
    ],
  },
```

## 4. New category: `content/categories.ts` (only when no existing one fits)

```ts
  {
    slug: "<english>", // 예: beauty, pet, baby, health, food, sports, car
    name: "<짧은 이름>",
    icon: "<CategoryIconKey>", // content/types.ts 목록에서만 (beauty, pet, baby, health, food, sports, outdoor, car, book, plant, fashion ...)
    tone: "<Tone>", // 아직 안 쓴 색 먼저: lemon, rose, slate
    title: "<이름> 리뷰 모음: <무엇을> 정리",
    h1: "<이름> 리뷰",
    description:
      "<대표 제품군 2~3개>처럼 <어떤 제품>을 사기 전에 확인할 <기준>과 장단점을 정리한 리뷰를 모았어요.", // 70~110자
    primaryKeyword: "<이름> 리뷰",
    secondaryKeywords: ["<이름> 추천", "<이름> 구매 가이드", "<관련 표현>"],
    intro: ["<이 분류에서 만족도를 가르는 기준 한두 문장>. 사기 전에 확인할 점을 정리했어요."],
  },
```

## 5. Check script: `check-review.mjs`

Save once per session to your scratchpad (not the repo). Run from the project root, before and after `npm run build`:

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON <scratchpad>\check-review.mjs <slug>
```

`FIX` = must fix. `CHECK` = outside the target range or needs judgment. `build:` lines appear once `.next` has the page. It only reads files.

```js
// check-review.mjs: 리뷰 규칙 점검 + (빌드 뒤) 출력물 점검. 프로젝트 파일은 읽기만 한다.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const slug = process.argv[2];
const src = path.resolve("content/reviews", `${slug}.ts`);
const { review: r } = await import(pathToFileURL(src).href);

const len = (s = "") => [...s].length;
const inRange = (n, a, b) => n >= a && n <= b;
const count = (hay, needle) => hay.split(needle).length - 1;
const sentences = (s) => (s.trim().match(/[.!?](?=\s|$)/g) ?? []).length;
const hits = (text, words) => words.filter((w) => text.includes(w));
const parts = (b) =>
  b.type === "p" ? { rich: [b.text], plain: [] }
  : b.type === "h3" ? { rich: [], plain: [b.text] }
  : b.type === "ul" || b.type === "ol" ? { rich: b.items, plain: [] }
  : b.type === "table" ? { rich: b.rows.flat(), plain: [b.caption, ...b.head] }
  : b.type === "callout" ? { rich: [b.text], plain: [b.title ?? ""] }
  : { rich: [], plain: [b.alt, b.caption ?? ""] };
const blocks = r.sections.flatMap((s) => s.body);
const bodyRich = blocks.flatMap((b) => parts(b).rich);
const bodyPlain = [...r.sections.map((s) => s.heading), ...blocks.flatMap((b) => parts(b).plain)];
const headline = [r.title, r.h1, r.description, r.hook ?? ""].join(" ");
const plainFields = [r.title, r.h1, r.description, r.hook ?? "", r.verdict, ...r.pros, ...r.cons, ...r.recommendedFor,
  ...r.notRecommendedFor, ...r.tags, ...r.faq.flatMap((f) => [f.q, f.a]), ...r.product.specs.flatMap((s) => [s.label, s.value]), ...bodyPlain];
const richFields = [...r.summary, ...bodyRich];
const visible = [...plainFields, ...r.summary, ...bodyRich].join(" ");
const chars = [...bodyPlain, ...bodyRich].join("").replace(/\s/g, "").length;
const pk = count(visible, r.primaryKeyword);
const experience = ["실사용", "써보니", "써 보니", "사용해보니", "사용해 보니", "직접 써", "체험 후기", "한 달 사용", "솔직 후기", "솔직후기", "내돈내산"];
const banned = ["최저가", "1위", "최고의", "역대", "끝판왕", "로켓", "무조건", "안녕하세요"];
const negative = ["단점", "비추천", "주의", "불편", "아쉬", "사기 전 필독"];
const exactPriceOrDate = /\d{1,3}(,\d{3})+원|\d{4,}원|\d{1,2}월 \d{1,2}일|20\d\d년 \d{1,2}월/;
const TAG_RE = /^[^\s#/?%"'&<>\\]{1,20}$/;

const rows = [
  ["FIX", len(r.title) <= 40, `title ${len(r.title)}자 (40자 이하)`],
  ["FIX", r.title.startsWith(r.primaryKeyword), "title 이 주 키워드로 시작"],
  ["FIX", inRange(len(r.description), 70, 110), `description ${len(r.description)}자 (70~110)`],
  ["FIX", count(r.description, r.primaryKeyword) === 1, `description 속 주 키워드 ${count(r.description, r.primaryKeyword)}회 (1회)`],
  ["FIX", len(r.hook) <= 18, `hook ${len(r.hook)}자 (18자 이하)`],
  ["FIX", r.summary.length === 3 && r.summary.every((l) => sentences(l) === 1), `summary ${r.summary.length}줄, 줄마다 한 문장`],
  ["FIX", inRange(sentences(r.verdict), 1, 2), `verdict ${sentences(r.verdict)}문장 (1~2)`],
  ["FIX", inRange(r.tags.length, 3, 8) && r.tags.every((t) => TAG_RE.test(t)), `tags ${r.tags.length}개 (3~8개, 띄어쓰기·특수문자 없이 20자 이내)`],
  ["FIX", inRange(r.secondaryKeywords.length, 8, 12), `secondaryKeywords ${r.secondaryKeywords.length}개 (8~12)`],
  ["FIX", r.rating === 5, `rating ${r.rating} (항상 5)`],
  ["FIX", r.pros.length === 4, `pros ${r.pros.length}개 (4)`],
  ["FIX", r.cons.length === 0 && r.notRecommendedFor.length === 0, `cons ${r.cons.length} / notRecommendedFor ${r.notRecommendedFor.length} (둘 다 0)`],
  ["FIX", r.recommendedFor.length === 3, `recommendedFor ${r.recommendedFor.length}개 (3)`],
  ["FIX", r.faq.length === 5, `faq ${r.faq.length}개 (5)`],
  ["FIX", r.sections.map((s) => s.id).join(",") === "buying-points,how-to-use", `sections: ${r.sections.map((s) => s.id).join(", ")} (buying-points, how-to-use)`],
  ["FIX", Boolean(r.product.priceRange) && !("priceKRW" in r.product), `priceRange "${r.product.priceRange ?? ""}" (정확한 가격 필드 없이)`],
  ["FIX", !exactPriceOrDate.test(visible), `정확한 가격·날짜 표기: ${visible.match(exactPriceOrDate)?.[0] ?? "없음"}`],
  ["FIX", hits(visible, negative).length === 0, `부정 표현: ${hits(visible, negative).join(", ") || "없음"}`],
  ["FIX", blocks.every((b) => b.type !== "table" || b.rows.every((row) => row.length === b.head.length)), "표 행마다 칸 수가 head 와 같음"],
  ["FIX", !/[–—]/.test(JSON.stringify(r)), "긴 대시(—, –) 없음"],
  ["FIX", !/https?:\/\/|<\/?[a-z][^>]*>|\[[^\]]+\]\(/i.test([...plainFields, ...richFields].join(" ")), "텍스트에 URL, HTML, 마크다운 링크 없음"],
  ["FIX", plainFields.every((t) => !t.includes("**")) && richFields.every((t) => count(t, "**") % 2 === 0),
    "**굵게** 는 p·목록·표 본문 칸·callout 본문·summary 에만, 짝 맞춤"],
  ["FIX", hits(headline, [...experience, ...banned]).length === 0, `title/h1/description/hook 금지 표현: ${hits(headline, [...experience, ...banned]).join(", ") || "없음"}`],
  ["FIX", hits(visible, banned).length === 0, `과장·상표·군더더기 표현: ${hits(visible, banned).join(", ") || "없음"}`],
  ["FIX", !/<[^<>]{1,40}>|YYYY/.test(JSON.stringify(r)), "템플릿 자리표시자(<...>, YYYY) 없음"],
  ["CHECK", inRange(chars + [...r.summary, ...r.pros, ...r.faq.flatMap((f) => [f.q, f.a])].join("").replace(/\s/g, "").length, 1500, 2200),
    "글 전체 1,500~2,200자 (공백 제외)"],
  ["CHECK", inRange(pk, 3, 6), `주 키워드 노출 ${pk}회 (목표 3~6)`],
  ["CHECK", hits(visible, experience).length === 0, `경험 표현 (운영자가 실제로 쓴 글에서만 허용): ${hits(visible, experience).join(", ") || "없음"}`],
];
for (const [level, ok, msg] of rows) console.log(`${ok ? "ok   " : level.padEnd(5)} ${msg}`);
console.log(`info  affiliateUrl: ${r.product.affiliateUrl.startsWith("https://link.coupang.com/") ? "파트너스 링크" : "일반 상품 URL (TODO 유지, 빌드 경고는 정상)"}`);

// 빌드 결과 점검 (npm run build 뒤)
const out = path.resolve(".next/server/app");
const htmlFile = path.join(out, "reviews", `${slug}.html`);
if (!fs.existsSync(htmlFile)) {
  console.log("\nbuild 결과에 이 글이 없어요. npm run build 뒤에 다시 실행하세요.");
  process.exit(0);
}
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "");
const html = read(htmlFile);
const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
const links = html.match(/<a\b[^>]*href="https:\/\/(?:link|www)\.coupang\.com[^"]*"[^>]*>/g) ?? [];
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const ldOk = ld.length > 0 && ld.every((j) => { try { JSON.parse(j); return true; } catch { return false; } });
const decode = (s) => { try { return decodeURIComponent(decodeURIComponent(s)); } catch { return s; } };
const tagDir = path.join(out, "tag");
const built = fs.existsSync(tagDir) ? new Set(fs.readdirSync(tagDir).filter((f) => f.endsWith(".html")).map((f) => decode(f.slice(0, -5)))) : null;
const missing = r.tags.filter((t) => !built?.has(t));
const stale = fs.statSync(htmlFile).mtimeMs < fs.statSync(src).mtimeMs;
const checks = [
  [!stale, stale ? "빌드 결과가 리뷰 파일보다 오래됐어요. 다시 빌드하세요" : "빌드 결과가 최신"],
  [h1s === 1, `<h1> ${h1s}개 (정확히 1개)`],
  [html.includes("쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."), "대가성 문구"],
  [links.length > 0 && links.every((a) => a.includes('rel="sponsored nofollow noopener"')), `쿠팡 링크 ${links.length}개 모두 rel="sponsored nofollow noopener"`],
  [ldOk, `JSON-LD ${ld.length}개 파싱`],
  [read(path.join(out, "sitemap.xml.body")).includes(`/reviews/${slug}</loc>`), "sitemap.xml 에 포함"],
  [read(path.join(out, "rss.xml.body")).includes(`/reviews/${slug}`), "rss.xml 에 포함"],
  [fs.existsSync(path.join(out, "category", `${r.category}.html`)), `카테고리 페이지 /category/${r.category}`],
  [built !== null && missing.length === 0, built === null ? "태그 페이지 폴더(.next/server/app/tag)가 없어요" : `태그 페이지 (없음: ${missing.join(", ") || "-"})`],
];
console.log("");
for (const [ok, msg] of checks) console.log(`${ok ? "ok   " : "FIX  "} build: ${msg}`);
```
