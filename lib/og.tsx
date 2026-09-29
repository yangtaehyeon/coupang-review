import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Tone } from "@/content/types";
import { siteConfig } from "@/site.config";
import { logoSvg } from "./logo";

// 파일 기반 OG 이미지 공통 렌더러 (1200x630).
// 공유 미리보기이면서 블로그 카드 목록의 썸네일로도 쓰이므로, 폭 360px 로 줄어도 읽히는 블로그 썸네일처럼 그린다:
// 파스텔 배경 + 굵은 제목(최대 2줄) + 후킹 문구 스티커 + 라벨·해시태그 + 블로거 서명 (+ 에디터 점수).
// 사진은 넣지 않는다 (쿠팡·판매자 이미지는 파트너스 정책상 쓸 수 없다).
// 한글 폰트 순서: 1) 설치된 pretendard 패키지의 OTF  2) Google Fonts text= 서브셋  3) 실패하면 영문만 그린다.

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// ── 폰트 ─────────────────────────────────────────────

type Weight = 700 | 800 | 900;
type OgFont = { name: string; data: ArrayBuffer | Buffer; weight: Weight; style: "normal" };

const FAMILY = "OgSans";
/** 900 제목, 800 스티커·점수, 700 라벨·서명. 파일 하나가 약 1.5MB 라 쓰는 굵기만 읽는다 */
const WEIGHTS: readonly Weight[] = [700, 800, 900];
const LOCAL_FILES: Record<Weight, string> = {
  700: "Pretendard-Bold.otf",
  800: "Pretendard-ExtraBold.otf",
  900: "Pretendard-Black.otf",
};

let localFonts: Promise<OgFont[] | null> | undefined;

// 같은 배열을 계속 넘겨야 렌더러가 파싱한 폰트를 재사용한다 (배열 단위 캐시)
function loadLocalFonts(): Promise<OgFont[] | null> {
  localFonts ??= (async () => {
    try {
      const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "node_modules", "pretendard", "dist", "public", "static");
      return await Promise.all(
        WEIGHTS.map(
          async (weight): Promise<OgFont> => ({
            name: FAMILY,
            data: await readFile(path.join(/* turbopackIgnore: true */ dir, LOCAL_FILES[weight])),
            weight,
            style: "normal",
          }),
        ),
      );
    } catch {
      return null;
    }
  })();
  return localFonts;
}

async function loadGoogleFont(weight: Weight, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent("Noto Sans KR")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const cssRes = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!cssRes.ok) throw new Error(`Google Fonts CSS 요청 실패: ${cssRes.status}`);
  const match = (await cssRes.text()).match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match?.[1]) throw new Error("Google Fonts CSS 에서 폰트 주소를 찾지 못했습니다");
  const res = await fetch(match[1], { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`폰트 다운로드 실패: ${res.status}`);
  return res.arrayBuffer();
}

/** widthScale: 글자 폭 어림값에 곱할 배수 (Noto Sans KR 한글은 Pretendard 보다 약 16% 넓다) */
type LoadedFonts = { fonts: OgFont[]; widthScale: number };

async function loadFonts(text: string): Promise<LoadedFonts | null> {
  const local = await loadLocalFonts();
  if (local) return { fonts: local, widthScale: 1 };
  try {
    // 제목 말줄임(…)도 그릴 수 있게 서브셋에 같이 담는다
    const subset = [...new Set(`${text}…`)].join("");
    const data = await Promise.all(WEIGHTS.map((weight) => loadGoogleFont(weight, subset)));
    const fonts = WEIGHTS.map((weight, i): OgFont => ({ name: FAMILY, data: data[i], weight, style: "normal" }));
    return { fonts, widthScale: 1.16 };
  } catch (error) {
    console.warn("[og] 한글 폰트를 불러오지 못해 영문 대체 이미지로 만듭니다.", error);
    return null;
  }
}

// ── 색 (app/globals.css 토큰과 같은 값) ────────────────

const INK = { text: "#1c1917", text2: "#57534e", text3: "#716a65", white: "#ffffff" } as const;
const CORAL = { deco: "#ff6b4a", strong: "#cf3d1a", soft: "#fff1ec" } as const;

const TONES: Record<Tone, { bg: string; fg: string }> = {
  sky: { bg: "#e7f1ff", fg: "#2463c7" },
  mint: { bg: "#e2f6ee", fg: "#0f7a55" },
  peach: { bg: "#ffeee4", fg: "#c2561c" },
  lilac: { bg: "#efeaff", fg: "#5b45c9" },
  lemon: { bg: "#fff6d8", fg: "#8a6400" },
  rose: { bg: "#ffe9ee", fg: "#c23256" },
  slate: { bg: "#eef0f3", fg: "#4b5563" },
};

