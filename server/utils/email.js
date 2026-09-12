/**
 * Transactional email. One helper, one place that knows how mail is sent.
 *
 * Everything downstream — password resets, order confirmations, owner alerts —
 * calls `sendEmail()` and never touches the provider SDK. Swapping Resend for
 * SES later is then a change to this file alone.
 *
 * Configuration (all via env, never hardcoded):
 *   RESEND_API_KEY   required to actually send. Unset = dry-run mode.
 *   EMAIL_FROM       e.g. "Sri Ram Jewellery <orders@sriramjewellery.in>"
 *   EMAIL_REPLY_TO   optional
 *   EMAIL_DRY_RUN    "true" forces logging instead of sending, even with a key
 *
 * ── Dry-run, and why it is the default ────────────────────────────────────
 * With no API key the helper logs the message and reports success rather than
 * throwing. Local development and CI must not need a live mail account, and —
 * more importantly — a missing key must never be able to break a checkout.
 * Email is a side effect of placing an order, not part of placing one.
 *
 * ── Failures never throw ──────────────────────────────────────────────────
 * `sendEmail` resolves to a result object and does not reject. Callers decide
 * whether a failure matters. A password reset should tell the user if the mail
 * could not be queued; an order confirmation must never roll back a paid order
 * because a mail server was briefly unreachable.
 */

import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
const DRY_RUN = !apiKey || process.env.EMAIL_DRY_RUN === "true";

// Resend's own default sender works before a domain is verified, which lets the
// reset flow be exercised end to end on day one. It can only deliver to the
// account owner's address, so it is a development aid, not a launch setting.
const DEFAULT_FROM = "Sri Ram Jewellery <onboarding@resend.dev>";

const client = apiKey ? new Resend(apiKey) : null;

if (DRY_RUN) {
  console.warn(
    apiKey
      ? "✉️  EMAIL_DRY_RUN=true — messages will be logged, not sent."
      : "✉️  RESEND_API_KEY is not set — email runs in dry-run mode (logged, not sent)."
  );
} else if (!process.env.EMAIL_FROM) {
  console.warn(
    `✉️  EMAIL_FROM is not set — falling back to ${DEFAULT_FROM}, which can only ` +
      "deliver to the Resend account owner. Set EMAIL_FROM to a verified domain " +
      "before real customers depend on it."
  );
}

/**
 * Strip tags for the plain-text alternative. Spam filters weight multipart
 * messages better, and some clients show text only.
 */
const toPlainText = (html) =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/**
 * Send one transactional email.
 *
 * @param {object}   opts
 * @param {string|string[]} opts.to
 * @param {string}   opts.subject
 * @param {string}   opts.html
 * @param {string}   [opts.text]     defaults to a stripped version of `html`
 * @param {string}   [opts.replyTo]
 * @param {string}   [opts.tag]      short label for the logs, e.g. "password-reset"
 * @returns {Promise<{ ok: boolean, id?: string, dryRun?: boolean, error?: string }>}
 */
export const sendEmail = async ({ to, subject, html, text, replyTo, tag = "email" }) => {
  if (!to || !subject || !html) {
    return { ok: false, error: "sendEmail requires to, subject and html" };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const body = text || toPlainText(html);

  if (DRY_RUN) {
    console.log(
      `\n── ✉️  [dry-run] ${tag} ───────────────────────────────\n` +
        `To:      ${recipients.join(", ")}\n` +
        `From:    ${from}\n` +
        `Subject: ${subject}\n\n` +
        `${body}\n` +
        "──────────────────────────────────────────────────────\n"
    );
    return { ok: true, dryRun: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text: body,
      replyTo: replyTo || process.env.EMAIL_REPLY_TO || undefined,
    });

    if (error) {
      // Resend reports failures in the payload rather than by throwing.
      console.error(`✉️  ${tag} failed:`, error.message || error);
      return { ok: false, error: error.message || String(error) };
    }

    console.log(`✉️  ${tag} sent to ${recipients.join(", ")} (id ${data?.id})`);
    return { ok: true, id: data?.id };
  } catch (err) {
    // Network failure, bad key, provider outage. Never rethrow: the caller
    // decides whether this is fatal to its own operation.
    console.error(`✉️  ${tag} threw:`, err.message);
    return { ok: false, error: err.message };
  }
};

/** True when mail will actually leave the building. */
export const isEmailLive = () => !DRY_RUN;

/**
 * Shared shell so every message looks like it came from the same shop.
 * Inline styles only — email clients discard <style> blocks.
 */
export const renderEmailLayout = ({ heading, intro, bodyHtml = "", footerNote }) => `
<div style="margin:0;padding:0;background:#fff8f2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8b6447;">
      Sri Ram Jewellery
    </p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#1c1714;font-weight:600;">
      ${heading}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5e534a;">
      ${intro}
    </p>
    ${bodyHtml}
    ${
      footerNote
        ? `<p style="margin:32px 0 0;padding-top:20px;border-top:1px solid #e6ddd2;font-size:13px;line-height:1.6;color:#8d8279;">${footerNote}</p>`
        : ""
    }
  </div>
</div>`;

/** Primary button. Table-wrapped because Outlook ignores padding on <a>. */
export const emailButton = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
  <tr>
    <td style="background:#8b6447;border-radius:2px;">
      <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-weight:600;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;

export default sendEmail;
