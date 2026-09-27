---
name: add-review
description: Adds a product review post to this Coupang Partners review blog end to end (product research, keyword research, category and tags, writing content/reviews/<slug>.ts, related links, build checks, Korean report to the owner). Use when the user pastes a Coupang product link (coupang.com/vp/products/..., m.coupang.com/vm/products/..., link.coupang.com/a/...) or says "리뷰 써줘", "리뷰 추가", "리뷰 추가해줘", "이 제품 리뷰", "글 써줘", "포스팅해줘", "새 글". Also use to put a Partners link or widget into an existing review ("파트너스 링크 넣어줘") or to add the owner's own photos and usage notes ("사진 추가", "직접 써 봤어").
argument-hint: "<쿠팡 상품 URL> [파트너스 링크] [파트너스 위젯 iframe] [직접 사용 여부·메모]"
---

# add-review

One run: research, keywords, taxonomy, writing, registration and links, verification, report. Output: `content/reviews/<slug>.ts` (plus index entry, related links, maybe a category or hub), a passing build, and a short Korean report.

- Before the first review in a session, read `content/reviews/homeplanet-humidifier-4l.ts` (the reference for length, tone and structure: short and purchase-focused), `content/types.ts`, `lib/validate.ts`, `content/categories.ts` and `content/tags.ts`.
- File skeletons, hub and category templates, and the check script: [template.md](template.md).
- Post text is Korean 해요체. Research notes live in your scratchpad, never in the repo.
- Edit only `content/` and `public/images/reviews/<slug>/`. Never `app/`, `components/`, `lib/`, `site.config.ts`, `next.config.ts`, `package.json` or CSS; if the build breaks there, report it instead of fixing it.
- Be fast: no questions beyond step 1, research in parallel, fix only what the checks flag.

## 1. Inputs

| Input | Handling |
|---|---|
| Coupang product URL (required) | `productId` from `/vp/products/<id>` or `/vm/products/<id>`; `itemId` and `vendorItemId` from the query. Missing ids: find them in step 2. |
| Partners link (optional) | `https://link.coupang.com/a/...` goes into `affiliateUrl` exactly as given. Never fetch, shorten or edit it. |
| Partners widget (optional) | `<iframe src="https://coupa.ng/..." ...>`: put only the `src` value into `product.iframeUrl`. It is the product visual on cards and at the top of the post. |
| Owner's use, notes, photos (optional) | Default: not used, research only. Only the owner's own words make it "used" (step 7). |

- No Partners link: `affiliateUrl` = `https://www.coupang.com/vp/products/<productId>?itemId=<itemId>&vendorItemId=<vendorItemId>` (drop every other parameter), under the two TODO comment lines from template.md, verbatim.
- Ask at most ONE short question, and only when there is no product URL. A message with only a Partners short link counts as missing: don't fetch it (automated hits on the owner's link can count as invalid clicks), ask for the product page URL.
- Several links: one review per product. Research may run in parallel; write files and build one at a time (index.ts is shared); send one combined report.
- Dates: today in KST for `publishedAt` and `updatedAt`.

## 2. Research the product

coupang.com and m.coupang.com answer 403 to WebFetch and PowerShell, so skip them. If Claude in Chrome is connected you may read the product page there (title, options, 필수 표기정보, price) without clicking any affiliate link. WebSearch and WebFetch may be deferred tools: load them with ToolSearch `select:WebSearch,WebFetch`.

Run 2 research subagents in parallel (A: identity, specs, price range; B: buyer-post themes, review count and selling points). Tell them to follow step 2 of this file, and do step 3 meanwhile. Each returns a facts table: field | value | confidence H/M/L | source URL | date.

