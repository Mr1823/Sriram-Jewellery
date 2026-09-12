import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatusScreen from "../../components/StatusScreen/StatusScreen";
import ContactAddress from "../../components/ContactAddress/ContactAddress";

/**
 * Payment failed — a distinct destination, not a toast.
 *
 * A failed payment on a ₹100,000 order is the highest-anxiety moment in the
 * entire flow, and the single question the customer has is "have I been
 * charged?". The copy answers that before anything else, because the honest
 * answer (an authorised amount can appear on a statement and reverse itself)
 * is not obvious to anyone who has not worked on payments.
 *
 * Navigate here with state: { orderId, reason, amount }.
 */
const PaymentFailed = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId, reason, amount } = state || {};

  return (
    <StatusScreen
      code="—"
      tone="error"
      eyebrow="Payment unsuccessful"
      title="Your payment didn't go through"
      message="Your order has not been placed and your cart is untouched. You can try again with the same or a different payment method."
      detail={
        reason
          ? `Reason given by the payment provider: ${reason}`
          : undefined
      }
      primaryLabel="Try payment again"
      onPrimary={() => navigate("/checkout")}
      secondaryLabel="Back to cart"
      secondaryTo="/shop"
      helmetTitle="Payment Failed"
    >
      <div className="max-w-md mx-auto text-left border border-outline-gold/30 rounded-sm p-5 bg-surface-container-low">
        <p className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-on-surface-variant mb-3">
          If you were charged
        </p>
        <p className="font-body-base text-[14px] text-on-surface-variant leading-relaxed">
          Banks sometimes authorise an amount before a payment fails. Any such
          hold is released automatically, usually within 5–7 working days,
          without you needing to do anything.
        </p>
        <p className="font-body-base text-[14px] text-on-surface-variant leading-relaxed mt-3">
          If the amount has not returned after that, contact us{" "}
          <ContactAddress channel="support" />
          {orderId ? ` quoting reference ${orderId}.` : "."}
        </p>
        {amount && (
          <p className="font-body-base text-[13px] text-on-surface-variant/80 mt-3">
            Attempted amount: ₹{Number(amount).toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </StatusScreen>
  );
};

export default PaymentFailed;
