import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import type { Spec } from "@/content/types";
import styles from "./Specs.module.css";

const VISIBLE_WHEN_COLLAPSED = 6;
const COLLAPSE_OVER = 8;

function SpecList({ specs }: { specs: readonly Spec[] }) {
  return (
    <dl className={styles.specs}>
      {specs.map((spec, i) => (
        <div key={i} className={styles.item}>
          <dt className={styles.label}>{spec.label}</dt>
          <dd className={styles.value}>{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 사양 타일. 8개를 넘으면 앞 6개만 보이고 나머지는 펼쳐 보게 한다 (내용은 HTML 에 모두 있다) */
export function Specs({ specs }: { specs: readonly Spec[] }) {
  if (specs.length <= COLLAPSE_OVER) return <SpecList specs={specs} />;
  const head = specs.slice(0, VISIBLE_WHEN_COLLAPSED);
  const rest = specs.slice(VISIBLE_WHEN_COLLAPSED);
  return (
    <>
      <SpecList specs={head} />
      <details className={styles.more}>
        <summary>
          전체 사양 {specs.length}개 보기
          <CaretDownIcon className={styles.caret} aria-hidden="true" />
        </summary>
        <SpecList specs={rest} />
      </details>
    </>
  );
}
