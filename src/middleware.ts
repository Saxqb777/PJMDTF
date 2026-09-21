import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isSessionValid } from "@/lib/auth";

// Only /report is held. The announcement and the form's POST route stay open,
// because the form is shared in the Jamaat WhatsApp group and a password on it
// means nobody fills it.

export async function middleware(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isSessionValid(cookie)) return NextResponse.next();

  // Built from request.url, which carries the host the member actually typed.
  // nextUrl.origin does not: it can read as localhost whatever the request
  // said, and a cookie set for one host is never sent to the other.
  const destination = new URL("/enter", request.url);
  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: ["/report", "/report/:path*"],
};
