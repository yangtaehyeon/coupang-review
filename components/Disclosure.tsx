import { COUPANG_DISCLOSURE } from "@/site.config";
import styles from "./Disclosure.module.css";

/**
 * 쿠팡 파트너스 대가성 문구. 제휴 링크가 있는 글의 제목 바로 아래(첫 부분)에 둔다.
 * 본문보다 눈에 띄게, 접거나 이미지로 만들지 않는다 (공정위 추천·보증 심사지침 V.6).
 */
export function Disclosure() {
  return (
    <p className={styles.disclosure} role="note">
      {COUPANG_DISCLOSURE}
    </p>
  );
}
