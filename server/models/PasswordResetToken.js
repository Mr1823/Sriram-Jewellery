import mongoose from "mongoose";

/**
 * A single-use, short-lived password reset token.
 *
 * Follows the RefreshToken pattern deliberately: the raw token goes out in the
 * email and only its SHA-256 hash is stored. Anyone reading the database — a
 * backup, a leaked dump, a support engineer — cannot reset an account with what
 * they find there.
 *
 * `usedAt` matters as much as expiry. Reset links sit in mailboxes forever, and
 * a link that still works after the password has been changed is a standing key
 * to the account. Once redeemed, the token is dead even if it has not expired.
 */
const PasswordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },

  // Recorded for the audit trail: a reset is the one operation that can hand
  // over an administrator account, so it is worth being able to answer "where
  // was that requested from?" after the fact.
  requestedIp: { type: String, default: null },
  requestedUserAgent: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

// TTL index — MongoDB removes the document once it expires. Keeps spent and
// abandoned tokens from accumulating without a cleanup job.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  PasswordResetTokenSchema
);

export default PasswordResetToken;