1. **Identity:** WebSearch `쿠팡 <productId>`, `"<productId>"`, the product name and the model name to get the exact Coupang name, options, itemId and tracker pages.
2. **Price range:** `https://www.lowchart.com/<productId>-<itemId>` (current price, review count). Fallback: `https://fallcent.com/product/?product_id=<productId>&item_id=<itemId>`. Use it only to pick `priceRange` (27,270원 → `2만원대`). The exact price and the date never go into the post.
3. **Specs:** `https://search.danawa.com/dsearch.php?query=<model>`, then `https://prod.danawa.com/info/?pcode=<pcode>`; nosearch.com; maker site and manual PDF.
4. **Buyer posts:** 10-20 Naver blog posts, for the features buyers like most (these become pros and the title phrase). Skip AI-written posts. Tested PowerShell 5.1 snippets:
   ```powershell
   $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
   # post URLs for a query
   $r = Invoke-WebRequest "https://search.naver.com/search.naver?ssc=tab.blog.all&query=$([uri]::EscapeDataString('<제품명> 후기'))" -UserAgent $ua -UseBasicParsing
   [regex]::Matches([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()), 'https://blog\.naver\.com/[A-Za-z0-9_-]+/\d+') | ForEach-Object Value | Select-Object -Unique
   # plain text of one post (the post date is near the top)
   $r = Invoke-WebRequest "https://m.blog.naver.com/PostView.naver?blogId=<id>&logNo=<no>" -UserAgent $ua -UseBasicParsing
   $t = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) -replace '(?is)<(script|style)\b.*?</\1>', ' ' -replace '(?i)<br\s*/?>|</(p|div|li|tr)>', "`n" -replace '<[^>]+>', ' '
   [Net.WebUtility]::HtmlDecode($t) -replace '[ \t ​]+', ' ' -replace '(\s*\n\s*)+', "`n"
   ```

Rules:
- Every number and claim has a source. Unknown values stay out.
- Don't repeat claims from AI-written or affiliate pages (unsourced dB, "미세먼지 제거", awards).
- Health, beauty, baby, food and medical-adjacent products: no efficacy or treatment claims beyond official, sourced wording (식약처 등).
- The source list goes into the comment block at the top of the review file.

## 3. Keywords

Pick 6-12 seeds: brand + type, product name, model, feature + type, environment + type, value + type. Run from the project root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 "<브랜드> <제품군>" "<브랜드> <제품명>" "가성비 <제품군>" "<사용환경> <제품군>"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 -Expand -Top 3 "<브랜드> <제품명>"
```

For many seeds use `-SeedFile <scratchpad>\seeds.txt -OutFile <scratchpad>\kw.txt` (UTF-8, one seed per line). "Strong signals" (`[NG 2] 키워드`) are the best candidates.

