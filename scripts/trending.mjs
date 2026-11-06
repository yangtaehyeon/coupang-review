// 쿠팡 인기 상품 수집. 실행: npm run trending   (옵션: -- --top 20 --per 5)
//   쿠팡 파트너스 API 로 우리 카테고리의 베스트 상품(카테고리당 최대 100위)과 골드박스를 받아
//   reports/trending/<날짜>.json(전체 기록)과 .md(읽는 보고서)로 저장하고, 리뷰 후보를 화면에 보여 준다.
//   - 이미 리뷰한 상품(content/reviews 의 coupangProductId)은 후보에서 빼고 보고서에 ✅ 로 표시한다.
//   - 전날 이전 기록이 있으면 순위 변화(▲▼, 신규)를 붙인다. 매일 돌리면 급상승 상품이 보인다.
//   - 상품 이미지와 추적 링크(productUrl)는 저장하지 않는다. 상품 주소는 일반 쿠팡 주소로 바꿔 둔다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertBudget,
  bestProducts,
  goldboxProducts,
  HOURLY_BUDGET,
  plainProductUrl,
  remainingCalls,
  searchProducts,
} from "./lib/coupang-partners.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = path.join(ROOT, "reports", "trending");
const REVIEWS_DIR = path.join(ROOT, "content", "reviews");

/** 건강 카테고리 검색어. 쿠팡 '헬스/건강식품' 베스트(1024)는 계란·채소 같은 신선식품만 내려와서 영양제는 검색 상위로 본다 */
const HEALTH_KEYWORDS = ["종합비타민", "루테인", "밀크씨슬"];

/** 수집 목록 → 우리 사이트 카테고리. 한 번 실행에 (목록 수 + 골드박스 1)회 호출한다 */
const SOURCES = [
  { key: "1016", label: "가전·디지털", site: "가전·디지털", categoryId: 1016 },
  { key: "1014", label: "생활용품", site: "생활", categoryId: 1014 },
  { key: "1015", label: "홈인테리어", site: "생활", categoryId: 1015 },
  { key: "1013", label: "주방용품", site: "주방", categoryId: 1013 },
  { key: "1010", label: "뷰티", site: "뷰티", categoryId: 1010 },
  { key: "1012", label: "식품", site: "식품", categoryId: 1012 },
  ...HEALTH_KEYWORDS.map((keyword) => ({ key: `search:${keyword}`, label: `건강: ${keyword}`, site: "건강", keyword })),
];

const argValue = (name, fallback) => {
  const i = process.argv.indexOf(name);
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const TOP = argValue("--top", 20); // 보고서의 카테고리별 표 길이
const PER = argValue("--per", 5); // 카테고리별 리뷰 후보 수

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kstNow = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString();
const won = (n) => `${Number(n).toLocaleString("ko-KR")}원`;
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

/** 이미 리뷰한 상품: coupangProductId → 리뷰 slug */
function loadReviewed() {
  const reviewed = new Map();
  for (const file of fs.readdirSync(REVIEWS_DIR)) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const m = fs.readFileSync(path.join(REVIEWS_DIR, file), "utf8").match(/coupangProductId:\s*"(\d+)"/);
    if (m) reviewed.set(m[1], file.replace(/\.ts$/, ""));
  }
  return reviewed;
}

/** 오늘보다 앞선 가장 최근 기록 */
function loadPrevious(today) {
  if (!fs.existsSync(OUT_DIR)) return null;
  const files = fs
    .readdirSync(OUT_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) < today)
    .sort();
  const last = files.at(-1);
  return last ? JSON.parse(fs.readFileSync(path.join(OUT_DIR, last), "utf8")) : null;
}

const toItem = (p) => ({
  rank: p.rank,
  productId: String(p.productId),
  name: p.productName,
  price: p.productPrice,
  rocket: Boolean(p.isRocket),
  freeShipping: Boolean(p.isFreeShipping),
  coupangCategory: p.categoryName ?? "",
  url: plainProductUrl(p),
});

