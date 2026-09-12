/**
 * Report accounts that share an email address, and anything that would break
 * the uniqueness rule now being enforced on PATCH /api/users/me.
 *
 *   node server/scripts/checkDuplicateEmails.js
 *
 * Read-only. It changes nothing — collapsing two accounts that share an address
 * is a judgement call about which customer's orders belong to whom, not
 * something a script should decide unattended.
 *
 * Three separate problems, which look alike and are not:
 *
 *  1. Exact duplicates — two accounts with the identical string. Should be
 *     impossible: `email` carries a unique+sparse index. If any appear, the
 *     index is missing or was never built, which is itself the finding.
 *
 *  2. Case-only duplicates — "Priya@x.com" and "priya@x.com". The index treats
 *     these as different strings, so MongoDB permits both, but they are one
 *     mailbox. The new handler lowercases before comparing, so it will now
 *     refuse to create more of these — existing pairs need a decision.
 *
 *  3. Sentinel values — email stored as "" or null rather than absent. A sparse
 *     index only skips documents where the field is MISSING; an explicit null
 *     or empty string is an ordinary indexed value, so the second account to
 *     store one collides with a duplicate-key error that reads as nonsense.
 *     The handler now $unsets instead, but older records may already carry one.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Point it at the database you want to audit.");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  console.log(`Connected to "${mongoose.connection.name}"\n`);

  const users = await db
    .collection("users")
    .find({}, { projection: { email: 1, phone: 1, name: 1, role: 1, createdAt: 1 } })
    .toArray();

  const withEmail = users.filter((u) => typeof u.email === "string" && u.email.trim() !== "");

  // ── 1 + 2. Group case-insensitively; exact matches are a subset ──────────
  const byLower = new Map();
  for (const u of withEmail) {
    const key = u.email.trim().toLowerCase();
    if (!byLower.has(key)) byLower.set(key, []);
    byLower.get(key).push(u);
  }

  const collisions = [...byLower.entries()].filter(([, list]) => list.length > 1);

  // ── 3. Sentinel values that defeat the sparse index ──────────────────────
  const sentinels = users.filter(
    (u) => u.email === null || (typeof u.email === "string" && u.email.trim() === "")
  );

  // ── Index health ─────────────────────────────────────────────────────────
  const indexes = await db.collection("users").indexes();
  const emailIndex = indexes.find((i) => i.key && i.key.email === 1);

  console.log("─── Index ───────────────────────────────────────");
  if (!emailIndex) {
    console.log("❌ No index on `email`. Uniqueness is NOT enforced by the database.");
  } else {
    console.log(`   name:   ${emailIndex.name}`);
    console.log(`   unique: ${emailIndex.unique ? "yes" : "NO — duplicates are permitted"}`);
    console.log(`   sparse: ${emailIndex.sparse ? "yes" : "no"}`);
    if (emailIndex.unique && !emailIndex.sparse) {
      console.log("   ⚠️  unique but not sparse: a second account without an email will be refused.");
    }
  }

  console.log("\n─── Accounts ────────────────────────────────────");
  console.log(`   total:          ${users.length}`);
  console.log(`   with an email:  ${withEmail.length}`);
  console.log(`   without one:    ${users.length - withEmail.length}`);

  console.log("\n─── Duplicate addresses ─────────────────────────");
  if (!collisions.length) {
    console.log("   None. No two accounts share an address, in any casing.");
  } else {
    for (const [key, list] of collisions) {
      const exact = new Set(list.map((u) => u.email)).size === 1;
      console.log(`\n   ${key}  — ${list.length} accounts (${exact ? "exact duplicate" : "differs only by case"})`);
      for (const u of list) {
        console.log(
          `     ${u._id}  "${u.email}"  name=${u.name || "—"}  phone=${u.phone || "—"}  ` +
            `role=${u.role}  created=${u.createdAt?.toISOString?.().slice(0, 10) || "—"}`
        );
      }
      if (exact) {
        console.log("     ⚠️  The unique index should have prevented this — verify it exists and is built.");
      }
    }
    console.log(
      "\n   These are not resolved automatically. Decide which account keeps the address,\n" +
        "   clear it from the others, and use fixDuplicatePhones.js if the accounts should merge."
    );
  }

  console.log("\n─── Sentinel values ─────────────────────────────");
  if (!sentinels.length) {
    console.log("   None. Accounts without an email omit the field entirely, which is correct.");
  } else {
    console.log(`   ${sentinels.length} account(s) store null or "" instead of omitting the field:`);
    for (const u of sentinels) {
      console.log(`     ${u._id}  email=${JSON.stringify(u.email)}  phone=${u.phone || "—"}`);
    }
    console.log(
      "\n   Fix by unsetting the field so the sparse index ignores them:\n" +
        '     db.users.updateMany({ $or: [{ email: null }, { email: "" }] }, { $unset: { email: "" } })'
    );
  }

  console.log("");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
