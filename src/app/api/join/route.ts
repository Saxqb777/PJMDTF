import { type NextRequest } from "next/server";

import { upsertMember } from "@/lib/db";
import { validate, draftFrom, type Draft } from "@/lib/validate";
import { DRAFT_COOKIE, DRAFT_MAX_AGE, encodeDraft } from "@/lib/draft-cookie";
import { redirectTo } from "@/lib/redirect";
import { toLang, errors, type Lang } from "@/lib/strings";

// A plain HTML form POST followed by a redirect. No client-side fetch: it
// survives a bad connection, which matters when half the members are on
// patchy mobile data.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keep the member in the language they were reading. */
function withLang(path: string, query: URLSearchParams, lang: Lang, hash = ""): string {
  if (lang !== "en") query.set("lang", lang);
  const search = query.toString();
  return path + (search === "" ? "" : "?" + search) + hash;
}

function sendBack(message: string, draft: Draft, lang: Lang) {
  const response = redirectTo(
    withLang("/", new URLSearchParams({ e: "1" }), lang, "#form"),
  );
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
  const supplied = form.get("lang");
  const lang = toLang(typeof supplied === "string" ? supplied : undefined);

  const result = validate(form, lang);

  if (!result.ok) {
    return sendBack(result.message, result.draft, lang);
  }

  try {
    const { created } = await upsertMember(result.member);
    const query = new URLSearchParams({ done: String(result.member.monthlyAmount) });
    if (!created) query.set("again", "1");

    const response = redirectTo(withLang("/", query, lang, "#form"));
    response.cookies.delete(DRAFT_COOKIE);
    return response;
  } catch (error) {
    console.error("Could not save member:", error);
    return sendBack(errors(lang).saveFailed, draftFrom(form), lang);
  }
}
