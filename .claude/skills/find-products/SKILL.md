---
name: find-products
description: Finds popular Coupang products worth reviewing next on this blog, SEO first. Collects Coupang Partners best-seller lists (npm run trending) and skips products already reviewed. Maps candidates to buyer keywords, checks Naver monthly search volume (npm run volume), and reports a ranked Korean shortlist. Use when the owner says "인기 상품 조사", "인기 상품 찾아줘", "뭐 리뷰할까", "리뷰할 상품 추천", "요즘 잘 나가는 거", "다음 글 뭐 쓸까" or "트렌드 조사". When the owner picks products, hand them to the add-review skill.
---

# find-products

One run has four steps: collect, shortlist, check keyword volumes, and report in Korean. Reviews get written only after the owner picks products, via add-review.

## Rules

- **Coupang Partners API limit:** at most 20 calls in any rolling hour, enforced by `scripts/lib/coupang-partners.mjs`. The known limit is 30 calls an hour. Going over means a 24-hour suspension, and three suspensions close the account.
  - `npm run trending` uses 10 calls. Run it at most once per request and never loop or retry it.
  - If the script reports the limit, or today's `reports/trending/<date>.json` already exists, read the latest report instead.
- **Keys:** they live in `~/Desktop/쿠팡파트너스API/쿠팡파트너스_API키.txt` and `~/Desktop/네이버광고API/네이버광고_API키.txt`. Never print, cat or ask for key values. If a key is missing, tell the owner the file path.
- **Links:** never open `productUrl` tracking links or any `link.coupang.com` link, because automated hits count as invalid clicks. Reports keep only plain `www.coupang.com/vp/products/...` URLs.
- **Images:** no product images from the API on the site. The site rule allows Partners iframe widgets only.

## 1. Collect

Run `npm run trending` from the project root.

It writes `reports/trending/<date>.md` and `<date>.json` (both gitignored). The JSON holds every list:
- category best sellers, ranked up to 100
- health keyword searches, top 10 each (Coupang's 헬스/건강식품 best list is fresh food only)
- goldbox

Each item has `change` (▲, ▼ or 신규) once an earlier day's file exists. Products already reviewed (matched by `coupangProductId`) are marked and left out of the candidates.

## 2. Shortlist (SEO)

From the JSON, look at the not-yet-reviewed products in roughly the top 15 of each list.

**Keep** products that make a good review:
- They fit one of the 7 site categories (가전, 생활, 디지털, 주방, 뷰티, 건강, 식품).
- They are a clear product type that people search with buyer intent (`<제품군> 추천`).

**Skip:**
- fresh groceries (계란, 채소, 과일, 우유)
- commodity buys with no real choice (종이컵, 위생백), unless the volume says otherwise
- tickets and vouchers, fashion, books, baby formula and medicine, alcohol
- near-duplicates of the same product line
- any product type an existing review already owns. Grep the `title:` lines in `content/reviews` for the type. 키친타올, 충전기, 호텔수건, 전기장판, 가습기 and 블루투스 이어폰 are taken, for example.

**Prefer:**
- high or rising rank (▲, 신규)
- demand in the current season (winter: 보풀제거기, 핫팩, 문풍지, 바디로션)
- evergreen types with steady volume

For each kept product, write 1-3 buyer keywords: `<제품군> 추천`, the bare type, `가성비 <제품군>`, or a common variant such as `붙이는 핫팩`. Check them all in one run:

```powershell
npm run volume -- "<kw1>" "<kw2>" "<kw3>" --related 0
```

The "경쟁" column measures Naver ad competition, not organic ranking difficulty.

Rank candidates in this order:
1. Monthly volume of the best keyword (traffic).
2. Coupang rank and trend (sales).
3. Fit with the current season.
4. Price. A higher price earns more per sale, but cheap items still earn commission on the whole cart.

## 3. Report to the owner (Korean)

Start with the outcome, then give a table of the top 5-8:

| # | 상품 | 쿠팡 순위 | 주 키워드 · 월 검색량 | 이유 |
|---|---|---|---|---|

Then add one line saying which ones you would write first and why, and ask which to write ("1, 3, 5번 써줘").

## 4. When the owner picks

1. Get the Partners links with one call: `npm run deeplink -- "<plain URL 1>" "<plain URL 2>" ...`
2. Follow the add-review skill for each product. Use the plain URL as the product URL and the printed `link.coupang.com/a/...` link as the Partners link.
3. The API can't make the Partners iframe widget. Tell the owner they can send it later ("파트너스 위젯 넣어줘").

## Daily schedule (only with the owner's OK)

Running `npm run trending` once a day keeps rank history, so ▲ and 신규 show up in later reports. Register a Windows Task Scheduler job only if the owner says yes.
