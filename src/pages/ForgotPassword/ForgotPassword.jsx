import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import CustomHelmet from "../../components/CustomHelmet/CustomHelmet";
import { getApiBaseUrl } from "../../utils/apiConfig";

/**
 * Request an administrator password reset link.
 *
 * The confirmation below is deliberately identical whether or not the address
 * exists — matching the API, which will not reveal which emails are
 * administrator accounts. So the copy says "if that email belongs to an
 * administrator account", never "we've sent you an email".
 */
const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${getApiBaseUrl()}/auth/password/forgot`, { email: data.email });
      setSent(true);
    } catch (err) {
      // A 502 here means the token was created but the mail could not be sent —
      // worth surfacing, because otherwise the admin waits for nothing.
      setError(
        err.response?.data?.error ||
          "Could not process that request. Please try again shortly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-surface text-on-surface flex items-center justify-center px-margin-mobile py-16">
      <CustomHelmet title="Forgot Password" />

      <div className="w-full max-w-[420px]">
        <header className="text-center mb-10">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary mb-3">
            Administrator
          </p>
          <h1 className="font-display-lg text-[32px] text-on-surface mb-3">
            Reset your password
          </h1>
          <p className="font-body-base text-[14px] text-on-surface-variant">
            Enter the email address for your administrator account and we'll send
            you a link.
          </p>
        </header>

        {sent ? (
          <div className="border border-outline-gold/40 bg-surface-container-low rounded-sm p-6 text-center">
            <span
              className="material-symbols-outlined text-[28px] text-primary mb-3 block"
              aria-hidden="true"
            >
              mark_email_read
            </span>
            <h2 className="font-display-lg text-headline-sm text-on-surface mb-2">
              Check your inbox
            </h2>
            <p className="font-body-base text-[14px] text-on-surface-variant leading-relaxed">
              If that email belongs to an administrator account, a reset link is on
              its way. It expires in 45 minutes and can be used once.
            </p>
            <p className="font-body-base text-[13px] text-on-surface-variant/80 mt-4">
              Nothing arriving? Check spam, then contact whoever administers the
              site — there is a command-line recovery path.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold flex items-start gap-2 rounded-sm">
                <span className="material-symbols-outlined text-[20px] flex-none" aria-hidden="true">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <div>
                <label
                  htmlFor="reset-email"
                  className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-on-surface-variant block mb-2"
                >
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface outline-none focus:border-primary font-body-base"
                  {...register("email", { required: "Enter your email address" })}
                />
                {errors.email && (
                  <p className="text-error text-[13px] mt-2">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-4 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out disabled:opacity-60 rounded-sm"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="text-center mt-8">
          <Link
            to="/admin-login"
            className="font-body-base text-[13px] text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
          >
            Back to sign-in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPassword;
