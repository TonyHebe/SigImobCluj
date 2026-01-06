import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  if (pathname.startsWith("/logout")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const authCookie = request.cookies.get("sig_auth")?.value;
  const isAuthed = authCookie === "1";

  if (pathname.startsWith("/login")) {
    if (!isAuthed) return NextResponse.next();
    const nextParam = request.nextUrl.searchParams.get("next");
    const destination = nextParam && nextParam.startsWith("/") ? nextParam : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  if (!isAuthed) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Run on everything except:
      - static files (e.g. .png, .jpg, .css, .js)
      - Next.js internals already excluded above via /_next
    */
    "/((?!.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)",
  ],
};

