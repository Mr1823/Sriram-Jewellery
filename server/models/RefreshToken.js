import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },

  // Rotation bookkeeping. A rotated token is marked spent rather than deleted,
  // because the record is what makes reuse *detectable*: presenting a spent
  // token tells us both that it was replayed and whose family to revoke.
  // Deleting it instead would make a replayed token indistinguishable from a
  // forged one — and a forged hash names no user, so nothing could be revoked.
  // The TTL index below still reaps these once they expire.
  usedAt: { type: Date, default: null },
});

// TTL index — MongoDB automatically removes expired documents
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Every refresh is a lookup by hash; without this it is a collection scan on a
// collection that now retains spent tokens until they expire.
RefreshTokenSchema.index({ tokenHash: 1 });

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
