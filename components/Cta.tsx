import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import type { Review } from "@/content/types";
import { AFFILIATE_REL } from "@/site.config";
import styles from "./Cta.module.css";

/** 구매 의도 링크 문구는 사이트 전체에서 하나만 쓴다 ("최저가" 같은 최상급 표현은 쓰지 않는다) */
export const CTA_LABEL = "쿠팡에서 가격 보기";

type Product = Review["product"];

function NewWindowHint() {
  return <span className="visually-hidden">(새 창에서 열림)</span>;
}

/**
 * 주 CTA 버튼. 파트너스 대시보드에서 받은 링크를 가공하지 않고 그대로 쓴다
 * (리다이렉트, 단축 URL, onclick 전용 링크 금지). 스티키/플로팅으로 만들지 않는다.
 */
export function AffiliateButton({ product }: { product: Product }) {
  return (
    <a className={styles.primary} href={product.affiliateUrl} rel={AFFILIATE_REL} target="_blank">
      {CTA_LABEL}
      <ArrowUpRightIcon aria-hidden="true" />
      <NewWindowHint />
    </a>
  );
}

/** 본문 중간의 텍스트형 CTA (한 번만) */
export function AffiliateInlineLink({ product }: { product: Product }) {
  return (
    <a className={styles.inline} href={product.affiliateUrl} rel={AFFILIATE_REL} target="_blank">
      {CTA_LABEL}
      <ArrowUpRightIcon aria-hidden="true" />
      <NewWindowHint />
    </a>
  );
}

/** 버튼 아래 안내. 정확한 가격은 쓰지 않는다 */
export function PriceNote() {
  return <p className={styles.note}>정확한 가격과 재고는 쿠팡에서 확인해 주세요.</p>;
}
