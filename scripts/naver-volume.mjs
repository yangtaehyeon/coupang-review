// 네이버 월간 검색량 조회. 실행: npm run volume -- "가습기 추천" "가성비 가습기" [--related 15]
//   입력한 키워드의 PC·모바일 월간 검색량과 경쟁 정도, 그리고 연관 키워드 상위 N개(기본 10)를 보여 준다.
import { monthlyVolumes } from "./lib/naver-searchad.mjs";

const args = process.argv.slice(2);
let relatedTop = 10;
const keywords = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--related") {
    const n = Number(args[++i]);
    relatedTop = Number.isFinite(n) ? n : 10;
  } else keywords.push(args[i]);
}

if (!keywords.length) {
  console.log('사용법: npm run volume -- "키워드1" "키워드2" ... [--related 15]');
  process.exit(1);
}

const fmt = (n) => n.toLocaleString("ko-KR");
const { volumes, related } = await monthlyVolumes(keywords);

console.log("키워드\t월간 검색량(합계)\tPC\t모바일\t경쟁");
for (const kw of keywords) {
  const v = volumes.get(kw.trim());
  console.log(v ? `${kw}\t${fmt(v.total)}\t${fmt(v.pc)}\t${fmt(v.mobile)}\t${v.comp}` : `${kw}\t데이터 없음 (검색이 아주 적거나 광고 금지어)`);
}
if (relatedTop > 0) {
  console.log(`\n연관 키워드 상위 ${relatedTop}개`);
  for (const [kw, total] of related.slice(0, relatedTop)) console.log(`${kw}\t${fmt(total)}`);
}
