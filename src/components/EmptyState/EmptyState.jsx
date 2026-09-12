import React from "react";
import { Link } from "react-router-dom";

/**
 * One empty state for the whole app — empty cart, empty wishlist, no orders,
 * no search results, no filter matches.
 *
 * Built from the markup the Shop page already used for "No Results Found", so
 * adopting it changes nothing visually there; it just stops the next empty
 * state from being written from scratch a fourth time.
 *
 * `tone="search"` shifts the copy treatment for no-results cases, where the
 * user's query — not the catalogue — is the thing to react to.
 */
const EmptyState = ({
  icon = "inventory_2",
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
  compact = false,
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center border border-outline-gold/20 bg-surface-container-low rounded-sm ${
      compact ? "py-12 px-6" : "py-20 px-8"
    }`}
  >
    <span
      className="material-symbols-outlined text-[40px] text-outline mb-5"
      aria-hidden="true"
    >
      {icon}
    </span>

    <h2 className="font-display-lg text-headline-sm text-primary mb-2">{title}</h2>

    {message && (
      <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
        {message}
      </p>
    )}

    {(actionLabel || secondaryLabel) && (
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        {actionLabel &&
          (actionTo ? (
            <Link
              to={actionTo}
              className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-button-text uppercase tracking-widest text-xs rounded-sm"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-button-text uppercase tracking-widest text-xs rounded-sm"
            >
              {actionLabel}
            </button>
          ))}

        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="font-body-base text-[14px] text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    )}
  </div>
);

export default EmptyState;
