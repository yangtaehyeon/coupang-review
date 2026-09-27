// 인라인 텍스트(**굵게** 만 지원) 변환 유틸. React 가 필요 없는 곳(JSON-LD, RSS, 메타)에서 쓴다.

const BOLD = /\*\*(.+?)\*\*/g;

/** **굵게** 표기를 벗겨 화면에 보이는 글자 그대로의 평문을 만든다 (JSON-LD, meta 용) */
export function stripInline(text: string): string {
  return text.replace(BOLD, "$1");
}

/** 인라인 텍스트를 [일반, 굵게, 일반, 굵게, ...] 조각으로 나눈다. 홀수 인덱스가 굵게 */
export function splitInline(text: string): string[] {
  return text.split(BOLD);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** RSS 본문용: 이스케이프한 뒤 **굵게** 만 <strong> 으로 바꾼다 */
export function inlineToHtml(text: string): string {
  return splitInline(text)
    .map((part, i) => (i % 2 === 1 ? `<strong>${escapeHtml(part)}</strong>` : escapeHtml(part)))
    .join("");
}
