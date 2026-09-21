import { NextResponse } from "next/server";

/**
 * Redirect to a path on whatever host the member is already on.
 *
 * A relative Location header is resolved by the browser against the current
 * URL, so nobody is quietly moved between 127.0.0.1, localhost and the real
 * domain. Building an absolute URL from nextUrl.origin can do exactly that,
 * and a cookie set for one host is never sent to the other — which loses the
 * session, or hands back an empty form to someone who just filled it in.
 */
export function redirectTo(path: string, status: 303 | 307 = 303): NextResponse {
  return new NextResponse(null, {
    status,
    headers: { Location: path },
  });
}
