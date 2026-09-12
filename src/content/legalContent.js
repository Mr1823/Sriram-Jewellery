/**
 * Content model for the legal pages.
 *
 * Every policy is data, not markup, so all ten render through one reviewed
 * template (`components/LegalPage`). Adding a policy means adding an entry
 * here and a route — not another near-identical component.
 *
 * ── On placeholders ───────────────────────────────────────────────────────
 * A section carrying `needsInput` renders as a visibly marked block instead of
 * prose. Policy language that depends on how the business actually operates —
 * refund windows, the registered address, GSTIN, courier partners — is NOT
 * invented here. Inventing it produces a document that reads as authoritative
 * and is wrong, which is worse than an obvious gap: customers rely on it and
 * it is quoted back to you in disputes.
 *
 * `from: "client"`  → Sri Ram Jewellery must confirm the wording.
 * `from: "legal"`   → needs a lawyer's review before launch.
 * `from: "dev"`     → we can fill it once a technical detail is settled.
 *
 * Statements of fact about how the software works (we never see card numbers,
 * passwords are bcrypt-hashed) ARE written out, because those are verifiable
 * from this codebase rather than being business policy.
 */

/**
 * Contact channels — single source of truth, and deliberately unset.
 *
 * These were previously plausible-looking strings ("support@sriramjewellery.in")
 * rendered as working mailto: links. None of those mailboxes exists. A customer
 * whose payment just failed, or a researcher reporting a vulnerability, would
 * have written to an address that silently goes nowhere — and on a legal page,
 * an unreachable grievance address is worse than an obviously missing one,
 * because it looks like a commitment has been met when it has not.
 *
 * `address: null` renders the same dashed-red "needs content" treatment the
 * legal placeholder sections use. Fill one in and it becomes a live link
 * everywhere at once, with no other change.
 *
 * TODO(client): confirm each mailbox exists and is monitored, then set it here.
 */
export const CONTACT = {
  support: {
    address: null,
    purpose: "Customer support — orders, returns, payment problems",
  },
  privacy: {
    address: null,
    purpose: "Data protection requests (access, correction, deletion)",
  },
  security: {
    address: null,
    purpose: "Security and vulnerability reports",
  },
  grievance: {
    address: null,
    purpose: "Grievance Officer — required to be published by Indian e-commerce rules",
  },
  phone: {
    address: null,
    purpose: "Published support telephone number and staffed hours",
  },
};

/** True when a channel has a confirmed, real address. */
export const hasContact = (key) => Boolean(CONTACT[key]?.address);

const PLACEHOLDER_DATE = null; // rendered as "Not yet published"

