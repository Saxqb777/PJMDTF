// How long is left to fill the form in, counted in Mumbai's day, not the
// server's. A member in Dubai and a member in Pewe should see the same number.

import { CLOSES_ON } from "@/lib/constants";

const MUMBAI = "Asia/Kolkata";

/** Today's date in Mumbai, as YYYY-MM-DD. */
function mumbaiToday(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MUMBAI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export type Deadline =
  | { state: "open"; days: number }
  | { state: "last-day" }
  | { state: "closed" };

/** Whole days from today in Mumbai until the form closes. */
export function deadline(now: Date = new Date()): Deadline {
  const today = Date.parse(mumbaiToday(now) + "T00:00:00Z");
  const closes = Date.parse(CLOSES_ON + "T00:00:00Z");
  const days = Math.round((closes - today) / 86_400_000);

  if (days > 0) return { state: "open", days };
  if (days === 0) return { state: "last-day" };
  return { state: "closed" };
}

/** The last week is when a reminder actually changes what someone does. */
export function isUrgent(d: Deadline): boolean {
  return d.state === "last-day" || (d.state === "open" && d.days <= 7);
}
