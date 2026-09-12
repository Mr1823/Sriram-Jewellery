import React from "react";
import { useLocation } from "react-router-dom";
import StatusScreen from "../../components/StatusScreen/StatusScreen";
import ContactAddress from "../../components/ContactAddress/ContactAddress";

/**
 * Payment pending — the state that actually causes double-charges.
 *
 * UPI and netbanking can sit unresolved for minutes. Without this page the
 * customer sees a failure, retries, and pays twice. So the primary action here
 * is deliberately NOT "try again" — it is "view your order", and the copy says
 * plainly not to re-attempt.
 *
 * Navigate here with state: { orderId, amount, method }.
 */
const PaymentPending = () => {
  const { state } = useLocation();
  const { orderId, amount, method } = state || {};

  return (
    <StatusScreen
      code="…"
      tone="warn"
      eyebrow="Awaiting confirmation"
      title="Your payment is being confirmed"
      message="Your bank hasn't finished confirming this payment. It usually settles within a few minutes, and we'll update your order the moment it does."
      detail={method ? `Payment method: ${method}` : undefined}
      primaryLabel="View my orders"
      primaryTo="/dashboard/myOrders"
      secondaryLabel="Continue shopping"
      secondaryTo="/shop"
      helmetTitle="Payment Pending"
    >
      <div className="max-w-md mx-auto text-left border border-secondary/40 bg-secondary/5 rounded-sm p-5">
        <p className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-secondary mb-3">
          Please don't pay again
        </p>
        <p className="font-body-base text-[14px] text-on-surface-variant leading-relaxed">
          Starting a second payment while this one is still pending is the most
          common way customers end up charged twice. Wait for this attempt to
          resolve — you'll get an update either way.
        </p>
        {orderId && (
          <p className="font-body-base text-[13px] text-on-surface mt-3">
            Order reference: <span className="font-semibold">{orderId}</span>
          </p>
        )}
        {amount && (
          <p className="font-body-base text-[13px] text-on-surface-variant/80 mt-1">
            Amount: ₹{Number(amount).toLocaleString("en-IN")}
          </p>
        )}
        <p className="font-body-base text-[13px] text-on-surface-variant mt-3">
          Still unresolved after an hour? Contact us{" "}
          <ContactAddress channel="support" />.
        </p>
      </div>
    </StatusScreen>
  );
};

export default PaymentPending;
