// 로고 원본(assets/logo-source.webp, 투명 배경 천사 캐릭터)으로 사이트 로고·파비콘·앱 아이콘을 만든다. 실행: npm run icons
//   public/images/brand/logo.png       헤더 로고 (전신, 투명 배경, 192px)
//   public/images/brand/logo-face.png  작은 자리용 얼굴 로고 (동그란 연하늘 배경, 192px). 공유 썸네일에 쓴다
//   app/icon.png                       브라우저 탭 아이콘 (얼굴, 192px)
//   app/favicon.ico                    16·32·48px (구형 브라우저, 검색 결과 아이콘)
//   app/apple-icon.png                 180px 정사각형 (아이폰 홈 화면, 모서리는 기기가 둥글게 자른다)
//   public/logo-512.png                512px 흰 배경 전신 (구조화 데이터의 사이트 로고)
// 작은 크기에서는 전신이 뭉개져서 얼굴(금발·천사 고리)만 잘라 쓴다.
import fs from "node:fs";
import sharp from "sharp";

const SOURCE = "assets/logo-source.webp";
/** 원본(1254px)에서 얼굴과 천사 고리가 들어가는 정사각형 */
const FACE = { left: 280, top: 30, width: 720, height: 720 };
const SOFT_BG = "#E3EEFF";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const full = (size, background = TRANSPARENT, pad = 0) =>
  sharp(SOURCE)
    .trim()
    .resize(size - pad * 2, size - pad * 2, { fit: "contain", background })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background })
    .flatten(background.alpha === 0 ? false : { background })
    .png()
    .toBuffer();

/** 얼굴을 연하늘 배경 위에 올린 정사각형. circle=true 면 원 모양으로 자른다 */
async function face(size, circle = true) {
  const head = await sharp(SOURCE).extract(FACE).resize(size, size).png().toBuffer();
  const square = await sharp({ create: { width: size, height: size, channels: 4, background: SOFT_BG } })
    .composite([{ input: head }])
    .png()
    .toBuffer();
  if (!circle) return square;
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
  return sharp(square).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

/** PNG 여러 장을 담은 ICO (모든 최신 브라우저가 PNG 내장 ICO 를 읽는다) */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

fs.mkdirSync("public/images/brand", { recursive: true });
// 헤더·공유 썸네일용 가로형 로고 (assets/logo-wide-source.webp)
await sharp("assets/logo-wide-source.webp").trim().resize({ height: 240 }).png().toFile("public/images/brand/logo-wide.png");
fs.writeFileSync("public/images/brand/logo-face.png", await face(192));
fs.writeFileSync("app/icon.png", await face(192));
fs.writeFileSync("app/apple-icon.png", await face(180, false));
fs.writeFileSync("public/logo-512.png", await full(512, { r: 255, g: 255, b: 255, alpha: 1 }, 32));
// 큰 그림을 한 번 그린 뒤 줄여야 작은 크기에서도 가장자리가 매끄럽다
const big = await face(192);
const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await sharp(big).resize(size, size).png().toBuffer() })),
);
fs.writeFileSync("app/favicon.ico", ico(icoImages));
console.log("만든 파일: public/images/brand/logo.png, logo-face.png, app/icon.png, app/favicon.ico, app/apple-icon.png, public/logo-512.png");
