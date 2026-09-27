import Image from "next/image";
import type { Review } from "@/content/types";
import { usableImage } from "@/lib/images";
import { reviewPath } from "@/lib/seo";
import styles from "./Thumbnail.module.css";

/**
 * 글 썸네일. 운영자가 찍은 사진(product.image)이 있으면 사진, 없으면 빌드 때 만든 블로그 썸네일
 * (app/reviews/[slug]/opengraph-image.tsx, 1200x630)을 그대로 쓴다. 쿠팡·판매자 이미지는 쓰지 않는다.
 */
export function Thumbnail({
  review,
  sizes,
  preload = false,
  className,
}: {
  review: Review;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const photo = usableImage(review.product.image);
  const classes = [styles.thumb, className].filter(Boolean).join(" ");

  if (review.product.iframeUrl) {
    return (
      <div className={`${classes} ${styles.widget}`}>
        <iframe
          src={review.product.iframeUrl}
          width="120"
          height="240"
          scrolling="no"
          referrerPolicy="unsafe-url"
          loading={preload ? "eager" : "lazy"}
          title={review.product.name}
        />
      </div>
    );
  }

  if (photo) {
    return (
      <div className={classes}>
        <Image src={photo.src} alt="" fill sizes={sizes} {...(preload ? { preload: true } : {})} />
      </div>
    );
  }
  return (
    <div className={classes}>
      <Image
        src={`${reviewPath(review.slug)}/opengraph-image`}
        alt=""
        width={1200}
        height={630}
        sizes={sizes}
        unoptimized
        {...(preload ? { preload: true } : { loading: "lazy" as const })}
      />
    </div>
  );
}
