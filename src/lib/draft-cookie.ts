// When the form is rejected we hand it straight back to the member with what
// they typed still in it — retyping an address on a phone is miserable.
//
// The draft travels in a short-lived httpOnly cookie rather than in the URL.
// A member's phone number and address must not end up in browser history,
// server access logs or a Referer header.

import type { Draft } from "@/lib/validate";

export const DRAFT_COOKIE = "pjmdtf_draft";
export const DRAFT_MAX_AGE = 300; // five minutes is plenty to correct a field

export type DraftPayload = { message: string; draft: Draft };

export const EMPTY_DRAFT: Draft = {
  fullName: "",
  country: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  amount: "",
  otherAmount: "",
};

export function encodeDraft(payload: DraftPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeDraft(value: string | undefined): DraftPayload | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed !== "object" || parsed === null) return null;
    const { message, draft } = parsed as Partial<DraftPayload>;
    if (typeof message !== "string" || typeof draft !== "object" || draft === null) return null;
    // Rebuild field by field so a tampered cookie cannot inject extra keys.
    const safe: Draft = { ...EMPTY_DRAFT };
    for (const key of Object.keys(EMPTY_DRAFT) as (keyof Draft)[]) {
      const field = (draft as Record<string, unknown>)[key];
      if (typeof field === "string") safe[key] = field.slice(0, 500);
    }
    return { message: message.slice(0, 300), draft: safe };
  } catch {
    return null;
  }
}
