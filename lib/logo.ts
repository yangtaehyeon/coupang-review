// 사이트 로고 (천사 캐릭터). 원본은 assets/logo-source.webp 이고, 아래 파일들은 `npm run icons` 로 만든다.
// 원본을 바꾸면 같은 명령으로 헤더 로고·파비콘·앱 아이콘·공유 썸네일용 로고가 한 번에 바뀐다.

/** 헤더 로고: 전신, 투명 배경 (public 기준 경로) */
/** 헤더·공유 썸네일 로고: 가로형(천사 + Itemangel 글자), 투명 배경, 577x240 */
export const LOGO_SRC = "/images/brand/logo-wide.png";
export const LOGO_SIZE = { width: 577, height: 240 } as const;
/** 공유 썸네일이 읽는 파일 경로 (프로젝트 루트 기준) */
export const LOGO_WIDE_FILE = "public/images/brand/logo-wide.png";
