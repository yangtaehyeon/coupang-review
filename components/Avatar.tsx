import Image from "next/image";
import { imageExists } from "@/lib/images";
import { siteConfig } from "@/site.config";
import styles from "./Avatar.module.css";

type Size = "s" | "m" | "l" | "xl";
const PX: Record<Size, number> = { s: 28, m: 40, l: 72, xl: 112 };

/**
 * 블로거 프로필 사진. site.config 의 author.avatar 에 사진 경로를 넣으면 사진을,
 * 없으면 닉네임 첫 글자를 코랄 동그라미에 넣어 보여준다 (가상 인물 사진은 쓰지 않는다).
 */
export function Avatar({ size = "m", className }: { size?: Size; className?: string }) {
  const { avatar, name } = siteConfig.author;
  const px = PX[size];
  const classes = [styles.avatar, styles[size], className].filter(Boolean).join(" ");
  if (avatar && imageExists(avatar)) {
    return <Image src={avatar} alt="" width={px} height={px} className={classes} />;
  }
  return (
    <span className={`${classes} ${styles.mono}`} aria-hidden="true">
      {name.charAt(0)}
    </span>
  );
}
