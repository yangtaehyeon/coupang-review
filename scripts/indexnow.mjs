// 새 글 주소를 IndexNow 로 네이버·빙에 알린다. 배포가 끝나 주소가 열린 뒤에 실행한다.
//
//   npm run indexnow -- --today                 publishedAt 또는 updatedAt 이 오늘(KST)인 리뷰
//   npm run indexnow -- <slug 또는 URL> [...]    지정한 리뷰 또는 주소
//
// 키 파일: public/<KEY>.txt (내용이 KEY). 사이트 주소에서 열려야 검색엔진이 받아 준다.
import fs from "node:fs";

const SITE = "https://itemangel.com";
const KEY = "779947f608a56b19cbb962229d3bc883";
const ENDPOINTS = ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"];

const args = process.argv.slice(2);
let urls = [];
if (args.includes("--today")) {
  const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  for (const f of fs.readdirSync("content/reviews")) {
    if (!f.endsWith(".ts") || f === "index.ts") continue;
    const text = fs.readFileSync(`content/reviews/${f}`, "utf8");
    if (text.includes(`publishedAt: "${today}"`) || text.includes(`updatedAt: "${today}"`)) {
      urls.push(`${SITE}/reviews/${f.slice(0, -3)}`);
    }
  }
} else {
  urls = args.map((a) => (a.startsWith("http") ? a : `${SITE}/reviews/${a}`));
}
if (urls.length === 0) {
  console.log('보낼 주소가 없어요. 사용법: npm run indexnow -- --today | <slug...>');
  process.exit(1);
}

// 키 파일과 각 주소가 실제로 열리는지 먼저 확인 (배포 전이면 멈춘다)
const keyRes = await fetch(`${SITE}/${KEY}.txt`);
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
  console.error(`키 파일(${SITE}/${KEY}.txt)이 아직 안 열려요. 배포가 끝난 뒤 다시 실행해 주세요.`);
  process.exit(1);
}
for (const u of urls) {
  const r = await fetch(u, { method: "HEAD" });
  if (!r.ok) {
    console.error(`아직 안 열리는 주소: ${u} (${r.status}). 배포가 끝난 뒤 다시 실행해 주세요.`);
    process.exit(1);
  }
}

const body = JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls });
for (const ep of ENDPOINTS) {
  const r = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
  console.log(`${ep} -> ${r.status} ${r.status === 200 || r.status === 202 ? "접수" : (await r.text()).slice(0, 200)}`);
}
console.log(`보낸 주소 ${urls.length}개:\n${urls.join("\n")}`);
