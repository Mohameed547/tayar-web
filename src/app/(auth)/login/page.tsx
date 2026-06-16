"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation/common";
import { AuthLayout } from "@/modules/auth/ui/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/modules/auth/ui/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrors({});
    setIsLoading(true);
    try {
      const validationResult = loginSchema.safeParse({
        email: email.trim(),
        password,
      });
      if (!validationResult.success) {
        const fieldErrors = Object.fromEntries(
          validationResult.error.issues.map((issue) => [
            issue.path[0] as string,
            issue.message,
          ]),
        );
        setErrors(fieldErrors);
        return;
      }
      console.log("Login data:", { email, password, rememberMe });
      // TODO: replace with real API call
      // For now simulate success and redirect to customer dashboard
      router.push(ROUTES.CUSTOMER_DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.login")} subtitle={t("auth.loginSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email ? validation(errors.email as never) : undefined}
          disabled={isLoading}
          required
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("auth.password")}
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password ? validation(errors.password as never) : undefined}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            {t("auth.rememberMe")}
          </label>
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          {t("auth.signIn")}
        </Button>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.noAccount")}
          <div className="mt-2 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 font-semibold text-blue-600">
            <Link href={ROUTES.REGISTER_CUSTOMER} className="hover:underline">
              {t("auth.registerAsCustomer")}
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <Link href={ROUTES.REGISTER_DRIVER} className="hover:underline">
              {t("auth.registerAsDriver")}
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
