import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isMemberRoute = pathname.startsWith("/akun");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isMemberRoute && !isAdminApi) return NextResponse.next();

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/masuk";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const s = await verifySession(token);

    // hanya ADMIN boleh akses /admin dan /api/admin
    if ((isAdminRoute || isAdminApi) && s.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/akun/:path*", "/api/admin/:path*"],
};