/** 카테고리 톤 또는 "brand"(코랄: 홈, 태그) */
export type OgTheme = Tone | "brand";

type Palette = { bg: string; fg: string; deco: string };

function paletteOf(theme: OgTheme): Palette {
  if (theme === "brand") return { bg: CORAL.soft, fg: CORAL.strong, deco: CORAL.deco };
  const tone = TONES[theme] ?? TONES.slate;
  return { bg: tone.bg, fg: tone.fg, deco: tone.fg };
}

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ── 치수 ─────────────────────────────────────────────

const PAD_X = 72;
const PAD_Y = 60;
const INNER_W = OG_SIZE.width - PAD_X * 2;
/** 제목 줄 폭. 오른쪽은 장식 원 자리로 비워 두고, 긴 제목은 두 줄로 쌓는다 */
const TITLE_MAX_W = 900;
/** 한 줄에 다 들어가는 짧은 제목만 쓰는 큰 크기 */
const TITLE_SIZES_SHORT = [100, 96] as const;
const TITLE_SIZES = [92, 88, 84, 80, 76, 72, 68, 64] as const;
const TITLE_TRACKING = -0.04;
const HOOK_SIZES = [40, 38, 36, 34, 32] as const;
const HOOK_TRACKING = -0.03;
const HOOK_PAD_X = 26;

// ── 글자 폭 어림과 제목 줄바꿈 ─────────────────────────

/** 한글 음절·자모 */
function isHangul(cp: number): boolean {
  return (cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0x1100 && cp <= 0x11ff) || (cp >= 0x3130 && cp <= 0x318f);
}

/** Pretendard 글자 폭(em) 어림값. 실제보다 조금 넉넉하게 잡아 넘치지 않는 쪽으로 고른다 */
function glyphEm(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp === 0x20) return 0.23;
  if (isHangul(cp) || (cp >= 0x4e00 && cp <= 0x9fff)) return 0.864;
  if (cp >= 0x30 && cp <= 0x39) return 0.68;
  if ("MW".includes(ch)) return 1.04;
  if ("mw%".includes(ch)) return 0.94;
  if ("Iijl.,:;·!'|".includes(ch)) return 0.34;
  if ("frt()[]/-".includes(ch)) return 0.46;
  if (cp >= 0x41 && cp <= 0x5a) return 0.76;
  if (cp >= 0x61 && cp <= 0x7a) return 0.6;
  return 0.9;
}

function textWidth(text: string, size: number, tracking: number): number {
  let em = 0;
  for (const ch of text) em += glyphEm(ch) + tracking;
  return em * size;
}

/** 한 줄에 들어가는 가장 큰 글자 크기 (끝까지 안 들어가면 가장 작은 크기, 넘치는 부분은 렌더러가 말줄임) */
function fitOneLine(text: string, sizes: readonly number[], maxWidth: number, tracking: number): number {
  return sizes.find((size) => textWidth(text, size, tracking) <= maxWidth) ?? sizes[sizes.length - 1];
}

type TitleLayout = { size: number; lines: string[] };

/** 앞에서부터 fits 를 만족하는 가장 긴 조각(띄어쓰기 단위, 첫 단어부터 안 들어가면 글자 단위)과 나머지 */
function takeFitting(text: string, fits: (s: string) => boolean): [string, string] {
  const words = text.split(" ");
  let head = "";
  let i = 0;
  for (; i < words.length; i++) {
    const next = head ? `${head} ${words[i]}` : words[i];
    if (!fits(next)) break;
    head = next;
  }
  if (head) return [head, words.slice(i).join(" ")];
  const chars = Array.from(text);
  let n = 1;
  while (n < chars.length && fits(chars.slice(0, n + 1).join(""))) n++;
  return [chars.slice(0, n).join(""), chars.slice(n).join("").trim()];
}

/** 줄 첫머리에 홀로 오면 어색한 한 글자 영문·숫자 (모델명 끝의 "S", "2" 같은 조각) */
const isStub = (word: string) => /^[A-Za-z0-9]$/.test(word);
/** 한글이 없는 단어 (모델명 "MX Keys S", "G10 Plus" 처럼 이어지는 영문·숫자 묶음은 되도록 한 줄에 둔다) */
const isLatin = (word: string) => !Array.from(word).some((ch) => isHangul(ch.codePointAt(0) ?? 0));

