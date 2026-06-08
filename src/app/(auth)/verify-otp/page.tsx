"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";

import { AuthLayout } from "@/modules/auth/auth-layout";
import { verifyOtpSchema } from "@/lib/validations";
import { ROUTES } from "@/constants/routes";
import type { VerifyOtpInput } from "@/shared/types/auth";
import { useTranslation } from "@/shared/hooks/use-translation";

function VerifyOtpForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email },
  });

  async function onSubmit(data: VerifyOtpInput) {
    console.log(data);
    // TODO: connect to API
    router.push(`${ROUTES.RESET_PASSWORD}?email=${email}`);
  }

  return (
    <AuthLayout
      title={t("auth.verifyOtp")}
      subtitle={`${t("auth.otpSentTo")} ${email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <p className="text-xs text-red-500">{errors.otp.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t("auth.verifying") : t("auth.verifyOtp")}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}