import Image from "next/image";
import { LOGO_SIZE, LOGO_SRC } from "@/lib/logo";
import { siteConfig } from "@/site.config";
import styles from "./Logo.module.css";

/** 사이트 로고: 가로형(천사 + Itemangel 글자). 글자가 그림 안에 있어 alt 로 사이트 이름을 준다 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO_SRC}
      alt={siteConfig.name}
      width={LOGO_SIZE.width}
      height={LOGO_SIZE.height}
      preload
      className={[styles.logo, className].filter(Boolean).join(" ")}
    />
  );
}
