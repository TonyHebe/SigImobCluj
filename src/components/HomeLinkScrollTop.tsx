"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEventHandler, ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export function HomeLinkScrollTop({ className, children }: Props) {
  const pathname = usePathname();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    // If we're already on the home page, Next.js won't navigate, so force scroll.
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

