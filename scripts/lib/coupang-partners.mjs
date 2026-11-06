// 쿠팡 파트너스 Open API (HMAC 서명). 키: ~/Desktop/쿠팡파트너스API/쿠팡파트너스_API키.txt
// 응답의 productUrl 은 내 파트너스 추적 링크라서 스크립트가 절대 열지 않는다 (자동 접속은 부정 클릭으로 잡힐 수 있다).
//
// 호출 한도: 1시간에 30회를 넘기면 24시간 정지, 정지 3번이면 계정 정지라고 알려져 있다 (비공식).
// 그래서 모든 호출을 키 폴더의 api-calls.json 에 기록하고, 최근 1시간 HOURLY_BUDGET 회를 넘기려 하면 부르기 전에 멈춘다.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { desktopFile, loadKeys } from "./key-file.mjs";

const HOST = "https://api-gateway.coupang.com";
const BASE = "/v2/providers/affiliate_open_api/apis/openapi/v1";
export const COUPANG_KEY_FILE = process.env.COUPANG_KEY_FILE || desktopFile("쿠팡파트너스API", "쿠팡파트너스_API키.txt");
const CALL_LOG = path.join(path.dirname(COUPANG_KEY_FILE), "api-calls.json");
const HOUR = 60 * 60 * 1000;
/** 최근 1시간 호출 상한 (알려진 한도 30회보다 여유 있게) */
export const HOURLY_BUDGET = 20;

function recentCalls() {
  try {
    const calls = JSON.parse(fs.readFileSync(CALL_LOG, "utf8"));
    return Array.isArray(calls) ? calls.filter((t) => Date.now() - t < HOUR) : [];
  } catch {
    return [];
  }
}

/** 지금 더 부를 수 있는 횟수 */
export function remainingCalls() {
  return HOURLY_BUDGET - recentCalls().length;
}

/** n 회를 부를 여유가 없으면 몇 분 뒤에 되는지 알려 주며 멈춘다 */
export function assertBudget(n = 1) {
  const calls = recentCalls().sort((a, b) => a - b);
  const left = HOURLY_BUDGET - calls.length;
  if (left >= n) return;
  // 오래된 호출이 몇 개 빠져야 n 회 여유가 생기는지 → 그중 마지막 호출이 1시간 지나는 시각
  const mustExpire = calls.length - Math.max(0, HOURLY_BUDGET - n);
  const freeAt = (calls[Math.min(calls.length, mustExpire) - 1] ?? Date.now()) + HOUR;
  const minutes = Math.max(1, Math.ceil((freeAt - Date.now()) / 60000));
  throw new Error(
    `쿠팡 API 한도 보호: 최근 1시간에 ${calls.length}회 불러서 ${n}회를 더 부를 수 없습니다. 약 ${minutes}분 뒤에 다시 실행하세요. (1시간 30회를 넘기면 24시간 정지)`,
  );
}

function recordCall() {
  const calls = recentCalls();
  calls.push(Date.now());
  fs.writeFileSync(CALL_LOG, JSON.stringify(calls));
}

/** 쿠팡 베스트 카테고리 ID (bestcategories/{id}) */
export const COUPANG_CATEGORY = {
  뷰티: 1010,
  출산유아동: 1011,
  식품: 1012,
  주방용품: 1013,
  생활용품: 1014,
  홈인테리어: 1015,
  가전디지털: 1016,
  스포츠레저: 1017,
  헬스건강식품: 1024,
  반려동물용품: 1029,
};

let keys;
function getKeys() {
  keys ??= loadKeys(["COUPANG_ACCESS_KEY", "COUPANG_SECRET_KEY"], COUPANG_KEY_FILE);
  return keys;
}

/** yyMMdd'T'HHmmss'Z' (UTC) */
function signedDate(date = new Date()) {
  const s = date.toISOString();
  return `${s.slice(2, 4)}${s.slice(5, 7)}${s.slice(8, 10)}T${s.slice(11, 13)}${s.slice(14, 16)}${s.slice(17, 19)}Z`;
}

function authorization(method, path, query) {
  const { COUPANG_ACCESS_KEY: accessKey, COUPANG_SECRET_KEY: secretKey } = getKeys();
  const datetime = signedDate();
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(datetime + method + path + query)
    .digest("hex");
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

/** 서명한 요청을 보내고 data 를 돌려준다. rCode 가 "0" 이 아니면 에러 */
export async function coupangRequest(method, endpoint, { query = {}, body } = {}) {
  assertBudget(1);
  recordCall();
  const urlPath = BASE + endpoint;
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(HOST + urlPath + (qs ? `?${qs}` : ""), {
    method,
    headers: {
      Authorization: authorization(method, urlPath, qs),
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  if (!res.ok || !json || String(json.rCode) !== "0") {
    const reason = json?.rMessage || json?.message || text.slice(0, 200);
    throw new Error(`쿠팡 API ${method} ${endpoint} 실패 (HTTP ${res.status}${json?.rCode ? `, rCode ${json.rCode}` : ""}): ${reason}`);
  }
  return json.data;
}

/** 카테고리 베스트 상품 (순위순) */
export function bestProducts(categoryId, limit = 50) {
  return coupangRequest("GET", `/products/bestcategories/${categoryId}`, { query: { limit } });
}

/** 골드박스 (오늘의 특가) */
export function goldboxProducts() {
  return coupangRequest("GET", "/products/goldbox");
}

/** 키워드 검색 상위 상품 (최대 10개, 쿠팡 랭킹순) */
export async function searchProducts(keyword, limit = 10) {
  const data = await coupangRequest("GET", "/products/search", { query: { keyword, limit } });
  return data?.productData ?? [];
}

/** 쿠팡 상품 주소들 → 파트너스 단축 링크 (link.coupang.com/a/...) */
export function deeplinks(coupangUrls) {
  return coupangRequest("POST", "/deeplink", { body: { coupangUrls } });
}

/**
 * 추적 링크(productUrl)를 열지 않고 문자열에서 상품 번호만 꺼내 일반 상품 주소를 만든다.
 * add-review 스킬에 넘기는 주소 형식: https://www.coupang.com/vp/products/<id>?itemId=..&vendorItemId=..
 */
export function plainProductUrl(product) {
  let params;
  try {
    params = new URL(product.productUrl).searchParams;
  } catch {
    params = new URLSearchParams();
  }
  const id = String(product.productId ?? params.get("pageKey") ?? "");
  const itemId = params.get("itemId");
  const vendorItemId = params.get("vendorItemId");
  const q = new URLSearchParams();
  if (itemId) q.set("itemId", itemId);
  if (vendorItemId) q.set("vendorItemId", vendorItemId);
  const qs = q.toString();
  return `https://www.coupang.com/vp/products/${id}${qs ? `?${qs}` : ""}`;
}