const now = kstNow();
const today = now.slice(0, 10);
const reviewed = loadReviewed();
const previous = loadPrevious(today);

// 1. 수집 (카테고리 하나가 실패해도 나머지로 보고서를 만든다). 시간당 한도가 모자라면 아예 시작하지 않는다
const CALLS = SOURCES.length + 1;
try {
  assertBudget(CALLS);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const lists = [];
for (const source of SOURCES) {
  try {
    const data = source.keyword ? await searchProducts(source.keyword, 10) : await bestProducts(source.categoryId, 100);
    lists.push({ ...source, items: data.map(toItem) });
  } catch (error) {
    lists.push({ ...source, items: [], error: error.message });
  }
  await sleep(300);
}
try {
  const data = await goldboxProducts();
  lists.push({ key: "goldbox", label: "골드박스", site: "", categoryId: null, items: data.map(toItem) });
} catch (error) {
  lists.push({ key: "goldbox", label: "골드박스", site: "", categoryId: null, items: [], error: error.message });
}
if (lists.every((l) => l.error)) {
  console.error(`수집 실패: ${lists[0].error}`);
  process.exit(1);
}

// 2. 순위 변화
const prevRank = new Map();
for (const list of previous?.lists ?? []) {
  for (const item of list.items) prevRank.set(`${list.key}:${item.productId}`, item.rank);
}
for (const list of lists) {
  for (const item of list.items) {
    if (!previous || list.key === "goldbox") {
      item.change = "";
      continue;
    }
    const before = prevRank.get(`${list.key}:${item.productId}`);
    item.diff = before ? before - item.rank : null;
    item.change = before == null ? "신규" : item.diff > 0 ? `▲${item.diff}` : item.diff < 0 ? `▼${-item.diff}` : "-";
  }
}

// 3. 리뷰 후보: 카테고리별로 아직 안 쓴 상품 상위 PER개 (여러 목록에 겹치면 처음 것만)
const seen = new Set();
const candidates = [];
for (const list of lists) {
  if (list.key === "goldbox") continue;
  let picked = 0;
  for (const item of list.items) {
    if (picked >= PER) break;
    if (reviewed.has(item.productId) || seen.has(item.productId)) continue;
    seen.add(item.productId);
    candidates.push({ ...item, list: list.label, site: list.site });
    picked++;
  }
}

// 4. 급상승: 새로 30위 안에 들었거나 10계단 이상 오른 상품
const rising = previous
  ? lists
      .filter((l) => l.key !== "goldbox")
      .flatMap((l) => l.items.map((item) => ({ ...item, list: l.label })))
      .filter((i) => !reviewed.has(i.productId))
      .filter((i) => (i.change === "신규" && i.rank <= 30) || (i.diff >= 10 && i.rank <= 50))
      .sort((a, b) => (b.diff ?? 100) - (a.diff ?? 100) || a.rank - b.rank)
      .slice(0, 20)
  : [];

// 5. 저장
fs.mkdirSync(OUT_DIR, { recursive: true });
const snapshot = {
  date: today,
  createdAt: `${now.slice(0, 19)}+09:00`,
  compareTo: previous?.date ?? null,
  lists: lists.map(({ key, label, site, categoryId, keyword, items, error }) => ({
    key,
    label,
    site,
    categoryId,
    keyword,
    error,
    items,
  })),
};
fs.writeFileSync(path.join(OUT_DIR, `${today}.json`), `${JSON.stringify(snapshot, null, 1)}\n`);

const status = (item) => {
  const slug = reviewed.get(item.productId);
  return slug ? `✅ 리뷰함 (${slug})` : "";
};
const md = [];
md.push(`# 쿠팡 인기 상품 ${today}`, "");
md.push(`- 만든 시각: ${now.slice(0, 16).replace("T", " ")} (KST)`);
md.push(`- 출처: 쿠팡 파트너스 API 카테고리 베스트(최대 100위) · 건강 키워드 검색(${HEALTH_KEYWORDS.join(", ")}) · 골드박스`);
md.push(`- 순위 비교: ${previous ? `${previous.date} 기록 대비` : "첫 수집이라 비교 없음 (다음 수집부터 ▲▼·신규 표시)"}`);
md.push(`- 이미 리뷰한 상품 ${reviewed.size}개는 후보에서 빼고 ✅ 로 표시`);
for (const list of lists.filter((l) => l.error)) md.push(`- ⚠️ ${list.label} 수집 실패: ${list.error}`);
md.push("", `## 리뷰 후보 (카테고리별 아직 안 쓴 상품 상위 ${PER}개)`, "");
md.push("| 사이트 분류 | 쿠팡 베스트 | 순위 | 변화 | 상품명 | 가격 | 로켓 | 쿠팡 분류 | 상품 주소 |", "|---|---|---|---|---|---|---|---|---|");
for (const c of candidates) {
  md.push(`| ${c.site} | ${c.list} | ${c.rank} | ${c.change} | ${cell(c.name)} | ${won(c.price)} | ${c.rocket ? "로켓" : ""} | ${cell(c.coupangCategory)} | ${c.url} |`);
}
if (previous) {
  md.push("", "## 순위 급상승 (새로 30위 안 또는 10계단 이상 상승, 안 쓴 상품)", "");
  if (rising.length) {
    md.push("| 쿠팡 베스트 | 순위 | 변화 | 상품명 | 가격 | 상품 주소 |", "|---|---|---|---|---|---|");
    for (const r of rising) md.push(`| ${r.list} | ${r.rank} | ${r.change} | ${cell(r.name)} | ${won(r.price)} | ${r.url} |`);
  } else md.push("없음");
}
for (const list of lists) {
  const title =
    list.key === "goldbox"
      ? "골드박스 (오늘의 특가)"
      : list.keyword
        ? `${list.label} (쿠팡 검색 상위 10개)`
        : `${list.label} (쿠팡 베스트 ${list.categoryId}, 상위 ${TOP}위)`;
  md.push("", `## ${title}`, "");
  if (list.error) {
    md.push(`수집 실패: ${list.error}`);
    continue;
  }
  md.push("| 순위 | 변화 | 상품명 | 가격 | 로켓 | 상태 |", "|---|---|---|---|---|---|");
  const rows = list.key === "goldbox" ? list.items : list.items.slice(0, TOP);
  for (const item of rows) {
    md.push(`| ${item.rank} | ${item.change} | ${cell(item.name)} | ${won(item.price)} | ${item.rocket ? "로켓" : ""} | ${status(item)} |`);
  }
}
const mdPath = path.join(OUT_DIR, `${today}.md`);
fs.writeFileSync(mdPath, `${md.join("\n")}\n`);

// 6. 화면 요약
const total = lists.reduce((n, l) => n + l.items.length, 0);
console.log(`쿠팡 인기 상품 ${today}: ${lists.length}개 목록, 상품 ${total}개 수집`);
console.log(`보고서: ${path.relative(ROOT, mdPath)}  (비교: ${previous ? previous.date : "첫 수집"})`);
console.log(`쿠팡 API 호출 ${CALLS}회 · 최근 1시간 ${HOURLY_BUDGET - remainingCalls()}/${HOURLY_BUDGET}회`);
for (const list of lists.filter((l) => l.error)) console.log(`⚠️ ${list.label} 실패: ${list.error}`);
console.log(`\n리뷰 후보 (카테고리별 상위 ${PER}개, 이미 쓴 상품 제외)`);
let group = "";
for (const c of candidates) {
  if (c.list !== group) console.log(`[${(group = c.list)}]`);
  console.log(`  ${c.rank}위 ${c.change ? `(${c.change}) ` : ""}${c.name} · ${won(c.price)}${c.rocket ? " · 로켓" : ""}`);
}
if (rising.length) {
  console.log("\n순위 급상승");
  for (const r of rising.slice(0, 10)) console.log(`  [${r.list}] ${r.rank}위 (${r.change}) ${r.name}`);
}
