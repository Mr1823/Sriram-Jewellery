import React from "react";

/**
 * Loading placeholders, shaped like the content they stand in for.
 *
 * Two rules they follow:
 *
 * 1. They use the heritage surface tokens, not `bg-gray-200`. A cool grey
 *    block on a warm cream page reads as a broken image, not as loading.
 * 2. Each variant matches the real element's dimensions — the product skeleton
 *    uses the same 4/5 aspect ratio as ProductCard — so content does not jump
 *    when it arrives.
 *
 * `animate-pulse` is a Tailwind built-in and is already suppressed by the
 * global prefers-reduced-motion rule in index.css.
 */

const base = "bg-surface-dim/60 animate-pulse rounded-sm";

export const SkeletonLine = ({ className = "w-full" }) => (
  <div className={`${base} h-4 ${className}`} />
);

/** One product tile — mirrors ProductCard's layout exactly. */
export const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-5" aria-hidden="true">
    <div className={`${base} aspect-[4/5] w-full`} />
    <div className="flex flex-col items-center gap-2">
      <SkeletonLine className="w-20" />
      <SkeletonLine className="w-40 h-5" />
      <SkeletonLine className="w-24" />
    </div>
  </div>
);

/** A grid of product tiles. Count should match the real page size. */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div
    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
    role="status"
    aria-label="Loading pieces"
  >
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Stacked rows — orders, addresses, messages. */
export const ListSkeleton = ({ rows = 4 }) => (
  <div className="flex flex-col gap-4" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="border border-outline-gold/20 rounded-sm p-5 flex items-center gap-5"
      >
        <div className={`${base} h-16 w-16 flex-none`} />
        <div className="flex-1 flex flex-col gap-2.5">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
        <SkeletonLine className="w-20 flex-none" />
      </div>
    ))}
  </div>
);

/** Cart and wishlist drawer rows. */
export const CartLineSkeleton = ({ rows = 3 }) => (
  <div className="flex flex-col gap-5" role="status" aria-label="Loading items">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-start">
        <div className={`${base} h-20 w-16 flex-none`} />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-1/3 h-3" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
