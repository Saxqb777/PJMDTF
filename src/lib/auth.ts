// The shared password for /report.
//
// Only a SHA-256 digest is committed — never the password itself, because this
// repository may not stay private. SITE_PASSWORD in the environment overrides
// the compiled digest, so the committee can change the password on Vercel
// without a commit.
//
// This module runs in the Edge runtime (middleware), so it uses Web Crypto
// rather than node:crypto.

/** SHA-256 of the password agreed with the committee. */
export const PASSWORD_DIGEST =
  "1743e13b1de3048dfcbae88f1f5cbfd1289943282274eca6fed926b0a401cdc4";

export const SESSION_COOKIE = "pjmdtf_report";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compare two strings without leaking, through timing, how much of the first
 * matched. Length is compared up front, which is fine: both sides here are
 * fixed-length hex digests.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function expectedDigest(): string | Promise<string> {
  const override = process.env.SITE_PASSWORD;
  if (override && override.length > 0) return sha256Hex(override);
  return PASSWORD_DIGEST;
}

/** Is this the report password? */
export async function isPasswordCorrect(candidate: string): Promise<boolean> {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  const [actual, expected] = await Promise.all([
    sha256Hex(candidate),
    Promise.resolve(expectedDigest()),
  ]);
  return constantTimeEqual(actual, expected);
}

/**
 * The session cookie holds the password itself, httpOnly.
 *
 * That looks odd, so here is the reasoning. The only secret this app has is
 * the password; the digest is compiled into the source, which the brief says
 * may become public. Any cookie value the middleware could verify using only
 * public constants could equally be forged from those same public constants.
 * Requiring the cookie to carry a preimage of the digest means forging a
 * session means breaking SHA-256, not reading the repository. The cookie is
 * httpOnly, sameSite=lax and Secure in production, so it is not readable by
 * page scripts and not sent over plain HTTP.
 */
export async function isSessionValid(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return isPasswordCorrect(cookieValue);
}
