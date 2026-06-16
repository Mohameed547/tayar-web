"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { resetPasswordSchema } from "@/lib/validation/common";
import { AuthLayout } from "@/modules/auth/ui/auth-layout";
import { PasswordInput } from "@/modules/auth/ui/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setIsLoading(true);

    if (!token) {
      setErrors({
        token: "resetTokenInvalid",
      });
      setIsLoading(false);
      return;
    }

    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};

      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field) {
          fieldErrors[field as string] = issue.message;
        }
      });

      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    console.log("Reset Password:", {
      token,
      password,
      confirmPassword,
    });

    setIsLoading(false);
  };

  return (
    <AuthLayout
      title={t("auth.resetPassword")}
      subtitle={t("auth.resetPasswordSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.token && (
          <p className="text-sm text-red-500">
            {validation(errors.token as never)}
          </p>
        )}

        <PasswordInput
          label={t("auth.password")}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password ? validation(errors.password as never) : undefined}
          disabled={isLoading}
        />

        <PasswordInput
          label={t("auth.confirmPassword")}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword ? validation(errors.confirmPassword as never) : undefined}
          disabled={isLoading}
        />

        <Button type="submit" fullWidth loading={isLoading}>
          {t("auth.resetPassword")}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.backTo")}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-blue-600 hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  const common = useTranslations("common");

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-500">{common("loading")}</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
