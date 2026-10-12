import { getAllReviews } from "@/lib/content";
import { TrendRanks } from "./TrendRanks";

const MAX = 10;

/**
 * 헤더 오른쪽의 인기 검색어 순위. 실제 검색 통계가 아니라 리뷰의 제품군 태그를
 * 시간대별로 섞어 보여 주는 연출용 목록이다 (순위와 변동 화살표는 TrendRanks 가 만든다).
 */
export function TrendTicker() {
  const words = [...new Set(getAllReviews().map((r) => r.tags[0]))].slice(0, MAX);
  if (words.length === 0) return null;
  return <TrendRanks words={words} />;
}
