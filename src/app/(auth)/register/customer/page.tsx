"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomerSchema } from "@/lib/validations";
import { AuthLayout } from "@/modules/auth/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/modules/auth/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";

export default function RegisterCustomerPage() {
  const { t } = useTranslation();
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
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
        />

        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
        />

        <Input
          label={t("auth.phone")}
          name="phone"
          placeholder="01xxxxxxxxx"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          disabled={isLoading}
        />

        <PasswordInput
          name="password"
          placeholder={t("auth.password")}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
        />

        <PasswordInput
          name="confirmPassword"
          placeholder={t("auth.confirmPassword")}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
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
