
import { SESSION_COOKIE } from "@/lib/auth";
import { redirectTo } from "@/lib/redirect";

// Locking the report again matters on a shared phone: the table carries every
// member's mobile number.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = redirectTo("/enter");
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
