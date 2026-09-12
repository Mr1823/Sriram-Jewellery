import { Product } from "../models/Product.js";

/**
 * Stock reservation for orders.
 *
 * WHEN STOCK IS TAKEN: at order creation, for both payment methods — not at
 * payment confirmation. Two reasons.
 *
 * 1. A COD order has no payment-confirmation step at all; `POST /api/orders` is
 *    the only write in that flow. Reserving at confirmation would leave every
 *    COD order decrementing nothing.
 * 2. Much of this catalogue is one-off pieces. Selling the same piece twice
 *    means telling a customer who has already paid that their piece is gone,
 *    which is far worse than briefly holding a piece for a checkout that is
 *    later abandoned.
 *
 * The cost is real and deliberate: a card order that is created but never paid
 * holds its stock until something releases it. Cancellation and owner rejection
 * both release (see releaseStock). What is NOT yet covered is an order that is
 * simply abandoned at the Razorpay screen — that needs a sweeper for unpaid
 * pending orders older than N minutes, which is not in this change.
 *
 * Note that `stock: 0` blocks ordering. The product page already treats 0 as
 * out of stock, so this only makes the server agree with what the customer is
 * already being shown.
 */

/**
 * Resolve the same way the order routes do — by Mongo _id or by the
 * human-readable productId — so a release can find the product an order item
 * refers to, whichever form was stored on the line.
 */
const productFilter = (productId) => ({
  $or: [
    { _id: /^[0-9a-fA-F]{24}$/.test(String(productId)) ? productId : null },
    { productId },
  ].filter(Boolean),
});

/**
 * Atomically take stock for every line, all or nothing.
 *
 * Each decrement is conditional on there still being enough (`$gte: quantity`),
 * so two orders racing for the last piece cannot both succeed — the second
 * update matches no document. If any line fails, lines already taken are put
 * back before returning, so a partial reservation is never left behind.
 *
 * @param {Array<{productId: string, quantity: number, name?: string}>} items
 * @returns {Promise<{ok: true} | {ok: false, product: string, available: number}>}
 */
export const reserveStock = async (items) => {
  const taken = [];

  for (const item of items) {
    const quantity = item.quantity || 1;

    const updated = await Product.findOneAndUpdate(
      { ...productFilter(item.productId), stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!updated) {
      // Put back whatever this attempt already took, then report which line
      // failed and what is actually left.
      await releaseStock(taken);
      const current = await Product.findOne(productFilter(item.productId))
        .select("name stock")
        .lean();
      return {
        ok: false,
        product: item.name || current?.name || "This piece",
        available: current?.stock ?? 0,
      };
    }

    taken.push({ productId: item.productId, quantity });
  }

  return { ok: true };
};

/**
 * Return stock taken by an order — used when an order is cancelled or rejected,
 * and to roll back a partial reservation.
 */
export const releaseStock = async (items) => {
  for (const item of items) {
    await Product.updateOne(productFilter(item.productId), {
      $inc: { stock: item.quantity || 1 },
    });
  }
};

/**
 * Customer-facing wording for a refused line. Deliberately does not promise a
 * restock date the shop has not committed to.
 */
export const outOfStockMessage = ({ product, available }) =>
  available > 0
    ? `${product} is no longer available in that quantity — only ${available} left. Please adjust your order.`
    : `${product} has just sold out and is no longer available. Please remove it from your order.`;