/**
 * 제목 줄바꿈을 직접 정한다 (띄어쓰기에서만 끊는 keep-all). 큰 크기부터 한 줄 → 두 줄 순으로 맞춰 보고,
 * 두 줄이면 긴 줄이 가장 짧아지는 곳에서 나눠 균형을 맞춘다. 가장 작은 크기로도 안 되면 둘째 줄 끝을 말줄임한다.
 */
function layoutTitle(raw: string, maxWidth: number): TitleLayout {
  const text = raw.trim().split(/\s+/).join(" ");
  const words = text.split(" ");
  const limit = maxWidth * 0.97;
  for (const size of [...TITLE_SIZES_SHORT, ...TITLE_SIZES]) {
    const width = (s: string) => textWidth(s, size, TITLE_TRACKING);
    if (width(text) <= limit) return { size, lines: [text] };
    if (size > TITLE_SIZES[0]) continue;
    let best: string[] | undefined;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 1; i < words.length; i++) {
      const pair = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
      const w = Math.max(width(pair[0]), width(pair[1]));
      if (w > limit) continue;
      // 한 글자 조각이 홀로 떨어지는 줄바꿈("MX Keys / S 무선 키보드")은 다른 방법이 없을 때만,
      // 영문·숫자 묶음 가운데를 끊는 줄바꿈("로지텍 MX / Keys S")은 폭이 꽤 좋아질 때만 쓴다
      const score =
        w +
        (isStub(words[i]) || (i === 1 && isStub(words[0])) ? limit : 0) +
        (isLatin(words[i - 1]) && isLatin(words[i]) ? limit * 0.15 : 0);
      if (score < bestScore) {
        best = pair;
        bestScore = score;
      }
    }
    if (best) return { size, lines: best };
  }
  const size = TITLE_SIZES[TITLE_SIZES.length - 1];
  const fits = (s: string) => textWidth(s, size, TITLE_TRACKING) <= limit;
  const [first, rest] = takeFitting(text, fits);
  if (!rest) return { size, lines: [first] };
  if (fits(rest)) return { size, lines: [first, rest] };
  const [cut] = takeFitting(rest, (s) => fits(`${s}…`));
  return { size, lines: [first, `${cut.replace(/[\s·,.:/-]+$/, "")}…`] };
}

// ── 조각 ─────────────────────────────────────────────

export type OgInput = {
  /** 배경 톤 */
  theme: OgTheme;
  /** 큰 제목 (최대 2줄). "#" 로 시작하면 # 를 코랄색으로 칠한다 */
  title: string;
  /** 제목 아래 스티커 문구 (한 줄) */
  hook?: string;
  /** 왼쪽 위 흰 라벨 (카테고리 이름, "카테고리", "태그" 등) */
  label?: string;
  /** 라벨 옆 해시태그 (# 없이) */
  tag?: string;
  /** 에디터 점수 (1~5). 오른쪽 아래 별점으로 표시 */
  score?: number;
  /** 홈: 위쪽에 큰 블로거 서명, 아래쪽에 도메인 */
  profile?: boolean;
};

function host(): string {
  try {
    return new URL(siteConfig.url).host;
  } catch {
    return siteConfig.url;
  }
}

