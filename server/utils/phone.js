/**
 * Canonical phone handling. The server's answer, not the client's.
 *
 * Normalisation used to live only in `usePhoneAuthFlow.jsx`, which meant the
 * canonical form of a customer's identity was decided in the browser. Anything
 * that reached the API by another path — curl, a second client, an older cached
 * bundle, a direct POST — was written to the database verbatim. That is how
 * "9363750806" and "+919363750806" became two accounts for one person, each
 * with its own cart, wishlist and order history.
 *
 * The phone number is the primary key of a customer's identity here (there is
 * no password and often no email), so its canonical form has to be decided in
 * exactly one place, and that place must be the server.
 *
 * Canonical form: +91XXXXXXXXXX
 */

// Indian mobile numbers are ten digits beginning 6, 7, 8 or 9. Landlines and
// service codes are deliberately not accepted: an OTP cannot be delivered to
// them, so accepting one creates an account that can never be signed into.
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export const CANONICAL_PHONE = /^\+91[6-9]\d{9}$/;

/**
 * Reduce any of the shapes customers and clients actually send to +91XXXXXXXXXX.
 *
 * Accepts: 9363750806 · +91 9363750806 · 91-9363750806 · 09363750806
 *          and the same with spaces, dashes, brackets or a leading 0.
 *
 * @returns {{ ok: true, phone: string } | { ok: false, reason: string }}
 */
export const normalizeIndianPhone = (input) => {
  if (input === undefined || input === null) {
    return { ok: false, reason: "Phone number is required" };
  }

  // Strip everything a human or a form might add: spaces, dashes, dots,
  // brackets. Keep a leading + so we can tell +91... from a bare 91...
  let s = String(input).trim().replace(/[\s\-().]/g, "");

  if (!s) return { ok: false, reason: "Phone number is required" };

  // Reject letters outright rather than silently stripping them — "+91 98O..."
  // with a letter O is a typo we should surface, not quietly mangle.
  if (/[^\d+]/.test(s)) {
    return { ok: false, reason: "Phone number may contain digits only" };
  }

  // Normalise the country prefix to a bare national number.
  if (s.startsWith("+91")) s = s.slice(3);
  else if (s.startsWith("0091")) s = s.slice(4);
  else if (s.startsWith("91") && s.length === 12) s = s.slice(2);
  else if (s.startsWith("0") && s.length === 11) s = s.slice(1);

  // A stray + anywhere else means a non-Indian or malformed number.
  if (s.includes("+")) {
    return { ok: false, reason: "Only Indian (+91) mobile numbers are supported" };
  }

  if (!INDIAN_MOBILE.test(s)) {
    return {
      ok: false,
      reason: "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9",
    };
  }

  return { ok: true, phone: `+91${s}` };
};

/**
 * Every stored spelling that could refer to the same real number.
 *
 * Used by the duplicate-account tooling to find records written before
 * normalisation moved server-side. Not used on the sign-in path — that resolves
 * to exactly one canonical value.
 */
export const phoneVariants = (canonical) => {
  const national = canonical.replace(/^\+91/, "");
  return [
    canonical,          // +919363750806
    national,           // 9363750806
    `91${national}`,    // 919363750806
    `0${national}`,     // 09363750806
    `+91 ${national}`,  // spaced, as some clients sent it
  ];
};

export default normalizeIndianPhone;
