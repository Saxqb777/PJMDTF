// The facts from the Managing Committee's message. They are quoted on the page,
// used in the report's arithmetic, and must not drift apart. Change them here.

/** The monthly salary obligation, broken down as the committee stated it. */
export const SALARIES = [
  { role: "Imam Saheb", amount: 15000 },
  { role: "Khadim Saheb", amount: 5000 },
  { role: "Bangi Saheb", amount: 5000 },
] as const;

/** ₹25,000 — what the Jamaat must find every month for salaries alone. */
export const MONTHLY_TARGET = SALARIES.reduce((sum, s) => sum + s.amount, 0);

/** The present contribution, which leaves the fund short. */
export const CURRENT_RATE = 250;

/** What collection actually averages at the present rate. */
export const CURRENT_COLLECTION_LOW = 22000;
export const CURRENT_COLLECTION_HIGH = 23000;

/** The ask: this many members at this amount covers the salaries in full. */
export const TARGET_MEMBERS = 50;
export const SUGGESTED_AMOUNT = 500;

/** The six choices, in order. "Other" is handled separately by the form. */
export const AMOUNT_OPTIONS = [250, 350, 500, 750, 1000] as const;

/** The database CHECK constraint on member.monthly_amount. Keep these in step. */
export const MIN_AMOUNT = 50;
export const MAX_AMOUNT = 1000000;

/** Machine-readable, for the countdown. Kept beside the words people read. */
export const CLOSES_ON = "2026-09-30";
export const FORM_CLOSES = "30 September 2026";
export const EFFECTIVE_FROM = "1 October 2026";

/** Suggestions only — the city field stays free text so nobody is locked out. */
export const CITY_SUGGESTIONS = [
  "Mumbai",
  "Pewe",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Muscat",
  "Salalah",
  "Doha",
  "Riyadh",
  "Jeddah",
  "Kuwait City",
  "Manama",
  "Pune",
  "Thane",
  "Navi Mumbai",
  "Ratnagiri",
] as const;

export const ORGANISATION_SHORT = "PJMDTF";
export const SIGNATORY = "Managing Committee, PJMDTF";

/** Indian digit grouping: 25000 reads as 25,000 and 100000 as 1,00,000. */
export function formatRupees(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
