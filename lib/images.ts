import fs from "node:fs";
import path from "node:path";

// 콘텐츠에 이미지 경로를 적어 두고 파일을 아직 넣지 않은 경우를 대비한다.
// 파일이 없으면 이미지를 그리지 않고(깨진 이미지 대신 레이아웃이 접힘) 빌드 로그에 경고만 남긴다.

const cache = new Map<string, boolean>();
const warned = new Set<string>();

function isRemote(src: string): boolean {
  return /^https?:\/\//.test(src);
}

/** public 폴더 기준 로컬 이미지가 실제로 있는지 확인한다. 원격 이미지는 next.config 의 remotePatterns 에 맡긴다 */
export function imageExists(src: string): boolean {
  if (isRemote(src)) return true;
  const cached = cache.get(src);
  if (cached !== undefined) return cached;
  const clean = src.split(/[?#]/)[0] ?? src;
  const file = path.join(/* turbopackIgnore: true */ process.cwd(), "public", ...clean.split("/").filter(Boolean));
  const exists = fs.existsSync(file);
  cache.set(src, exists);
  if (!exists && !warned.has(src)) {
    warned.add(src);
    console.warn(`[content] 이미지 파일이 없어 건너뜁니다: public${clean}`);
  }
  return exists;
}

/** 이미지가 있으면 그대로, 없으면 undefined */
export function usableImage<T extends { src: string }>(image: T | undefined): T | undefined {
  return image && imageExists(image.src) ? image : undefined;
}
