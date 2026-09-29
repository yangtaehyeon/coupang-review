// lib/logo.ts 원본으로 파비콘·앱 아이콘·사이트 로고 이미지를 만든다. 실행: npm run icons
//   app/icon.svg        브라우저 탭 아이콘 (SVG 지원 브라우저)
//   app/favicon.ico     16·32·48px (구형 브라우저, 네이버·구글 검색 결과 아이콘)
//   app/apple-icon.png  180px 정사각형 (아이폰 홈 화면, 모서리는 기기가 둥글게 자른다)
//   public/logo-512.png 512px (구조화 데이터의 사이트 로고)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const { logoSvg } = await import(pathToFileURL(path.resolve("lib/logo.ts")).href);

const rounded = Buffer.from(logoSvg());
const square = Buffer.from(logoSvg({ rounded: false }));
// 64 단위 SVG 를 목표 크기의 2배 해상도로 그린 뒤 줄여 가장자리를 매끄럽게 한다
const png = (svg, size) =>
  sharp(svg, { density: Math.ceil((72 * size * 2) / 64) })
    .resize(size, size)
    .png()
    .toBuffer();

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

fs.writeFileSync("app/icon.svg", logoSvg());
fs.writeFileSync("app/apple-icon.png", await png(square, 180));
fs.writeFileSync("public/logo-512.png", await png(rounded, 512));
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(rounded, size) })));
fs.writeFileSync("app/favicon.ico", ico(icoImages));
console.log("만든 파일: app/icon.svg, app/favicon.ico (16·32·48), app/apple-icon.png (180), public/logo-512.png (512)");
