"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthLayout } from "../components/auth-layout";
import { verifyOtpSchema } from "@/lib/validation/common";
import { ROUTES } from "@/constants/routes";
import type { VerifyOtpInput } from "../types";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";
import { verifyOtp, resendCustomerOtp } from "../api";
import { tokenStorage } from "@/lib/auth/token-storage";

export default function VerifyOtpView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || searchParams.get("phone") || "";
  const purpose = searchParams.get("purpose") || "register";
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  // Resend state variables
  const [countdown, setCountdown] = React.useState(60);
  const [resending, setResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState<string | null>(null);
  const [resendError, setResendError] = React.useState<string | null>(null);

  // Timer effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendError(null);
    setResendSuccess(null);
    setGeneralError(null);
    try {
      await resendCustomerOtp(phone);
      setResendSuccess(t("auth.otpSent"));
      setCountdown(60);
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      const backendError = err.response?.data?.message || err.message || "Failed to resend OTP.";
      setResendError(backendError);
    } finally {
      setResending(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: phone },
  });

  async function onSubmit(data: VerifyOtpInput) {
    try {
      setGeneralError(null);
      setResendSuccess(null);
      setResendError(null);
      console.log("Verify OTP payload:", { otp: data.otp, phone });
      const res = await verifyOtp({ otp: data.otp, email: phone });
      
      if (purpose === "reset_password") {
        router.push(`${ROUTES.RESET_PASSWORD}?email=${phone}`);
      } else {
        // Clear automatic session to force clean login
        tokenStorage.clearAll();
        router.push(ROUTES.LOGIN);
      }
    } catch (err: any) {
      console.error("Verify OTP API failed:", err);
      const backendError = err.response?.data?.message || err.message || "Invalid OTP code.";
      setGeneralError(backendError);
    }
  }

  return (
    <AuthLayout
      title={t("auth.verifyOtp")}
      subtitle={`${t("auth.otpSentTo")} ${email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {generalError && (
          <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-sans">
            {generalError}
          </div>
        )}
        {resendSuccess && (
          <div className="p-3 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center font-sans">
            {resendSuccess}
          </div>
        )}
        {resendError && (
          <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-sans">
            {resendError}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t("auth.otpCode")}
          </label>

          <input
            {...register("otp")}
            type="text"
            maxLength={6}
            placeholder="123456"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.otp && (
            <p className="text-xs text-red-500">
              {validation(errors.otp.message as never)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t("auth.verifying") : t("auth.verifyOtp")}
        </button>

        {/* Resend OTP Section */}
        <div className="text-center text-xs mt-2">
          {countdown > 0 ? (
            <span className="text-gray-400 dark:text-gray-500">
              {t("auth.resendCode")} ({formatTime(countdown)})
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none disabled:opacity-50"
            >
              {resending ? t("auth.verifying") : t("auth.resendCode")}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
