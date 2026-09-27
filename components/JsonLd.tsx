import type { JsonLdObject } from "@/lib/seo";

/** JSON-LD 출력. Next.js JSON-LD 가이드대로 "<" 를 < 로 바꿔 스크립트 주입을 막는다 */
export function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
