"use client";

import { useSearchParams } from "next/navigation";
import { type FeedItem, parseFeed } from "@/lib/paging";
import { FeedView } from "./FeedView";

/** 주소의 ?sort=&per=&page= 를 읽어 해당 정렬·페이지를 보여준다 */
export function PagedFeed({ items, basePath }: { items: readonly FeedItem[]; basePath: string }) {
  const searchParams = useSearchParams();
  const state = parseFeed(searchParams.get("page"), searchParams.get("per"), searchParams.get("sort"), items.length);
  return <FeedView items={items} basePath={basePath} {...state} />;
}
