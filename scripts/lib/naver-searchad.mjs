// 네이버 검색광고 API 키워드 도구 (월간 검색량). 키: ~/Desktop/네이버광고API/네이버광고_API키.txt
import crypto from "node:crypto";
import { desktopFile, loadKeys } from "./key-file.mjs";

const HOST = "https://api.searchad.naver.com";
export const NAVER_AD_KEY_FILE = process.env.NAVER_AD_KEY_FILE || desktopFile("네이버광고API", "네이버광고_API키.txt");

let keys;
function getKeys() {
  keys ??= loadKeys(["NAVER_AD_API_KEY", "NAVER_AD_SECRET_KEY", "NAVER_AD_CUSTOMER_ID"], NAVER_AD_KEY_FILE);
  return keys;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 키워드 도구는 공백 없이 비교한다 (대소문자 무시) */
export const compact = (keyword) => keyword.replace(/\s+/g, "").toUpperCase();

/** "< 10" 같은 값은 5 로 본다 */
const count = (v) => (typeof v === "number" ? v : String(v).includes("<") ? 5 : Number(v) || 0);

async function keywordTool(hints) {
  const { NAVER_AD_API_KEY, NAVER_AD_SECRET_KEY, NAVER_AD_CUSTOMER_ID } = getKeys();
  const uri = "/keywordstool";
  const timestamp = String(Date.now());
  const signature = crypto
    .createHmac("sha256", NAVER_AD_SECRET_KEY)
    .update(`${timestamp}.GET.${uri}`)
    .digest("base64");
  const qs = new URLSearchParams({ hintKeywords: hints.map((h) => h.replace(/\s+/g, "")).join(","), showDetail: "1" });
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${HOST}${uri}?${qs}`, {
      headers: {
        "X-Timestamp": timestamp,
        "X-API-KEY": NAVER_AD_API_KEY,
        "X-Customer": NAVER_AD_CUSTOMER_ID,
        "X-Signature": signature,
      },
    });
    // 호출이 몰리면 429 를 준다. 잠깐 쉬고 다시
    if (res.status === 429 && attempt < 3) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`네이버 키워드 도구 실패 (HTTP ${res.status}): ${text.slice(0, 200)}`);
    return JSON.parse(text).keywordList ?? [];
  }
}

/**
 * 키워드별 월간 검색량 (PC + 모바일). 한 번에 5개씩 묻는다.
 * 돌려주는 값: Map<입력 키워드, { pc, mobile, total, comp } | null>  (null = 검색량 데이터 없음)
 * 함께 오는 연관 키워드는 related 에 검색량 순으로 담는다.
 */
export async function monthlyVolumes(keywords) {
  const result = new Map();
  const related = new Map();
  const unique = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    const list = await keywordTool(batch);
    const byKey = new Map(list.map((row) => [compact(row.relKeyword), row]));
    for (const kw of batch) {
      const row = byKey.get(compact(kw));
      result.set(
        kw,
        row
          ? {
              pc: count(row.monthlyPcQcCnt),
              mobile: count(row.monthlyMobileQcCnt),
              total: count(row.monthlyPcQcCnt) + count(row.monthlyMobileQcCnt),
              comp: row.compIdx ?? "",
            }
          : null,
      );
    }
    for (const row of list) {
      const total = count(row.monthlyPcQcCnt) + count(row.monthlyMobileQcCnt);
      related.set(row.relKeyword, Math.max(related.get(row.relKeyword) ?? 0, total));
    }
    if (i + 5 < unique.length) await sleep(400);
  }
  return { volumes: result, related: [...related].sort((a, b) => b[1] - a[1]) };
}
