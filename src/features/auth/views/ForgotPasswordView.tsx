"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from "@/lib/validation/common";
import { AuthLayout } from "../components/auth-layout";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { PasswordInput } from "../components/password-input";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { forgotPassword, verifyResetOtp, resetPassword } from "../api";

export default function ForgotPasswordView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [resetToken, setResetToken] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const validationResult = forgotPasswordSchema.safeParse({ email });
      if (!validationResult.success) {
        setError(validation(validationResult.error.issues[0].message as never));
        setIsLoading(false);
        return;
      }

      await forgotPassword({ email });
      setSuccessMessage(isAr ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "Verification code sent to your email");
      setStep(2);
    } catch (err: any) {
      console.error("Forgot Password failed:", err);
      const msg = err.response?.data?.message || err.message || (isAr ? "فشل إرسال رمز التحقق" : "Failed to send verification code");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const validationResult = verifyOtpSchema.safeParse({ otp, email });
      if (!validationResult.success) {
        setError(validation(validationResult.error.issues[0].message as never));
        setIsLoading(false);
        return;
      }

      const res = await verifyResetOtp({ email, otp });
      setResetToken(res.token);
      setSuccessMessage(isAr ? "تم التحقق من الرمز بنجاح" : "Code verified successfully");
      setStep(3);
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      const msg = err.response?.data?.message || err.message || (isAr ? "رمز التحقق غير صحيح أو انتهت صلاحيته" : "Invalid or expired verification code");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validationResult = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        setError(validation(validationResult.error.issues[0].message as never));
        setIsLoading(false);
        return;
      }

      await resetPassword({ token: resetToken, password, passwordConfirmation: confirmPassword });
      setSuccessMessage(isAr ? "تم تغيير كلمة المرور بنجاح، جاري تحويلك لصفحة الدخول..." : "Password changed successfully! Redirecting...");
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    } catch (err: any) {
      console.error("Reset Password failed:", err);
      const msg = err.response?.data?.message || err.message || (isAr ? "فشل إعادة تعيين كلمة المرور" : "Failed to reset password");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return t("auth.forgotPassword");
    if (step === 2) return t("auth.verifyOtp");
    return t("auth.resetPassword");
  };

  const getStepSubtitle = () => {
    if (step === 1) return t("auth.forgotPasswordSubtitle");
    if (step === 2) return isAr ? "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك" : "Enter the 6-digit code sent to your email";
    return t("auth.resetPasswordSubtitle");
  };

  return (
    <AuthLayout title={getStepTitle()} subtitle={getStepSubtitle()}>
      {error && (
        <div className="p-3 mb-4 text-sm font-medium text-red-600 dark:text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 mb-4 text-sm font-medium text-green-600 dark:text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          {successMessage}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <Input
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button type="submit" fullWidth loading={isLoading}>
            {isAr ? "إرسال رمز التحقق" : "Send Verification Code"}
          </Button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("auth.rememberPassword")}{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:underline"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Input
            label={isAr ? "رمز التحقق" : "Verification Code"}
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button type="submit" fullWidth loading={isLoading}>
            {t("auth.verifyOtp")}
          </Button>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-semibold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
              disabled={isLoading}
            >
              {isAr ? "تعديل البريد الإلكتروني" : "Edit Email"}
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              className="font-semibold text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
              disabled={isLoading}
            >
              {isAr ? "إعادة إرسال الرمز" : "Resend Code"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <PasswordInput
            label={t("auth.password")}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <PasswordInput
            label={t("auth.confirmPassword")}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button type="submit" fullWidth loading={isLoading}>
            {t("auth.resetPassword")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
