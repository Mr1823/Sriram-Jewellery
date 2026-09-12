import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";
import toast from "react-hot-toast";
import CustomHelmet from "../../components/CustomHelmet/CustomHelmet";
import { getErrorMessage } from "../../utils/errorMessage";

const AdminLogin = () => {
  const { signIn, setIsAuthLoading } = useAuthContext();
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  // This form is the admin entry point, so a successful sign-in belongs in the
  // admin panel. The previous logic rewrote any dashboard destination to "/",
  // which dumped admins on the public storefront after logging in.
  const from = location.state?.from?.pathname || "/dashboard/adminDashboard";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoginLoading(true);
    setLoginError(null);
    const { email, password } = data;

    try {
      const result = await signIn(email, password);
      toast.success(`Welcome back, ${result.user?.name || result.user?.email}!`);
      reset();
      setLoginLoading(false);
      navigate(from, { replace: true });
    } catch (error) {
      setLoginError(getErrorMessage(error, "Login failed"));
      setLoginLoading(false);
      setIsAuthLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center font-body-base pb-24 relative bg-surface text-on-surface">
      <CustomHelmet title={"Sign In"} />

      {/* Decorative ambient background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-[0.03] select-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[150px] bg-primary-container"></div>
        <div className="absolute bottom-[0%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-primary"></div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-[440px] px-5 md:px-0 flex flex-col items-center animate-fade-in">
        {/* Logo Section */}
        <div className="mt-16 md:mt-28 mb-12 md:mb-16 text-center">
          <Link to="/">
            <img alt="Sri Ram Jewellery" className="h-16 w-auto mx-auto object-contain" src="/logo.png" />
          </Link>
        </div>

        {/* Heading Section */}
        <div className="w-full text-center mb-12">
          <span className="font-display-lg italic text-[14px] text-secondary block mb-2 opacity-80 lowercase tracking-widest">
            Welcome Back
          </span>
          <h1 className="font-display-lg text-headline-md text-on-surface">
            Sign In
          </h1>
        </div>

        {/* Error notification */}
        {loginError && (
          <div className="w-full mb-6 p-4 bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2 animate-fade-in-up">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{loginError}</span>
          </div>
        )}

        {/* Form Section */}
        <form className="w-full space-y-10" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="input-focus-line">
            <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block" htmlFor="login-email">
              Email Address
            </label>
            <input
              className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base"
              id="login-email"
              placeholder="Enter your email"
              type="email"
              // Without an autoComplete hint the browser cannot tell which saved
              // login belongs to this form and will offer one from an unrelated
              // site, which then fails as "invalid email or password".
              autoComplete="username"
              {...register("email", { required: true })}
            />
            {errors.email && <span className="text-error text-xs mt-1 block font-semibold">Email is required</span>}
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <div className="input-focus-line">
              <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mb-2 block" htmlFor="login-password">
                Password
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 transition-ui duration-300 outline-none focus:border-primary font-body-base tracking-widest"
                id="login-password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                {...register("password", { required: true })}
              />
              {errors.password && <span className="text-error text-xs mt-1 block font-semibold">Password is required</span>}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              className="w-full bg-primary text-white py-4 md:py-5 font-button-text uppercase tracking-[0.2em] text-[12px] hover:bg-primary-container transition-ui duration-500 transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-primary cursor-pointer"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? <span className="loading loading-spinner loading-md"></span> : "Sign In"}
            </button>

            <p className="text-center mt-6">
              <Link
                to="/forgot-password"
                className="font-body-base text-[13px] text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                Forgot your password?
              </Link>
            </p>
          </div>
        </form>

        {/* Admin accounts are granted by an existing admin, not self-registered */}
        <div className="mt-16 text-center">
          <p className="font-body-base text-[13px] text-on-surface-variant/70">
            Admin access is granted by an existing administrator.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
