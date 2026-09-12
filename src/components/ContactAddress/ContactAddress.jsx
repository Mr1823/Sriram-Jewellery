import React from "react";
import { CONTACT } from "../../content/legalContent";

/**
 * Renders a contact address — or, when it hasn't been confirmed yet, an
 * obviously unfinished placeholder instead of a dead mailto: link.
 *
 * The failure this prevents: a plausible-looking address that goes nowhere.
 * Someone reporting a vulnerability, or chasing a payment that failed, writes
 * to it and hears nothing back, and neither they nor we ever learn the message
 * was lost. On a legal page it is worse still — a published grievance address
 * that doesn't exist reads as a compliance obligation satisfied.
 *
 * Matches the dashed-red treatment used by unfinished legal sections, so the
 * whole site has one visual language for "this still needs real content".
 *
 * @param {string} channel  key in CONTACT — support | privacy | security | grievance | phone
 * @param {"inline"|"block"} variant  inline sits in a sentence; block stands alone
 */
const ContactAddress = ({ channel, variant = "inline", className = "" }) => {
  const entry = CONTACT[channel];

  if (!entry) return null;

  // Confirmed address — render the real thing.
  if (entry.address) {
    const isPhone = channel === "phone";
    return (
      <a
        href={isPhone ? `tel:${entry.address.replace(/\s/g, "")}` : `mailto:${entry.address}`}
        className={`text-primary underline underline-offset-4 break-all ${className}`}
      >
        {entry.address}
      </a>
    );
  }

  // Not yet confirmed — say so, and never render something clickable.
  if (variant === "block") {
    return (
      <div className={`border border-dashed border-error/50 bg-error/5 rounded-sm p-4 ${className}`}>
        <p className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-error mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            edit_note
          </span>
          Needs client confirmation
        </p>
        <p className="font-body-base text-[14px] text-on-surface">{entry.purpose}</p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-dashed border-error/50 bg-error/5 text-error rounded-sm px-2 py-0.5 font-label-caps text-[11px] uppercase tracking-[0.1em] align-baseline ${className}`}
      title={entry.purpose}
    >
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
        edit_note
      </span>
      Address not set
    </span>
  );
};

export default ContactAddress;
