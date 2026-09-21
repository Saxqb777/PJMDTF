import { type NextRequest } from "next/server";

import { upsertMember } from "@/lib/db";
import { validate, draftFrom } from "@/lib/validate";
import { DRAFT_COOKIE, DRAFT_MAX_AGE, encodeDraft } from "@/lib/draft-cookie";
import { redirectTo } from "@/lib/redirect";

// A plain HTML form POST followed by a redirect. No client-side fetch: it
// survives a bad connection, which matters when half the members are on
// patchy mobile data.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sendBack(message: string, draft: ReturnType<typeof draftFrom>) {
  const response = redirectTo("/?e=1#form");
  response.cookies.set(DRAFT_COOKIE, encodeDraft({ message, draft }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DRAFT_MAX_AGE,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = validate(form);

  if (!result.ok) {
    return sendBack(result.message, result.draft);
  }

  try {
    const { created } = await upsertMember(result.member);
    const query = new URLSearchParams({ done: String(result.member.monthlyAmount) });
    if (!created) query.set("again", "1");

    const response = redirectTo("/?" + query.toString());
    response.cookies.delete(DRAFT_COOKIE);
    return response;
  } catch (error) {
    console.error("Could not save member:", error);
    return sendBack(
      "We could not save your form just now. Please try again in a moment.",
      draftFrom(form),
    );
  }
}
