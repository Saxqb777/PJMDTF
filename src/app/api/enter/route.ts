import { type NextRequest } from "next/server";

import { COOKIE_MAX_AGE, SESSION_COOKIE, isPasswordCorrect } from "@/lib/auth";
import { redirectTo } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const supplied = form.get("password");
  const password = typeof supplied === "string" ? supplied : "";

  if (!(await isPasswordCorrect(password))) {
    return redirectTo("/enter?e=1");
  }

  const response = redirectTo("/report");
  response.cookies.set(SESSION_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}
