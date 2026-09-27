// 날짜와 가격 표기. 콘텐츠 날짜는 모두 KST 기준 "YYYY-MM-DD" 문자열이다.

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** 게시 시각은 따로 관리하지 않으므로 모든 날짜를 KST 오전 9시로 본다 */
const PUBLISH_HOUR_KST = "09:00:00";

function parts(date: string): { y: number; m: number; d: number } {
  const match = DATE_RE.exec(date);
  if (!match) throw new Error(`날짜 형식은 YYYY-MM-DD 여야 합니다: "${date}"`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function isValidDate(date: string): boolean {
  const match = DATE_RE.exec(date);
  if (!match) return false;
  const { y, m, d } = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** 화면 표기: 2026.09.27 */
export function formatDate(date: string): string {
  const { y, m, d } = parts(date);
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}`;
}

/** 스크린 리더와 긴 문장용: 2026년 9월 27일 */
export function formatDateLong(date: string): string {
  const { y, m, d } = parts(date);
  return `${y}년 ${m}월 ${d}일`;
}

/** JSON-LD, article:published_time, sitemap lastmod 용 ISO 8601 (시간대 포함) */
export function toIsoKst(date: string): string {
  parts(date);
  return `${date}T${PUBLISH_HOUR_KST}+09:00`;
}

/** RSS pubDate 용 RFC 822: Sun, 27 Sep 2026 09:00:00 +0900 */
export function toRfc822(date: string): string {
  const { y, m, d } = parts(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y} ${PUBLISH_HOUR_KST} +0900`;
}

/** 가장 최근 날짜 (YYYY-MM-DD 는 문자열 비교로 정렬된다) */
export function latestDate(dates: readonly string[]): string | undefined {
  return dates.reduce<string | undefined>((max, d) => (max === undefined || d > max ? d : max), undefined);
}

const krw = new Intl.NumberFormat("ko-KR");

/** 39900 -> "39,900원" */
export function formatKRW(value: number): string {
  return `${krw.format(value)}원`;
}
