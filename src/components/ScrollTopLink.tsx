"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function getHrefParts(href: string) {
  // Support hrefs like "/listari", "/listari?x=1", "/listari#top".
  const url = new URL(href, "http://localhost");
  return { pathname: url.pathname, search: url.search };
}

export function ScrollTopLink({ href, className, children }: Props) {
  const pathname = usePathname();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    const currentPath = normalizePathname(pathname);
    const currentSearch =
      typeof window === "undefined" ? "" : window.location.search ?? "";
    const current = currentSearch ? `${currentPath}${currentSearch}` : currentPath;

    const { pathname: hrefPathname, search: hrefSearch } = getHrefParts(href);
    const targetPath = normalizePathname(hrefPathname);
    const target = hrefSearch ? `${targetPath}${hrefSearch}` : targetPath;

    // If we're already on the target page, Next.js won't navigate, so force scroll.
    if (current === target) {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

