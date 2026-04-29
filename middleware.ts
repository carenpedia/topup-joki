import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isMemberRoute = pathname.startsWith("/akun") || pathname.startsWith("/user");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isUserApi = pathname.startsWith("/api/user");

  if (!isAdminRoute && !isMemberRoute && !isAdminApi && !isUserApi) return NextResponse.next();

  if (!token) {
    // API routes: return 401 JSON instead of redirect
    if (isAdminApi || isUserApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/masuk";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const s = await verifySession(token);

    if ((isAdminRoute || isAdminApi) && s.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const res = NextResponse.next();
    res.headers.set("x-middleware-cache", "no-cache");
    return res;
  } catch {
    // API routes: return 401 JSON instead of redirect
    if (isAdminApi || isUserApi) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    const loginUrl = new URL("/masuk", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/akun",
    "/akun/:path*",
    "/user",
    "/user/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
  ],
};
