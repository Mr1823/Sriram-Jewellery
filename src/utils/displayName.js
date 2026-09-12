/**
 * How to label a customer who may not have a name.
 *
 * The OTP flow creates the account at the moment a code is requested, and the
 * name is only collected in step 3 — which anyone can abandon. So a perfectly
 * ordinary customer, one who may have placed orders, can have
 * `name: null, email: null` and only a phone number. Admin tables rendered
 * `{user.name}` directly and showed a blank cell for them, which reads as
 * corrupt data rather than an incomplete signup.
 *
 * Order of preference: the name they gave → their email → their phone number,
 * which always exists for an OTP customer and is how staff actually identify
 * someone on the phone.
 */

/** Mask the middle of a number for list views: +91 93637•••06 */
export const maskPhone = (phone) => {
  if (!phone) return "";
  const national = String(phone).replace(/^\+91/, "");
  if (national.length !== 10) return String(phone);
  return `+91 ${national.slice(0, 5)}•••${national.slice(8)}`;
};

/**
 * @param {object} user
 * @param {{ mask?: boolean }} [opts] mask the phone when shown in a list
 * @returns {string} never empty
 */
export const userDisplayName = (user, { mask = false } = {}) => {
  if (!user) return "Unknown customer";

  const name = typeof user.name === "string" ? user.name.trim() : "";
  if (name) return name;

  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (email) return email;

  const phone = user.phone ? String(user.phone).trim() : "";
  if (phone) return mask ? maskPhone(phone) : phone;

  return "Unnamed customer";
};

/**
 * True when the customer verified an OTP but never completed step 3. Useful for
 * flagging the row rather than silently papering over it — these accounts are
 * real, and staff may want to chase them.
 */
export const isIncompleteProfile = (user) => {
  // Trimmed for the same reason userDisplayName trims: "   " is not a name.
  // Without this, a whitespace-only value fell through to the email for display
  // but still counted as "has a name", so the row showed an address with no
  // sign that the profile was unfinished.
  const name = typeof user?.name === "string" ? user.name.trim() : "";
  return Boolean(user?.phone) && !name;
};

/** Initial for an avatar fallback. Never returns an empty string. */
export const userInitial = (user) => {
  const label = userDisplayName(user);
  const first = label.replace(/^\+/, "").trim().charAt(0);
  return (first || "?").toUpperCase();
};

export default userDisplayName;
