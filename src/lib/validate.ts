// Turning what was typed into what gets stored. Every rejection is a plain
// sentence that says what to fix.

import { countryByIso } from "@/lib/countries";
import { normalisePhone } from "@/lib/phone";
import { AMOUNT_OPTIONS, MAX_AMOUNT, MIN_AMOUNT, formatRupees } from "@/lib/constants";
import { errors, type Lang } from "@/lib/strings";
import type { MemberInput } from "@/lib/db";

export const NAME_MIN = 3;
export const NAME_MAX = 80;
export const CITY_MAX = 80;
export const ADDRESS_MAX = 400;
export const EMAIL_MAX = 200;

/** What the member typed, kept so the form can be handed back to them filled in. */
export type Draft = {
  fullName: string;
  country: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  amount: string;
  otherAmount: string;
};

export type Validated =
  | { ok: true; member: MemberInput }
  | { ok: false; message: string; draft: Draft };

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

/** Collapse runs of whitespace and trim the ends. */
function squash(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Tidy a typed place name so "mumbai", "MUMBAI" and " Mumbai " all become the
 * same city. Words are capitalised individually, including after a hyphen or
 * an apostrophe, so "ras al-khaimah" reads as "Ras Al-Khaimah".
 */
export function tidyPlaceName(value: string): string {
  return squash(value)
    .toLocaleLowerCase("en")
    .replace(/(^|[\s\-'’])([a-zà-ɏ])/g, (_m, lead: string, letter: string) =>
      lead + letter.toLocaleUpperCase("en"),
    );
}

/** Keep line breaks in an address, but tidy the spacing around them. */
function tidyAddress(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n")
    .trim();
}

export function draftFrom(form: FormData): Draft {
  return {
    fullName: text(form, "fullName"),
    country: text(form, "country"),
    phone: text(form, "phone"),
    email: text(form, "email"),
    address: text(form, "address"),
    city: text(form, "city"),
    amount: text(form, "amount"),
    otherAmount: text(form, "otherAmount"),
  };
}

export function validate(form: FormData, lang: Lang = "en"): Validated {
  const e = errors(lang);
  const draft = draftFrom(form);
  const reject = (message: string): Validated => ({ ok: false, message, draft });

  const fullName = squash(draft.fullName);
  if (fullName === "") return reject(e.nameRequired);
  if (fullName.length < NAME_MIN) {
    return reject(e.nameShort(NAME_MIN));
  }
  if (fullName.length > NAME_MAX) {
    return reject(e.nameLong(NAME_MAX));
  }

  const country = countryByIso(draft.country);
  if (!country) return reject(e.countryRequired);

  const phone = normalisePhone(draft.phone, country.dial, lang);
  if (!phone.ok) return reject(phone.message);

  const email = squash(draft.email);
  if (email !== "") {
    if (email.length > EMAIL_MAX) {
      return reject(e.emailLong);
    }
    if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) {
      return reject(e.emailInvalid);
    }
  }

  const address = tidyAddress(draft.address);
  if (address === "") return reject(e.addressRequired);
  if (address.length > ADDRESS_MAX) {
    return reject(e.addressLong(ADDRESS_MAX));
  }

  const city = tidyPlaceName(draft.city);
  if (city === "") return reject(e.cityRequired);
  if (city.length > CITY_MAX) {
    return reject(e.cityLong(CITY_MAX));
  }

  const amount = resolveAmount(draft, lang);
  if (!amount.ok) return reject(amount.message);

  return {
    ok: true,
    member: {
      fullName,
      phoneCc: country.dial,
      phone: phone.national,
      email,
      address,
      city,
      country: country.name,
      monthlyAmount: amount.value,
    },
  };
}

function resolveAmount(
  draft: Draft,
  lang: Lang,
): { ok: true; value: number } | { ok: false; message: string } {
  const e = errors(lang);
  if (draft.amount === "") {
    return { ok: false, message: e.amountRequired };
  }

  if (draft.amount !== "other") {
    const chosen = Number(draft.amount);
    if (!AMOUNT_OPTIONS.includes(chosen as (typeof AMOUNT_OPTIONS)[number])) {
      return { ok: false, message: e.amountNotListed };
    }
    return { ok: true, value: chosen };
  }

  const typed = draft.otherAmount.replace(/[\s,₹]/g, "").trim();
  if (typed === "") {
    return { ok: false, message: e.otherRequired };
  }
  if (!/^[0-9]+$/.test(typed)) {
    return { ok: false, message: e.otherDigitsOnly };
  }
  const value = Number(typed);
  if (!Number.isSafeInteger(value)) {
    return { ok: false, message: e.otherDigitsOnly };
  }
  if (value < MIN_AMOUNT) {
    return { ok: false, message: e.otherTooSmall(formatRupees(MIN_AMOUNT)) };
  }
  if (value > MAX_AMOUNT) {
    return { ok: false, message: e.otherTooLarge(formatRupees(MAX_AMOUNT)) };
  }
  return { ok: true, value };
}
