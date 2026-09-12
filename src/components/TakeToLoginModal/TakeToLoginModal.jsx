import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Entry uses a transition, not keyframes. Keyframes restart from zero when
 * re-triggered, so a modal opened twice in quick succession — which this one
 * is, since it reappears on a timer until the visitor signs in — would jump
 * rather than retarget from wherever it currently sits.
 *
 * The `mounted` flag exists because a transition needs two frames: one with
 * the closed values committed, one with the open values to animate toward.
 * requestAnimationFrame gives us that second frame. (`@starting-style` does
 * this natively but is not yet safe across this project's browser targets.)
 */
const TakeToLoginModal = ({ isOpen, onClose, message }) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Escape closes it. A modal that can only be dismissed by pointer is a
  // keyboard trap, and the close affordance already exists visually.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className={`fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-body-base motion-safe-fade transition-opacity duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* transform-origin stays centred: a modal is not anchored to a
          trigger, so it has nowhere else to come from. Scale starts at
          0.96 rather than 0 — nothing in the real world appears from
          nothing. */}
      <div
        onClick={(event) => event.stopPropagation()}
        className={`bg-[#F4EADB] rounded-sm shadow-2xl max-w-[400px] w-full p-10 relative text-center border border-surface-dim origin-center transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-primary/70 hover:text-primary transition-colors material-symbols-outlined text-[20px]"
        >
          close
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Sri Ram Jewellery" className="h-14 w-auto object-contain" />
        </div>

        <div className="space-y-4">
          <p className="font-display-lg text-[16px] text-primary uppercase tracking-[0.1em]">
            A Warm Welcome
          </p>
          <h3 className="text-3xl font-display-lg text-on-surface px-4 leading-tight">
            Sign in for a more personal experience
          </h3>
          <p className="text-on-surface-variant text-[13px] font-body-base pb-4 px-2 leading-relaxed">
            {message || "Save your favorites and track orders effortlessly. Enjoy exclusive access to our collections."}
          </p>

          <div className="flex flex-col gap-5 items-center pt-2">
            <Link
              to="/login"
              state={{ from: location }}
              onClick={onClose}
              className="w-full bg-primary text-white py-3.5 rounded-sm font-button-text uppercase tracking-[0.2em] text-[11px] hover:bg-primary-container hover:shadow-lg active:scale-[0.97] transition-[background-color,box-shadow,transform] duration-200 ease-out block text-center"
            >
              SIGN-IN/REGISTER
            </Link>
            <button
              onClick={onClose}
              className="text-on-surface-variant font-label-caps uppercase tracking-widest text-[10px] hover:text-primary transition-colors pb-0.5 border-b border-transparent hover:border-primary"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeToLoginModal;
