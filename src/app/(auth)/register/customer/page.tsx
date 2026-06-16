"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomerSchema } from "@/lib/validation/common";
import { AuthLayout } from "@/modules/auth/ui/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/modules/auth/ui/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";

export default function RegisterCustomerPage() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const validationResult = registerCustomerSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) fieldErrors[field as string] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    console.log("Register Customer:", formData);
    // TODO: replace with real API call
    router.push(ROUTES.CUSTOMER_DASHBOARD);
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title={t("auth.registerAsCustomer")}
      subtitle={t("auth.customerRegisterSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("auth.name")}
          name="name"
          placeholder={t("auth.fullNamePlaceholder")}
          value={formData.name}
          onChange={handleChange}
          error={errors.name ? validation(errors.name as never) : undefined}
          disabled={isLoading}
        />

        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={formData.email}
          onChange={handleChange}
          error={errors.email ? validation(errors.email as never) : undefined}
          disabled={isLoading}
        />

        <Input
          label={t("auth.phone")}
          name="phone"
          placeholder={t("auth.phonePlaceholder")}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone ? validation(errors.phone as never) : undefined}
          disabled={isLoading}
        />

        <PasswordInput
          name="password"
          placeholder={t("auth.password")}
          value={formData.password}
          onChange={handleChange}
          error={errors.password ? validation(errors.password as never) : undefined}
          disabled={isLoading}
        />

        <PasswordInput
          name="confirmPassword"
          placeholder={t("auth.confirmPassword")}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword ? validation(errors.confirmPassword as never) : undefined}
          disabled={isLoading}
        />

        <Button type="submit" fullWidth loading={isLoading}>
          {t("auth.register")}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.haveAccount")}{" "}
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
