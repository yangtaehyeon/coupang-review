// 쿠팡 상품 주소 → 내 파트너스 링크(link.coupang.com/a/...). 실행: npm run deeplink -- "<쿠팡 상품 주소>" ["<주소2>" ...]
//   여러 주소를 한 번에 넘기면 API 를 한 번만 부른다 (20개씩). 만든 링크는 열지 않는다 (자동 접속은 부정 클릭으로 잡힐 수 있다).
//   m.coupang.com/vm/products 주소도 받는다. itemId·vendorItemId 외 파라미터는 버린다.
import { deeplinks } from "./lib/coupang-partners.mjs";

/** 쿠팡 상품 주소를 www.coupang.com/vp/products/<id>?itemId=..&vendorItemId=.. 로 정리. 상품 주소가 아니면 null */
function normalize(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  const id = url.pathname.match(/\/v[pm]\/products\/(\d+)/)?.[1];
  if (!/(^|\.)coupang\.com$/.test(url.hostname) || !id) return null;
  const q = new URLSearchParams();
  for (const name of ["itemId", "vendorItemId"]) {
    const value = url.searchParams.get(name);
    if (value) q.set(name, value);
  }
  const qs = q.toString();
  return `https://www.coupang.com/vp/products/${id}${qs ? `?${qs}` : ""}`;
}

const inputs = process.argv.slice(2).filter(Boolean);
if (!inputs.length) {
  console.log('사용법: npm run deeplink -- "https://www.coupang.com/vp/products/<번호>?itemId=..&vendorItemId=.."');
  process.exit(1);
}
const urls = inputs.map(normalize);
const bad = inputs.filter((_, i) => !urls[i]);
if (bad.length) {
  console.error(`쿠팡 상품 주소가 아닙니다: ${bad.join(", ")}`);
  process.exit(1);
}

try {
  for (let i = 0; i < urls.length; i += 20) {
    for (const link of await deeplinks(urls.slice(i, i + 20))) {
      console.log(`${link.originalUrl}\n  → ${link.shortenUrl}`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
