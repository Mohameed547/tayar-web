"use client";

import * as React from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validation/common";
import { AuthLayout } from "../components/auth-layout";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";
import { forgotPassword } from "../api";

export default function ForgotPasswordView() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validationResult = forgotPasswordSchema.safeParse({ email });
      if (!validationResult.success) {
        setError(validation(validationResult.error.issues[0].message as never));
        return;
      }

      console.log("Forgot Password payload:", { email });
      await forgotPassword({ email });
      setIsSent(true);
    } catch (err) {
      console.error("Forgot Password API failed, using fallback:", err);
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgotPassword")}
      subtitle={t("auth.forgotPasswordSubtitle")}
    >
      {isSent ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center border border-green-100 dark:border-green-900">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("auth.checkEmail")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.resetLinkSent", { email })}
            </p>
          </div>

          <Button type="button" onClick={() => setIsSent(false)} fullWidth>
            {t("auth.tryAgain")}
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("auth.backTo")}{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:underline"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={isLoading}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            {t("auth.sendResetLink")}
          </Button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("auth.rememberPassword")}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:underline"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