export const LEGAL_PAGES = {
  // ─── Privacy ────────────────────────────────────────────────────────────
  "privacy-policy": {
    title: "Privacy Policy",
    eyebrow: "Your data",
    summary:
      "What we collect when you shop with us, why we hold it, and how you ask us to change or delete it.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Who we are",
        needsInput: {
          from: "client",
          what: "Registered business name, registered office address, CIN/registration number, and the name of the person accountable for data requests.",
          why: "Indian consumer rules require a customer to be able to identify and reach the entity holding their data. This cannot be approximated.",
        },
      },
      {
        heading: "What we collect",
        body: [
          "We collect only what an order needs to exist. Specifically:",
        ],
        list: [
          "Your mobile number — this is your account identity, since you sign in with a one-time code rather than a password.",
          "Your name, once you provide it after your first sign-in.",
          "Delivery addresses you save.",
          "Your order, cart and wishlist history.",
          "Messages you send us through the contact or quote-request forms.",
        ],
      },
      {
        heading: "What we never collect",
        body: [
          "We do not receive or store your card number, CVV, UPI PIN or net-banking credentials. Payment details are entered inside Razorpay's own checkout and never reach our servers. See the Security Policy for detail.",
        ],
      },
      {
        heading: "Storage in your browser",
        body: [
          "We set no advertising or analytics cookies, and we run no third-party tracking scripts.",
          "We do use two pieces of browser storage, both strictly functional: your sign-in tokens are kept in local storage so you are not asked to re-authenticate on every page, and a short-lived session identifier is kept in session storage so that one person refreshing a product page is not counted as several viewers. The session identifier describes nothing about you and is discarded when you close the tab.",
          "Razorpay may set its own cookies within its checkout window. That processing is governed by Razorpay's privacy policy, not this one.",
        ],
      },
      {
        heading: "Who else sees your data",
        body: [
          "Razorpay, to take payment. Cloudinary, which stores product imagery only and receives no customer data. Our hosting and database providers, which hold the data at rest on our behalf.",
        ],
        needsInput: {
          from: "client",
          what: "Confirm the courier/logistics partners who receive customer names, addresses and phone numbers for delivery.",
          why: "Anyone who receives customer data has to be disclosed by category, and delivery partners always do.",
        },
      },
      {
        heading: "How long we keep it",
        needsInput: {
          from: "client",
          what: "Retention periods for order records, and how long an inactive account is kept before deletion.",
          why: "Tax and GST rules impose a minimum retention for invoices that differs from what you may want for marketing data. Your accountant should set this figure.",
        },
      },
      {
        heading: "Your rights",
        needsInput: {
          from: "legal",
          what: "The rights wording appropriate to the customers you actually serve — India's DPDP Act 2023 for domestic customers, and GDPR wording additionally if you ship to or market in the EU/UK.",
          why: "The two regimes grant overlapping but differently-worded rights. Which applies depends on where you sell, which is a business decision.",
        },
      },
      {
        heading: "Contacting us about your data",
        body: [
          "Write to our data protection address and we will respond to access, correction and deletion requests.",
        ],
        contact: "privacy",
        needsInput: {
          from: "client",
          what: "Name and contact details of the Grievance Officer, and the response window you commit to.",
          why: "Indian e-commerce rules require a named grievance officer to be published.",
        },
      },
    ],
  },

  // ─── Terms ──────────────────────────────────────────────────────────────
  "terms-of-service": {
    title: "Terms of Service",
    eyebrow: "The agreement",
    summary:
      "The terms you accept when you browse, order or hold an account with Sri Ram Jewellery.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Accepting these terms",
        needsInput: {
          from: "legal",
          what: "Standard acceptance, amendment and severability clauses.",
          why: "Boilerplate, but it is the clause that makes the rest enforceable — it should be your lawyer's wording, not ours.",
        },
      },
      {
        heading: "Your account",
        body: [
          "Your account is tied to your mobile number and is secured by a one-time code sent to it. Anyone able to receive codes on that number can reach your account, so keep control of the number and tell us promptly if you lose it.",
          "You may hold one active session at a time. Signing in on a new device ends the session on the previous one.",
        ],
      },
      {
        heading: "How our prices work",
        body: [
          "Prices for gold and silver pieces are not fixed. They are calculated live from the metal rate we publish, the weight of the piece, its wastage percentage and applicable GST. The price you see can therefore change between visits as the metal rate moves.",
          "The price that binds an order is the one calculated by us at the moment your order is placed. We recalculate every line on the server when you check out; a price displayed earlier in your session is indicative.",
          "Some pieces are marked Price on Request. These are quoted individually and cannot be purchased directly.",
        ],
      },
      {
        heading: "Orders and acceptance",
        needsInput: {
          from: "client",
          what: "At what point a contract is formed — on payment, on dispatch, or on your confirmation — and the grounds on which you may decline an order (stock, pricing error, delivery area).",
          why: "This determines whether you are obliged to honour an order placed at a mispriced figure, which matters a great deal when prices track a live metal rate.",
        },
      },
      {
        heading: "Hallmarking and product accuracy",
        needsInput: {
          from: "client",
          what: "BIS hallmarking commitments, purity guarantees, and the tolerance you accept between the stated and actual weight of a piece.",
          why: "Hallmarking is legally mandated for gold jewellery in India and customers rely on the specific claim you make.",
        },
      },
      {
        heading: "Intellectual property",
        body: [
          "The photography, product descriptions and design of this site belong to Sri Ram Jewellery and may not be reproduced without written permission.",
        ],
      },
      {
        heading: "Liability and governing law",
        needsInput: {
          from: "legal",
          what: "Limitation of liability, indemnity, and the governing law and jurisdiction clause.",
          why: "Never boilerplate this. The cap on liability is a commercial decision with real financial consequence.",
        },
      },
    ],
  },

  // ─── Shipping ───────────────────────────────────────────────────────────
  "shipping-policy": {
    title: "Shipping Policy",
    eyebrow: "Getting it to you",
    summary: "Where we deliver, how long it takes, and how your piece travels insured.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Where we deliver",
        needsInput: {
          from: "client",
          what: "Serviceable pincodes or states, and whether international shipping is offered.",
          why: "Customers need to know before they pay, and the answer drives which tax and customs wording is required.",
        },
      },
      {
        heading: "Dispatch and delivery times",
        needsInput: {
          from: "client",
          what: "Dispatch window for in-stock pieces, lead time for made-to-order pieces, and the delivery estimate per region.",
          why: "Committed delivery timelines are enforceable promises — these must come from whoever runs fulfilment.",
        },
      },
      {
        heading: "Shipping charges",
        body: [
          "The site currently advertises free insured shipping on orders above ₹50,000.",
        ],
        needsInput: {
          from: "client",
          what: "Confirm that threshold is correct and current, and state the charge applied below it.",
          why: "This figure is already shown to customers in the site header, so the policy and the banner must agree.",
        },
      },
      {
        heading: "Insurance and transit risk",
        needsInput: {
          from: "client",
          what: "Who bears the risk in transit, the insurance cover carried, and what a customer must do if a parcel arrives damaged or tampered with (for example, recording an unboxing video).",
          why: "For high-value jewellery this is the single most disputed clause. The claims procedure has to match what your insurer actually requires.",
        },
      },
      {
        heading: "Tracking your order",
        body: [
          "Once dispatched, your order status is visible under My Orders in your account.",
        ],
      },
    ],
  },

  // ─── Returns ────────────────────────────────────────────────────────────
  "return-policy": {
    title: "Return & Exchange Policy",
    eyebrow: "If it isn't right",
    summary: "When a piece can be returned or exchanged, and how a refund reaches you.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Return window",
        needsInput: {
          from: "client",
          what: "The number of days from delivery within which a return may be raised, and the condition the piece must be in (tags intact, unworn, original packaging, certificate included).",
          why: "The core commercial term of the policy. It must be the client's decision.",
        },
      },
      {
        heading: "What cannot be returned",
        needsInput: {
          from: "client",
          what: "Exclusions — typically customised or made-to-order pieces, engraved items, earrings on hygiene grounds, and pieces bought against a live rate.",
          why: "Exclusions are only enforceable if disclosed before purchase.",
        },
      },
      {
        heading: "How refunds are calculated",
        needsInput: {
          from: "client",
          what: "Whether a refund is at the original purchase price or the prevailing metal rate on the return date, and which charges (making, wastage, GST, shipping) are refundable.",
          why: "With rate-linked pricing this is genuinely ambiguous and is the most common source of dispute. It needs an explicit, unambiguous answer.",
        },
      },
      {
        heading: "How to raise a return",
        needsInput: {
          from: "client",
          what: "The actual process — self-serve from the order page, email, or phone — and who arranges pickup.",
          why: "The site does not currently have a self-serve returns flow, so the stated process has to match what your team can really operate.",
        },
      },
      {
        heading: "Refund timelines",
        body: [
          "Refunds are issued to the original payment method through Razorpay.",
        ],
        needsInput: {
          from: "client",
          what: "The number of business days from approval to refund initiation.",
          why: "Razorpay's settlement time is outside your control, but the approval window is yours to commit to.",
        },
      },
    ],
  },

  // ─── Cancellation ───────────────────────────────────────────────────────
  "cancellation-policy": {
    title: "Cancellation Policy",
    eyebrow: "Changing your mind",
    summary: "Cancelling an order before it ships, and what happens to your payment.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Cancelling before dispatch",
        needsInput: {
          from: "client",
          what: "The window in which a customer may cancel without charge, and how they do it.",
          why: "Razorpay requires a published cancellation policy for account activation, and the window is a commercial choice.",
        },
      },
      {
        heading: "Cancelling made-to-order pieces",
        needsInput: {
          from: "client",
          what: "Whether bespoke or made-to-order work can be cancelled once begun, and any deduction applied.",
          why: "Work already carried out on a custom piece cannot be resold, so this usually differs from the standard window.",
        },
      },
      {
        heading: "Cancellation by us",
        needsInput: {
          from: "client",
          what: "Circumstances in which you may cancel an order — stock unavailability, failed verification, an obvious pricing error, an unserviceable address.",
          why: "Pairs with the acceptance clause in the Terms; a live metal rate makes pricing errors a real possibility.",
        },
      },
      {
        heading: "Refunds on cancellation",
        body: [
          "Where payment has been taken, cancellation refunds are returned to the original payment method through Razorpay.",
        ],
        needsInput: {
          from: "client",
          what: "Any charge retained on cancellation, and the timeline.",
          why: "Must be consistent with the Return & Exchange Policy.",
        },
      },
    ],
  },

  // ─── Security ───────────────────────────────────────────────────────────
  "security-policy": {
    title: "Security Policy",
    eyebrow: "How we protect you",
    summary: "How payment data is handled, and what we do and do not store.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "We never see your card details",
        body: [
          "Card numbers, CVV codes, UPI PINs and net-banking credentials are entered inside Razorpay's own hosted checkout. They are never transmitted to our servers and are never stored by us, in any form.",
          "Razorpay is a PCI-DSS compliant payment provider. Card data handling is theirs, under that certification. We receive only a payment identifier and a status, which is what lets us mark your order paid.",
        ],
      },
      {
        heading: "Every order is priced on the server",
        body: [
          "Prices are never trusted from the browser. When you place an order or begin payment, every line is recalculated on our servers from the live metal rate, the piece's weight and applicable GST. A tampered price in the browser cannot change what you are charged.",
        ],
      },
      {
        heading: "How your account is protected",
        body: [
          "Customers sign in with a one-time code, so there is no customer password for an attacker to steal or reuse.",
          "Administrator passwords are stored only as bcrypt hashes at cost factor 12 — never in plain text, and not reversible.",
          "One-time codes are themselves stored hashed, expire after five minutes, and are rate-limited per phone number.",
          "Sessions use short-lived access tokens with longer-lived refresh tokens, and refresh tokens are stored hashed rather than in the clear.",
        ],
      },
      {
        heading: "Data in transit",
        body: [
          "The site is served over HTTPS, and all traffic between your browser, our API and our payment provider is encrypted in transit.",
        ],
      },
      {
        heading: "Reporting a problem",
        body: [
          "If you believe you have found a security weakness, please see our Responsible Disclosure page rather than reporting it publicly.",
        ],
      },
    ],
  },

  // ─── Responsible disclosure ─────────────────────────────────────────────
  "responsible-disclosure": {
    title: "Responsible Disclosure",
    eyebrow: "Security researchers",
    summary: "How to report a vulnerability to us, and what you can expect in return.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Reporting a vulnerability",
        body: [
          "Email our security address with enough detail to reproduce the issue — the affected URL or endpoint, the steps taken, and what you were able to achieve.",
          "Please report privately and give us a reasonable opportunity to fix the issue before disclosing it publicly.",
        ],
        contact: "security",
      },
      {
        heading: "What we ask",
        list: [
          "Do not access, modify or delete data belonging to anyone other than yourself.",
          "Do not run automated scanning that degrades the service for customers.",
          "Do not attempt social engineering against our staff or customers.",
          "Use a test account of your own where a proof of concept requires one.",
        ],
      },
      {
        heading: "What we commit to",
        needsInput: {
          from: "client",
          what: "The acknowledgement window (for example, 3 business days), the remediation target, and whether a reward or public credit is offered.",
          why: "A disclosure policy that promises a response time nobody is staffed to meet is worse than one that promises nothing.",
        },
      },
      {
        heading: "Out of scope",
        body: [
          "Findings in Razorpay's or Cloudinary's own systems should be reported to those providers directly under their disclosure programmes.",
        ],
      },
    ],
  },

  // ─── Disclaimer ─────────────────────────────────────────────────────────
  disclaimer: {
    title: "Disclaimer",
    eyebrow: "Limits of what's shown",
    summary: "How to read our prices, imagery and product information.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Metal rates are indicative",
        body: [
          "The gold and silver rates shown on this site are the rates we use to price our own pieces. They are published for transparency, not as financial advice or as a market quotation, and should not be relied on for any purpose other than understanding our pricing.",
          "Rates are updated periodically. Where a rate has become stale, we decline to price against it rather than quote you a confident but outdated figure.",
        ],
      },
      {
        heading: "Product imagery",
        body: [
          "Photographs are taken under studio lighting and magnification. Colour, finish and apparent scale vary between screens, and handmade pieces vary slightly from one to the next.",
        ],
        needsInput: {
          from: "client",
          what: "The tolerance you accept between a photograph and the delivered piece, and whether stones shown are representative or exact.",
          why: "Defines what counts as 'not as described' for a return.",
        },
      },
      {
        heading: "Weights and specifications",
        needsInput: {
          from: "client",
          what: "The tolerance on stated gross and net weights.",
          why: "Since price is computed from weight, the stated tolerance directly affects what a customer pays.",
        },
      },
      {
        heading: "External links",
        body: [
          "Where we link to another site, we are not responsible for its content or its handling of your data.",
        ],
      },
    ],
  },

  // ─── Accessibility ──────────────────────────────────────────────────────
  "accessibility-statement": {
    title: "Accessibility Statement",
    eyebrow: "Everyone welcome",
    summary: "What we have done to make this site usable, and how to tell us where it falls short.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "What we have implemented",
        body: ["The following are in place across the site today:"],
        list: [
          "Motion is reduced automatically when your device requests it, with movement removed and comprehension-aiding fades kept.",
          "Hover effects are gated to devices with a real pointer, so a tap on a touchscreen does not leave elements stuck in a hovered state.",
          "Interactive controls have a visible keyboard focus state.",
          "Form fields carry associated labels, and dialogs can be dismissed with the Escape key.",
          "Text scales with your browser's font-size setting, and input fields avoid the forced zoom iOS applies to small text.",
        ],
      },
      {
        heading: "Conformance target",
        needsInput: {
          from: "dev",
          what: "The standard we formally claim — most commonly WCAG 2.2 Level AA — and the date of the audit backing the claim.",
          why: "A conformance claim should follow an actual audit. We can run one; it should not be asserted before it has been done.",
        },
      },
      {
        heading: "Known limitations",
        needsInput: {
          from: "dev",
          what: "The list of known gaps, to be completed after the audit above.",
          why: "An honest statement of what does not yet work is more useful to a customer than a blanket claim of compliance.",
        },
      },
      {
        heading: "Tell us about a barrier",
        body: [
          "If any part of this site prevents you from doing what you came to do, write to us and tell us what happened. We will help you complete your purchase directly and fix the underlying problem.",
        ],
        contact: "support",
      },
    ],
  },

  // ─── Acceptable use ─────────────────────────────────────────────────────
  "acceptable-use": {
    title: "Acceptable Use Policy",
    eyebrow: "Using the site",
    summary: "What we ask you not to do with this site and its content.",
    lastUpdated: PLACEHOLDER_DATE,
    sections: [
      {
        heading: "Please do not",
        list: [
          "Attempt to access another customer's account, order history or saved addresses.",
          "Probe, scan or test the security of the site except as permitted under our Responsible Disclosure policy.",
          "Scrape product data, imagery or metal rates in bulk, or place automated orders.",
          "Submit false orders, fraudulent payment instruments, or another person's details without their permission.",
          "Post abusive, misleading or unlawful content in reviews or messages.",
          "Reproduce our photography or product descriptions commercially without written permission.",
        ],
      },
      {
        heading: "Reviews",
        needsInput: {
          from: "client",
          what: "Whether reviews are moderated before publication, what gets removed, and whether a verified-purchase requirement applies.",
          why: "India's rules on online reviews require published criteria for moderation and rejection.",
        },
      },
      {
        heading: "If you breach this policy",
        needsInput: {
          from: "legal",
          what: "Consequences — suspension, cancellation of pending orders, referral to authorities.",
          why: "Enforcement action needs to be disclosed in advance to be defensible.",
        },
      },
    ],
  },
};

/** Ordered for the footer and the index page. */
export const LEGAL_NAV = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-of-service", label: "Terms of Service" },
  { slug: "shipping-policy", label: "Shipping Policy" },
  { slug: "return-policy", label: "Returns & Exchange" },
  { slug: "cancellation-policy", label: "Cancellation Policy" },
  { slug: "security-policy", label: "Security" },
  { slug: "responsible-disclosure", label: "Responsible Disclosure" },
  { slug: "disclaimer", label: "Disclaimer" },
  { slug: "accessibility-statement", label: "Accessibility" },
  { slug: "acceptable-use", label: "Acceptable Use" },
];
