"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** 현재 페이지 표시(aria-current)만 담당하는 작은 클라이언트 컴포넌트 */
export function NavLink({ href, className, children }: { href: Route; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href;
  return (
    <Link href={href} className={className} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
