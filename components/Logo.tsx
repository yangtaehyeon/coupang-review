import { logoSvg } from "@/lib/logo";
import styles from "./Logo.module.css";

/** 사이트 로고 마크 (장식용, 옆에 사이트 이름 글자를 함께 둔다) */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      // 코드 안의 고정 SVG 문자열이라 외부 입력이 섞이지 않는다
      dangerouslySetInnerHTML={{ __html: logoSvg() }}
    />
  );
}
