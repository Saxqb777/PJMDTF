// Phone normalisation. The number is the member's identity, so the same phone
// typed three different ways has to come to rest as one stored value:
//
//   09892542400  ->  9892542400
//   +91 98925 42400  ->  9892542400
//   0091 9892542400  ->  9892542400
//
// India is the one country with an exact rule: 10 digits starting 6-9.
// Everywhere else we accept 6 to 14 digits, because national formats vary
// and refusing a member's real number is worse than storing an odd one.

export const INDIA_DIAL = "+91";

const MIN_DIGITS = 6;
const MAX_DIGITS = 14;
const INDIA_DIGITS = 10;

export type PhoneResult =
  | { ok: true; national: string }
  | { ok: false; message: string };

function digitsOnly(value: string): string {
  return value.replace(/\D+/g, "");
}

function stripLeadingZeros(value: string): string {
  return value.replace(/^0+/, "");
}

/** Is this a plausible national number for the country with this dial code? */
export function isValidNational(national: string, dial: string): boolean {
  if (dial === INDIA_DIAL) return /^[6-9][0-9]{9}$/.test(national);
  return new RegExp(`^[0-9]{${MIN_DIGITS},${MAX_DIGITS}}$`).test(national);
}

/** A plain sentence saying what is wrong. No error codes, no jargon. */
function explain(attempt: string, dial: string): string {
  const n = attempt.length;
  if (dial === INDIA_DIAL) {
    if (n !== INDIA_DIGITS) {
      return `An Indian mobile number is ${INDIA_DIGITS} digits. You entered ${n}. Please check the number and try again.`;
    }
    return "An Indian mobile number starts with 6, 7, 8 or 9. Please check the number and try again.";
  }
  return `A mobile number should be between ${MIN_DIGITS} and ${MAX_DIGITS} digits. You entered ${n}. Please check the number and try again.`;
}

/**
 * Turn whatever the member typed into the single number we store.
 *
 * `dial` is the dialling code of the country they picked, e.g. "+91". The
 * country select is what decides the code — we never read it from the typed
 * number, so a member cannot accidentally file themselves under Rwanda.
 */
export function normalisePhone(raw: string, dial: string): PhoneResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, message: "Please enter your mobile number." };
  }

  let digits = digitsOnly(trimmed);
  if (digits === "") {
    return {
      ok: false,
      message: "That mobile number has no digits in it. Please enter the number.",
    };
  }

  // 00 is the international access code, so 0091... is the same as +91...
  if (digits.startsWith("00")) digits = digits.slice(2);

  const cc = digitsOnly(dial);
  const stripCountryCode = (value: string): string =>
    cc !== "" && value.length > cc.length && value.startsWith(cc)
      ? value.slice(cc.length)
      : value;

  // Most-stripped form first, and the first one that is actually valid wins.
  // The order matters: a real Indian number can itself begin "91", and trying
  // the stripped form first but only accepting it if it validates means
  // 9192345678 stays whole while 919892542400 loses its country code.
  const candidates = [
    stripLeadingZeros(stripCountryCode(stripLeadingZeros(digits))),
    stripCountryCode(stripLeadingZeros(digits)),
    stripLeadingZeros(digits),
    digits,
  ];

  for (const candidate of candidates) {
    if (isValidNational(candidate, dial)) return { ok: true, national: candidate };
  }

  return { ok: false, message: explain(stripLeadingZeros(digits), dial) };
}
