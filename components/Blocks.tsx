import { InfoIcon, LightbulbIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import type { Block } from "@/content/types";
import { imageExists } from "@/lib/images";
import calloutStyles from "./Callout.module.css";
import { renderInline } from "./Inline";
import prose from "./Prose.module.css";
import tableStyles from "./Table.module.css";

type CalloutBlock = Extract<Block, { type: "callout" }>;
type TableBlock = Extract<Block, { type: "table" }>;
type ImageBlock = Extract<Block, { type: "img" }>;

const CALLOUT = {
  tip: { title: "팁", Icon: LightbulbIcon, className: calloutStyles.tip },
  warn: { title: "주의", Icon: WarningIcon, className: calloutStyles.warn },
  info: { title: "참고", Icon: InfoIcon, className: calloutStyles.info },
} as const;

function Callout({ block }: { block: CalloutBlock }) {
  const tone = CALLOUT[block.tone];
  const Icon = tone.Icon;
  return (
    <aside className={`${calloutStyles.callout} ${tone.className}`} role="note">
      <Icon className={calloutStyles.icon} weight="fill" aria-hidden="true" />
      <div>
        <p className={calloutStyles.title}>{block.title ?? tone.title}</p>
        <p className={calloutStyles.text}>{renderInline(block.text)}</p>
      </div>
    </aside>
  );
}

function Table({ block, id }: { block: TableBlock; id: string }) {
  const captionId = `${id}-caption`;
  const narrow = block.head.length <= 2;
  return (
    // 좁은 화면에서 표만 가로로 스크롤된다. 키보드로도 스크롤할 수 있게 포커스를 받는다
    <div className={tableStyles.wrap} role="region" aria-labelledby={captionId} tabIndex={0}>
      <table className={`${tableStyles.table} ${narrow ? tableStyles.narrow : ""}`}>
        <caption id={captionId} className={tableStyles.caption}>
          {block.caption}
        </caption>
        <thead>
          <tr>
            {block.head.map((cell, i) => (
              <th key={i} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row">
                    {renderInline(cell)}
                  </th>
                ) : (
                  <td key={c}>{renderInline(cell)}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ block }: { block: ImageBlock }) {
  // 파일이 아직 없으면 깨진 이미지 대신 블록을 건너뛴다
  if (!imageExists(block.src)) return null;
  return (
    <figure className={prose.figure}>
      <Image
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        sizes="(min-width: 1024px) 42rem, 100vw"
      />
      {block.caption ? <figcaption className={prose.figcaption}>{block.caption}</figcaption> : null}
    </figure>
  );
}

function BlockView({ block, id }: { block: Block; id: string }) {
  switch (block.type) {
    case "p":
      return <p>{renderInline(block.text)}</p>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "table":
      return <Table block={block} id={id} />;
    case "callout":
      return <Callout block={block} />;
    case "img":
      return <Figure block={block} />;
  }
}

/** 콘텐츠 Block[] 렌더러. idPrefix 는 표 caption id 처럼 페이지 안에서 고유해야 하는 id 에 쓴다 */
export function Blocks({ blocks, idPrefix }: { blocks: readonly Block[]; idPrefix: string }) {
  return (
    <div className={prose.prose}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} id={`${idPrefix}-${i + 1}`} />
      ))}
    </div>
  );
}
