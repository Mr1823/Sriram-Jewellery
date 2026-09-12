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
  
  // Get the specific product
  const targetProduct = await db.collection("products").findOne({ name: "Royal Diamond Rings Set" });
  
  // Get all products
  const allProducts = await db.collection("products").find({}).toArray();
  
  // Group by image URLs to find duplicates
  const imageCounts = {};
  allProducts.forEach(p => {
    const mainImg = p.img || "";
    if (mainImg) {
      if (!imageCounts[mainImg]) imageCounts[mainImg] = [];
      imageCounts[mainImg].push({ id: p._id.toString(), name: p.name, category: p.category });
    }
  });
  
  const duplicatedImages = Object.entries(imageCounts)
    .filter(([url, prods]) => prods.length > 1)
    .map(([url, prods]) => ({ url, products: prods }));

  console.log("=== TARGET PRODUCT ===");
  console.log(JSON.stringify(targetProduct, null, 2));
  
  console.log("\n=== DUPLICATED IMAGES ===");
  console.log(JSON.stringify(duplicatedImages, null, 2));

  process.exit(0);
}
run().catch(console.error);
