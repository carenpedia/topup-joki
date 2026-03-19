import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/masuk";
  url.search = "";

  const res = NextResponse.redirect(url);
  res.cookies.set("session", "", { path: "/", maxAge: 0 });
  return res;
}