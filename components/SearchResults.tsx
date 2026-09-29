"use client";

import { useSearchParams } from "next/navigation";
import type { SearchItem } from "@/lib/search";
import { SearchView } from "./SearchView";

/** 주소의 ?q= 를 읽어 검색 결과를 보여준다 */
export function SearchResults({ items }: { items: readonly SearchItem[] }) {
  const searchParams = useSearchParams();
  return <SearchView items={items} query={searchParams.get("q") ?? ""} />;
}
