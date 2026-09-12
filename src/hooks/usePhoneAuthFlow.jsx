import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthContext from "./useAuthContext";
import { getApiBaseUrl } from "../utils/apiConfig";
import { getErrorMessage } from "../utils/errorMessage";

// Shared phone + OTP state machine used by both the Login and Register pages
// (OTP verification transparently creates the account on first use, so both
// pages ultimately drive the same 3-step flow: phone -> OTP -> name).
const usePhoneAuthFlow = () => {
  const { requestOtp, verifyOtp, setIsAuthLoading, getAccessToken } = useAuthContext();
  const [step, setStep] = useState(1); // 1 = phone entry, 2 = OTP entry, 3 = name collection
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  let from = location.state?.from?.pathname || "/";
  from = from?.includes("dashboard") ? "/" : from;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const normalizePhone = (phone) => {
    const cleaned = phone.replace(/\s+/g, "");
    if (/^\d{10}$/.test(cleaned)) return "+91" + cleaned;
    if (/^91\d{10}$/.test(cleaned)) return "+" + cleaned;
    return cleaned;
  };

  const onRequestOtp = async (data) => {
    setAuthLoading(true);
    setAuthError(null);
    const phone = normalizePhone(data.phone);

    try {
      await requestOtp(phone);
      setPhoneNumber(phone);
      setStep(2);
      reset();
      toast.success("OTP sent to your phone");
    } catch (error) {
      setAuthError(getErrorMessage(error, "Failed to request OTP"));
    } finally {
      setAuthLoading(false);
    }
  };

  const onVerifyOtp = async (data) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await verifyOtp(phoneNumber, data.otp);
      reset();

      if (!result.user?.name) {
        setStep(3);
      } else {
        toast.success(`Welcome, ${result.user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (error) {
      setAuthError(getErrorMessage(error, "Invalid OTP"));
      setIsAuthLoading(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const onSaveName = async (data) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const token = getAccessToken();

      // Only send `email` when one was actually typed. Sending "" would ask the
      // server to clear a field that was never set, and omitting the key keeps
      // this request identical to what it was for customers who skip it.
      const payload = { name: data.name };
      const email = data.email?.trim();
      if (email) payload.email = email;

      await axios.patch(`${getApiBaseUrl()}/users/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Welcome, ${data.name}!`);
      // Reaching step 3 means this account was created moments ago, so this is
      // the one point at which onboarding is warranted. `from` travels with it,
      // so explaining how pricing works never costs the customer the page they
      // originally came for.
      navigate("/welcome", { replace: true, state: { from } });
    } catch (error) {
      // A 409 here means the email is taken — the server rejects the whole
      // request, so the name is not saved either and the customer must change
      // or clear the address before they can finish. Its message says so.
      setAuthError(error?.response?.data?.error || "Failed to save your details");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResend = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await requestOtp(phoneNumber);
      toast.success("OTP resent successfully");
    } catch (error) {
      setAuthError(getErrorMessage(error, "Failed to resend OTP"));
    } finally {
      setAuthLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep(1);
    reset();
    setAuthError(null);
  };

  return {
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
  };
};

export default usePhoneAuthFlow;