- **Primary (1):** product-specific mid-tail of 2-4 어절 (`홈플래닛 초음파 가습기 4L`), present in Naver (use Naver's spacing).
- **Secondary (8-12):** take them from the "Strong signals" list first. Brand queries (`<브랜드> <제품군>`, `… 세척`, `… 사용법`, `… 무드등 끄기`), feature (필터 없는 가습기, 상부급수형 가습기), environment and value (원룸 가습기, 침실 가습기 위치, 가성비 가습기). Skip negative ones (고장, 빨간불, 물샘, 단점). Each lands in an h3, a FAQ question or a summary line.
- **Skip:** broad heads like `<제품군> 추천`; 내돈내산; years; anything not about this product (Partners policy).
- **Cannibalization:** Grep `content/` for the primary. If another review already targets it, narrow it.

| Placement | Rule |
|---|---|
| `title` | primary first, then a short recommendation phrase, 40 chars or fewer: `<primary> 강력추천, 후기 5만건 2만원대 가습기` |
| `h1` | the punchy phrase first, then the primary: `후기 5만건 2만원대 가습기 강력추천: <primary>` |
| `description` | 70-110 chars, primary exactly once: price range + 3 selling points + social proof. No cons. |
| `buying-points` h2 | primary + `구매 포인트 N가지` |
| h3 and FAQ questions | one secondary keyword each |
| whole page | primary 3-6 times |

## 4. Category, tags, hub

- **Category (one level):** read `content/categories.ts`. Now `appliances` 가전, `living` 생활, `digital` 디지털, `kitchen` 주방 (small kitchen appliances go to kitchen). Only if none fits, add one from template.md with every field, `icon` from `CategoryIconKey` and `tone` from `Tone` in `content/types.ts`. Empty categories stay hidden.
- **Tags (3-8):** product type, (sub-type), brand, feature, environment or value, in that order. Example: `["가습기", "초음파가습기", "홈플래닛", "상부급수", "원룸", "가성비"]`.
  - No spaces, no `# / ? % & ' " < > \`, 20 chars or fewer; write compounds without spaces (`무선청소기`).
  - Reuse existing spellings: Grep `tags:` in `content/reviews` and `name:` in `content/tags.ts`.
  - Shared vocabulary: 원룸, 자취, 침실, 거실, 사무실, 주방, 욕실, 캠핑, 차량, 아이방 / 가성비, 프리미엄, 저소음, 대용량, 소형, 선물용.
- **Hub:** optional. When the product-type tag is new and will recur, add a `TagInfo` to `content/tags.ts` (template.md). If time is short, list it as a follow-up instead.

## 5. Write

**Owner rules (set 2026-09-27, don't relax them):**
- The post exists to make people buy. Short, simple, skimmable. Every line is a reason to buy.
- `rating` is always `5`.
- `cons: []` and `notRecommendedFor: []`. No 단점, 비추천, 주의, 불편 anywhere in the post (title, summary, sections, FAQ). Care and usage tips are phrased positively (`정수물을 쓰면 더 깔끔하게 쓸 수 있어요`).
- Price: `product.priceRange` only (`2만원대`, `10만원대`). Never an exact price, never a date (`9월 27일 기준`).
- Titles are direct recommendations. The owner's own model: `후기 5만건 2만원대 가습기 강력추천`. Never hedged or roundabout (`~가 계속 팔리는 이유`, `사기 전 필독`, `장단점`, `단점`).

**Honesty floor (Partners policy and 공정위, not negotiable):**
- Every fact is sourced. No invented numbers, review counts or features.
- Never imply first-hand use, testing or measurements the owner didn't give.
- The disclosure sentence is rendered by the page template at the top; don't add or change it.

**Fields** (the check script enforces the numbers)
- `summary`: exactly 3 lines, one short sentence each (25-50자): what it is + price range + key features / the strongest selling point (필터값 0원, 후기 N건) / who it's perfect for.
- `hook`: 18자 or fewer, three strengths joined by ` · ` (`필터값 0원 · 상부급수 · 무드등`).
- `pros`: 4, one short sentence each (fact + benefit).
- `recommendedFor`: 3 short `~분` phrases.
- `product.specs`: 6-8 rows, short values.
- `sections`: exactly these two (don't add a `specs` section; the template renders 주요 사양 with the mid-article buy link):
  - `buying-points` "<primary> 구매 포인트 N가지": 5-6 numbered h3 (`1. <secondary 키워드>라 <장점>`), each followed by one 2-sentence `p` with a sourced fact.
  - `how-to-use` "<브랜드> <제품군> 사용법과 세척, 위치까지 한 번에" (adapt to the product): h3 사용법 + `ol` of 3 steps, h3 세척 + one-line `p` + `ul` of 매일/이틀마다/일주일마다, h3 위치 or 활용 + `ul` of 3-4 `**라벨:** 설명`. All phrased positively.
- `faq`: 5 questions phrased like searches and built on secondary keywords (필터, 사용 시간, 설정 방법, 세척 주기, 위치), answers in 1-2 sentences.
- `verdict`: 1-2 sentences ending in a recommendation (`~에게 강력추천해요`), no bold.
- Length: the whole post about 1,500-2,200 characters without spaces (shorter reads as thin content to Naver and Google; longer stops being skimmable).

**Style**
- 해요체. No filler (`안녕하세요`, `오늘은 ~ 소개해 드릴게요`).
- Banned:
  - Experience words `실사용 써보니 사용해 보니 직접 써 내돈내산 솔직 후기 체험 후기 한 달 사용` anywhere, unless the owner really used it (then body only).
  - `최저가 1위 최고의 역대 끝판왕 무조건` (`강력추천` is allowed).
  - `로켓` or `로켓배송` and Coupang logos.
  - `후기` in the title or h1 only as a buyer-review count (`후기 5만건`), never as our own 후기 unless the owner used it.
- No em or en dashes (—, –). Use commas, parentheses or hyphens, and `~` for ranges (2~12시간).
- `**bold**` only in `p`, list items, `summary` and callout text. No links, URLs, HTML or markdown.
- No images from Coupang, sellers or buyer posts. The product visual is the Partners widget (`iframeUrl`) or the owner's photos (step 7).

## 6. Files

1. Slug `<brand>-<product>-<keyspec>`: English lowercase kebab (`homeplanet-humidifier-4l`), unique, permanent (it is the URL).
2. Create `content/reviews/<slug>.ts` from template.md, with the sources comment block on top.
3. Register it in `content/reviews/index.ts` (import and array entry).
4. `related`: the new post gets up to 3 slugs, closest first (same product type, then same brand, then same use). Existing posts that share its product-type or brand tag get the new slug in their `related` (keep 3 or fewer). Don't touch their `updatedAt`.
5. Add the category or hub from step 4, if any.

## 7. When the owner used the product (now or later)

1. Photos go to `public/images/reviews/<slug>/NN.webp` (`01` is the square hero). sharp ships with Next; it applies EXIF rotation and drops metadata such as GPS:
   ```powershell
   New-Item -ItemType Directory -Force public/images/reviews/<slug> | Out-Null
   node -e "require('sharp')(process.argv[1]).rotate().resize({width:800,height:800,fit:'contain',background:'#ffffff'}).webp({quality:82}).toFile(process.argv[2]).then(i=>console.log(i.width,i.height))" "<원본 파일>" "public/images/reviews/<slug>/01.webp"
   node -e "require('sharp')(process.argv[1]).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:80}).toFile(process.argv[2]).then(i=>console.log(i.width,i.height))" "<원본 파일>" "public/images/reviews/<slug>/02.webp"
   ```
   The printed width and height go into the image fields. Note: when `iframeUrl` is set, the widget is shown instead of `product.image`.
2. `product.image` is `01.webp`, with an alt like `<제품명> 본체 정면`. Body photos become `img` blocks, with alt = what is visible and `caption: "직접 촬영"`.
3. Add a short `owner-notes` section with only the owner's facts. Update pros and FAQ where the experience confirms them.
4. Open the `owner-notes` section with the use period and how the product was obtained, as the owner said it. If a brand gave it free or discounted, say so in that first sentence (공정위 disclosure).
5. Set `updatedAt` to today and leave `publishedAt`.

## 8. Verify

1. `npx tsc --noEmit`
2. `npm run lint`: fix issues in files you touched; report the others.
3. Save the check script from template.md to `<scratchpad>\check-review.mjs` (once per session) and run it from the project root: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON <scratchpad>\check-review.mjs <slug>`. Fix every `FIX` and judge every `CHECK`.
4. `npm run build`. It is fine while `next dev` runs, since dev writes to `.next/dev`.
   - Structural errors stop the build (slug, category, tags, dates, rating, section ids, related).
   - Read every `[content]` warning and fix it. The one exception is `affiliateUrl 이 쿠팡 파트너스 링크(...)가 아닙니다` when no Partners link was given.
5. Run the check script again. Its `build:` lines inspect the built review page (one `<h1>`, the disclosure sentence, `rel="sponsored nofollow noopener"` on every Coupang link, parseable JSON-LD), `sitemap.xml.body`, `rss.xml.body`, the category page and every tag page. All must be `ok`.

## 9. Report to the owner (Korean)

```text
새 리뷰를 추가했어요.
- 주소: /reviews/<slug>
- 제목: <h1>
- 주 키워드: <primary> (보조: <3~4개>)
- 카테고리: <이름> · 태그: #<태그> #<태그> #<태그>
- 가격대: <priceRange>
- 확인해 주세요: <확인 못 한 항목>
- 할 일: 파트너스 링크와 위젯 코드를 보내 주시면 넣을게요.
- 배포 후: 네이버 서치어드바이저 요청 > 웹 페이지 수집에 주소를 한 번 요청하고, Google Search Console URL 검사에서 색인 생성을 요청해 주세요.
- 다음 글 추천:
  1. <주 키워드 후보> (<N·G 자동완성 근거>) · <이 글과 연결되는 방식>
- 바뀐 파일: <목록>
```

Suggest 2-3 follow-ups from the step 3 autocomplete data: a competitor or sibling-model review (mutual `related`), or a hub for a product type that has none.

## Other requests

- **Partners link or widget for an existing review:** Grep `coupangProductId: "<productId>"` in `content/reviews` (or the product name). Set `affiliateUrl` verbatim (delete the two TODO lines) and/or `product.iframeUrl` (the iframe `src` only), keep `updatedAt`, then run step 8.
- **Photos or usage notes later:** step 7, then step 8.
- **Price change:** update `priceRange` only when the 만원대 changed, and `updatedAt`.
