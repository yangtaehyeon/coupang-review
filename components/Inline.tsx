import { Fragment, type ReactNode } from "react";
import { splitInline } from "@/lib/text";

/** 인라인 텍스트 렌더러: **굵게** 만 <strong> 으로 바꾼다. HTML 을 해석하지 않으므로 dangerouslySetInnerHTML 이 필요 없다 */
export function renderInline(text: string): ReactNode {
  const parts = splitInline(text);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}
