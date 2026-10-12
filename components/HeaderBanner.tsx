import { COUPANG_DISCLOSURE } from "@/site.config";
import styles from "./HeaderBanner.module.css";

// 쿠팡 파트너스 다이나믹 배너(캐러셀). g.js 스크립트가 만드는 것과 같은 iframe 을 직접 넣는다
// (스크립트 방식은 React 페이지 이동 때 다시 그려지지 않는다).
const BANNER = { id: 1038274, trackingCode: "AF2470977", width: 680, height: 100 };
const SRC = `https://ads-partners.coupang.com/widgets.html?id=${BANNER.id}&template=carousel&trackingCode=${BANNER.trackingCode}&subId=&width=${BANNER.width}&height=${BANNER.height}&tsource=`;

/** 헤더 바로 아래 쿠팡 배너. 배너가 있는 모든 페이지에 대가성 문구를 함께 보여준다 */
export function HeaderBanner() {
  return (
    <div className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <iframe
          src={SRC}
          width={BANNER.width}
          height={BANNER.height}
          title="쿠팡 추천 상품"
          referrerPolicy="unsafe-url"
          scrolling="no"
          className={styles.frame}
        />
        <p className={styles.note}>{COUPANG_DISCLOSURE}</p>
      </div>
    </div>
  );
}
