import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Read the connection string from the environment — never inline it. This file
// is committed, and a credential in a committed file is a published credential:
// the previous hardcoded URI here was scraped and flagged by GitHub secret
// scanning as a public leak across five repositories.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env before running this script.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const products = await db.collection("products").find({ name: /Classic Necklaces/i }).toArray();
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
run().catch(console.error);
