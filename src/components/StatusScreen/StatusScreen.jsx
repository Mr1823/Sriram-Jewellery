import React from "react";
import { Link } from "react-router-dom";
import CustomHelmet from "../CustomHelmet/CustomHelmet";

/**
 * Full-page outcome screens: 403, payment failed, payment pending, maintenance.
 *
 * Deliberately shares the visual language of ErrorPage (oversized muted
 * numeral, serif headline, single clear action) so an unexpected state never
 * looks like it came from a different product.
 *
 * Every caller must pass a primary action. A dead-end page that tells someone
 * their payment failed and offers them nothing to do next is the actual
 * failure — the status is only half the message.
 */

const TONE = {
  neutral: "text-primary/20",
  error: "text-error/25",
  warn: "text-secondary/25",
};

const StatusScreen = ({
  code,
  eyebrow,
  title,
  message,
  detail,
  tone = "neutral",
  primaryLabel,
  primaryTo,
  onPrimary,
  secondaryLabel,
  secondaryTo,
  helmetTitle,
  children,
}) => (
  <main className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile md:px-margin-desktop py-20">
    <CustomHelmet title={helmetTitle || title} />

    <div className="max-w-2xl w-full text-center">
      {code && (
        <div className="mb-8">
          <p
            className={`font-display-lg text-[96px] md:text-[150px] leading-none select-none ${
              TONE[tone] || TONE.neutral
            }`}
            aria-hidden="true"
          >
            {code}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          {eyebrow && (
            <p className="font-label-caps text-label-caps text-secondary tracking-[0.2em] uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            {title}
          </h1>
        </div>

        {message && (
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
            {message}
          </p>
        )}

        {detail && (
          <p className="font-body-base text-[13px] text-on-surface-variant/80 max-w-md mx-auto">
            {detail}
          </p>
        )}

        {children}

        <div className="pt-6 flex flex-wrap items-center justify-center gap-5">
          {primaryLabel &&
            (primaryTo ? (
              <Link
                to={primaryTo}
                className="px-8 py-3.5 bg-primary text-white hover:bg-primary-container transition-colors font-button-text uppercase tracking-widest text-xs rounded-sm"
              >
                {primaryLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onPrimary}
                className="px-8 py-3.5 bg-primary text-white hover:bg-primary-container transition-colors font-button-text uppercase tracking-widest text-xs rounded-sm"
              >
                {primaryLabel}
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
      </div>
    </div>
  </main>
);

export default StatusScreen;
