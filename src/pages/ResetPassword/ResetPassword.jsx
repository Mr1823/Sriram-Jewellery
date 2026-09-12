import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CustomHelmet from "../../components/CustomHelmet/CustomHelmet";
import StatusScreen from "../../components/StatusScreen/StatusScreen";
import { getApiBaseUrl } from "../../utils/apiConfig";

/**
 * Administrator password reset — the page the emailed link opens.
 *
 * Customers never reach this: they sign in with a one-time code and have no
 * password. The route is public because the whole point is being reachable
 * while locked out.
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // No token means the link was truncated by a mail client, or someone found
  // the route by hand. Say which, rather than showing a form that cannot work.
  if (!token) {
    return (
      <StatusScreen
        code="—"
        tone="error"
        eyebrow="Reset link"
        title="This reset link is incomplete"
        message="The link is missing its token. Email clients sometimes split long links across lines — copy the whole thing, or request a new one."
        primaryLabel="Request a new link"
        primaryTo="/forgot-password"
        secondaryLabel="Back to sign-in"
        secondaryTo="/admin-login"
        helmetTitle="Reset Password"
      />
    );
  }

  if (done) {
    return (
      <StatusScreen
        code="✓"
        eyebrow="All set"
        title="Your password has been changed"
        message="Every existing session for this account was signed out. Sign in again with your new password."
        primaryLabel="Sign in"
        primaryTo="/admin-login"
        helmetTitle="Password Changed"
      />
    );
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${getApiBaseUrl()}/auth/password/reset`, {
        token,
        password: data.password,
      });
      toast.success("Password changed");
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Could not reset your password. Request a new link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-surface text-on-surface flex items-center justify-center px-margin-mobile py-16">
      <CustomHelmet title="Reset Password" />

      <div className="w-full max-w-[420px]">
        <header className="text-center mb-10">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary mb-3">
            Administrator
          </p>
          <h1 className="font-display-lg text-[32px] text-on-surface mb-3">
            Choose a new password
          </h1>
          <p className="font-body-base text-[14px] text-on-surface-variant">
            This link can be used once, and expires 45 minutes after it was sent.
          </p>
        </header>

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
              htmlFor="new-password"
              className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-on-surface-variant block mb-2"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              autoFocus
              className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface outline-none focus:border-primary font-body-base"
              {...register("password", {
                required: "Enter a new password",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
            />
            {errors.password && (
              <p className="text-error text-[13px] mt-2">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-on-surface-variant block mb-2"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface outline-none focus:border-primary font-body-base"
              {...register("confirm", {
                required: "Confirm your new password",
                validate: (v) => v === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirm && (
              <p className="text-error text-[13px] mt-2">{errors.confirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-4 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out disabled:opacity-60 rounded-sm"
          >
            {submitting ? "Saving…" : "Set new password"}
          </button>
        </form>

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

export default ResetPassword;
