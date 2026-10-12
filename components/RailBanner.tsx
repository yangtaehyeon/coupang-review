import { AFFILIATE_REL } from "@/site.config";
import styles from "./RailBanner.module.css";

/**
 * 본문 오른쪽 바깥 여백에 고정되는 쿠팡 파트너스 세로 배너 (160x600).
 * 여백이 배너보다 넓은 큰 화면에서만 보인다. 링크와 이미지 주소는 파트너스에서 받은 그대로 쓴다.
 */
export function RailBanner() {
  return (
    <a
      href="https://link.coupang.com/a/hM0A5NSRXg"
      target="_blank"
      rel={AFFILIATE_REL}
      referrerPolicy="unsafe-url"
      className={styles.rail}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 파트너스 배너는 외부 주소 그대로 불러야 한다 */}
      <img
        src="https://ads-partners.coupang.com/banners/1038279?trackingCode=AF2470977&subId=&traceId=V0-301-879dd1202e5c73b2-I1038279&w=160&h=600"
        alt="쿠팡 추천 상품 배너"
        width={160}
        height={600}
        loading="lazy"
      />
    </a>
  );
}