const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(logoSvg()).toString("base64")}`;

function LogoMark({ size }: { size: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- next/og(satori) 는 <img> 만 그린다
  return <img src={LOGO_DATA_URI} width={size} height={size} alt="" />;
}

function Signature({ large }: { large?: boolean }) {
  const size = large ? 96 : 50;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: large ? 24 : 14 }}>
      <LogoMark size={size} />
      <div
        style={{
          display: "flex",
          fontSize: large ? 52 : 30,
          fontWeight: large ? 900 : 700,
          letterSpacing: large ? -2 : -0.6,
          color: INK.text,
        }}
      >
        {siteConfig.name}
      </div>
    </div>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polygon
        points="12,2.6 14.7,8.9 21.5,9.5 16.3,14 17.9,20.7 12,17.1 6.1,20.7 7.7,14 2.5,9.5 9.3,8.9"
        fill={color}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 네 갈래 반짝이 (미리캔버스 썸네일의 작은 장식) */
function Sparkle({ size, color, left, top }: { size: number; color: string; left: number; top: number }) {
  return (
    <div style={{ position: "absolute", left, top, display: "flex" }}>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 0C12.9 6.2 17.8 11.1 24 12C17.8 12.9 12.9 17.8 12 24C11.1 17.8 6.2 12.9 0 12C6.2 11.1 11.1 6.2 12 0Z" fill={color} />
      </svg>
    </div>
  );
}

function Score({ value }: { value: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 64,
        padding: "0 30px 0 24px",
        borderRadius: 999,
        background: INK.white,
        color: INK.text,
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: -0.5,
      }}
    >
      <Star size={34} color={CORAL.deco} />
      <div style={{ display: "flex" }}>{value.toFixed(1)}</div>
    </div>
  );
}

function Label({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 60,
        padding: "0 28px",
        borderRadius: 999,
        background: INK.white,
        color,
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: -0.6,
      }}
    >
      {text}
    </div>
  );
}

function Title({ layout }: { layout: TitleLayout }) {
  const { size, lines } = layout;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.18,
        letterSpacing: size * TITLE_TRACKING,
        color: INK.text,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", whiteSpace: "nowrap" }}>
          {i === 0 && line.startsWith("#") && line.length > 1 ? (
            <>
              <span style={{ color: CORAL.deco }}>#</span>
              <span>{line.slice(1)}</span>
            </>
          ) : (
            line
          )}
        </div>
      ))}
    </div>
  );
}

function Sticker({ text, size, color }: { text: string; size: number; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        maxWidth: INNER_W,
        padding: `${Math.round(size * 0.3)}px ${HOOK_PAD_X}px ${Math.round(size * 0.34)}px`,
        borderRadius: Math.round(size * 0.4),
        background: color,
        color: INK.white,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.25,
        letterSpacing: size * HOOK_TRACKING,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}

/** 배경 장식: 오른쪽 가장자리로 넘치는 큰 원(깊이감)과 코랄 반짝이 두 개 */
function Backdrop({ pal }: { pal: Palette }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 820,
          top: 5,
          width: 620,
          height: 620,
          borderRadius: 620,
          background: withAlpha(pal.deco, 0.08),
        }}
      />
      <Sparkle size={72} color={CORAL.deco} left={1040} top={62} />
      <Sparkle size={34} color={CORAL.deco} left={1004} top={142} />
    </>
  );
}

function Thumbnail({ input, pal, widthScale }: { input: OgInput; pal: Palette; widthScale: number }) {
  const { title, hook, label, tag, score, profile } = input;
  const titleLayout = layoutTitle(title, TITLE_MAX_W / widthScale);
  const hookSize = hook ? fitOneLine(hook, HOOK_SIZES, ((INNER_W - HOOK_PAD_X * 2) * 0.97) / widthScale, HOOK_TRACKING) : 0;

  const top = profile ? (
    <Signature large />
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: 20, height: 60 }}>
      {label ? <Label text={label} color={pal.fg} /> : null}
      {tag ? (
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: -0.6, color: pal.fg }}>{`#${tag}`}</div>
      ) : null}
    </div>
  );

  const bottom = profile ? (
    <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: -0.3, color: INK.text3 }}>{host()}</div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Signature />
      {typeof score === "number" && Number.isFinite(score) ? <Score value={score} /> : null}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: pal.bg,
        color: INK.text,
        fontFamily: FAMILY,
      }}
    >
      <Backdrop pal={pal} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: `${PAD_Y}px ${PAD_X}px`,
        }}
      >
        {top}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 28 }}>
          <Title layout={titleLayout} />
          {hook ? <Sticker text={hook} size={hookSize} color={pal.fg} /> : null}
        </div>
        {bottom}
      </div>
    </div>
  );
}

/** 한글 폰트가 없을 때: 한글은 두부(□)로 나오므로 영문 사이트명과 도메인만 그린다 (기본 내장 글꼴) */
function FallbackThumbnail({ pal }: { pal: Palette }) {
  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: pal.bg, color: INK.text }}>
      <Backdrop pal={pal} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: `${PAD_Y}px ${PAD_X}px`,
        }}
      >
        <LogoMark size={64} />
        <div style={{ display: "flex", fontSize: 104, letterSpacing: -4 }}>{siteConfig.alternateName}</div>
        <div style={{ display: "flex", fontSize: 30, color: INK.text3 }}>{host()}</div>
      </div>
    </div>
  );
}

export async function renderOgImage(input: OgInput): Promise<ImageResponse> {
  const pal = paletteOf(input.theme);
  const text = [
    input.title,
    input.hook ?? "",
    input.label ?? "",
    input.tag ? `#${input.tag}` : "",
    typeof input.score === "number" ? input.score.toFixed(1) : "",
    siteConfig.name,
    input.profile ? host() : "",
  ].join(" ");
  const loaded = await loadFonts(text);

  if (!loaded) {
    return new ImageResponse(<FallbackThumbnail pal={pal} />, { ...OG_SIZE });
  }
  return new ImageResponse(<Thumbnail input={input} pal={pal} widthScale={loaded.widthScale} />, {
    ...OG_SIZE,
    fonts: loaded.fonts,
  });
}
