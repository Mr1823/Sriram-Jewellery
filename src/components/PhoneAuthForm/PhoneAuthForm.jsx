import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import CustomHelmet from "../CustomHelmet/CustomHelmet";
import usePhoneAuthFlow from "../../hooks/usePhoneAuthFlow";

/**
 * Shared split-panel phone + OTP auth screen used by both Login and Register.
 * OTP verification transparently creates the account on first use, so the two
 * pages differ only in step-1 copy and the hero image caption.
 */
const PhoneAuthForm = ({
  helmetTitle,
  heroEyebrow,
  heroHeadline,
  step1Eyebrow,
  step1Title,
  step1Subtitle,
  bottomText,
  bottomLinkTo,
  bottomLinkLabel,
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "session-expired";
  const {
    step,
    phoneNumber,
    authError,
    authLoading,
    register,
    handleSubmit,
    errors,
    onRequestOtp,
    onVerifyOtp,
    onSaveName,
    handleResend,
    goBackToPhone,
  } = usePhoneAuthFlow();

  const stepHeadings = {
    1: { eyebrow: step1Eyebrow, title: step1Title, subtitle: step1Subtitle },
    2: { eyebrow: "Verification", title: "Enter OTP", subtitle: `6-digit code sent to ${phoneNumber}` },
    3: { eyebrow: "Almost There", title: "What's Your Name?", subtitle: "One last step to complete your profile" },
  };
  const heading = stepHeadings[step];

  return (
    <main className="w-full min-h-screen flex font-body-base bg-surface text-on-surface">
      <CustomHelmet title={helmetTitle} />

      {/* Left: Editorial image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPsFrWztD4iPFFVXzCkBPEfyBStgI3PNvxZHYaG2xk_d1nosHS5vyaq9K_uwZdvntEmcJtGPU1Q9IA6MPJTJaKdJ7LkmxSMEQrro0eYkE0QP6KpW6K7_x_F3poPHVg_ZM6jrDlVagpaUF05lVzfr2CGrOvwLpgVfi2zeH7r94YoPzdWIuVUMZ79DrWDv5Z6ZJDZvBFhl3pZh_ucp_8E0fVJ3FrcM7qv-4etClKOvw7wgmsTNnARVdj6aoukBw790ysmQkfJORH8YM')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30"></div>
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <span className="font-label-caps text-label-caps tracking-[0.3em] uppercase opacity-90">
            {heroEyebrow}
          </span>
          <h2 className="font-display-lg text-headline-md leading-tight max-w-md">{heroHeadline}</h2>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-20 md:px-16">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <Link to="/">
              <img
                alt="Sri Ram Jewellery"
                className="h-14 w-auto mx-auto object-contain mb-6"
                src="/logo.png"
              />
            </Link>
            <span className="font-display-lg italic text-[13px] text-secondary block mb-2 opacity-80 lowercase tracking-widest">
              {heading.eyebrow}
            </span>
            <h1 className="font-display-lg text-headline-md text-on-surface mb-2">{heading.title}</h1>
            <p className="font-body-base text-on-surface-variant text-sm">{heading.subtitle}</p>
          </div>

          {/* Why they are here, when they did not choose to be. Shown only on
              step 1 and suppressed once a real error replaces it, so the two
              never stack and contradict each other. */}
          {sessionExpired && !authError && step === 1 && (
            <div className="w-full mb-6 p-4 border border-secondary/40 bg-secondary/10 text-on-surface text-sm flex items-start gap-2 rounded-sm">
              <span className="material-symbols-outlined text-[20px] text-secondary flex-none" aria-hidden="true">
                schedule
              </span>
              <span>
                Your session expired, so we signed you out. Sign in again to pick
                up where you left off — your cart and wishlist are saved.
              </span>
            </div>
          )}

          {authError && (
            <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2 animate-fade-in-up">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{authError}</span>
            </div>
          )}

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <form className="space-y-8" onSubmit={handleSubmit(onRequestOtp)}>
              <div>
                <label
                  className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block"
                  htmlFor="phone-auth-phone"
                >
                  Mobile Number
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-on-surface-variant font-body-base text-base border-b border-outline-variant py-3 select-none">
                    +91
                  </span>
                  <input
                    id="phone-auth-phone"
                    className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base tracking-widest"
                    placeholder="98765 43210"
                    type="tel"
                    maxLength={10}
                    {...register("phone", { required: true, pattern: /^[\+]?[0-9]{10,15}$/ })}
                  />
                </div>
                {errors.phone && (
                  <span className="text-error text-xs mt-1 block font-semibold">
                    Enter a valid 10-digit mobile number
                  </span>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary text-white py-4 md:py-5 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container transition-ui duration-500 transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-primary cursor-pointer"
                >
                  {authLoading ? <span className="loading loading-spinner loading-md"></span> : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form className="space-y-8" onSubmit={handleSubmit(onVerifyOtp)}>
              <div className="text-center">
                <input
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base tracking-[1em] text-center text-xl"
                  placeholder="------"
                  type="text"
                  maxLength={6}
                  {...register("otp", { required: true, minLength: 6, maxLength: 6 })}
                />
                {errors.otp && (
                  <span className="text-error text-xs mt-1 block font-semibold">Enter a valid 6-digit OTP</span>
                )}
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary text-white py-4 md:py-5 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container transition-ui duration-500 transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-primary cursor-pointer"
                >
                  {authLoading ? <span className="loading loading-spinner loading-md"></span> : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={authLoading}
                  className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={goBackToPhone}
                  disabled={authLoading}
                  className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest hover:text-primary transition-colors cursor-pointer"
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Name Collection (first-time users) */}
          {step === 3 && (
            <form className="space-y-8" onSubmit={handleSubmit(onSaveName)}>
              <div>
                <label
                  className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block"
                  htmlFor="phone-auth-name"
                >
                  Your Name
                </label>
                <input
                  id="phone-auth-name"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base"
                  placeholder="Enter your full name"
                  type="text"
                  {...register("name", { required: true, minLength: 2 })}
                />
                {errors.name && (
                  <span className="text-error text-xs mt-1 block font-semibold">
                    Name is required (min 2 characters)
                  </span>
                )}
              </div>

              <div>
                <label
                  className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block"
                  htmlFor="phone-auth-email"
                >
                  Email{" "}
                  <span className="normal-case tracking-normal text-on-surface-variant/60">
                    (optional)
                  </span>
                </label>
                <input
                  id="phone-auth-email"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    // Optional by design — never block someone from finishing
                    // signup over a field they did not have to fill in. Format
                    // is checked only when something was actually typed.
                    validate: (v) =>
                      !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ||
                      "Enter a valid email address",
                  })}
                />
                {errors.email ? (
                  <span className="text-error text-xs mt-1 block font-semibold">
                    {errors.email.message}
                  </span>
                ) : (
                  <span className="text-on-surface-variant/70 text-xs mt-1.5 block">
                    For order updates. You'll still sign in with your phone number.
                  </span>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary text-white py-4 md:py-5 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container transition-ui duration-500 transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-primary cursor-pointer"
                >
                  {authLoading ? <span className="loading loading-spinner loading-md"></span> : "Continue"}
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p className="text-center mt-8 font-body-base text-sm text-on-surface-variant">
              {bottomText}{" "}
              <Link
                to={bottomLinkTo}
                state={{ from: location }}
                className="text-primary font-semibold hover:text-secondary transition-colors inline-flex items-center min-h-11"
              >
                {bottomLinkLabel}
              </Link>
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-12 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <p className="font-label-caps text-[9px] uppercase tracking-widest text-center leading-relaxed">
              Secure authentication by Sri Ram Jewellery
              <br />
              Protecting your personal collection since 1984
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PhoneAuthForm;
