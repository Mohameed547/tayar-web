"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerDriverSchema } from "@/lib/validation/common";
import { AuthLayout } from "@/modules/auth/ui/auth-layout";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/modules/auth/ui/password-input";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslation } from "@/shared/hooks/use-translation";
import { useTranslations } from "next-intl";

export default function RegisterDriverPage() {
  const { t } = useTranslation();
  const validation = useTranslations("validation");
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    vehicleType: "",
    vehiclePlate: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setIsLoading(true);

    const validationResult = registerDriverSchema.safeParse(formData);

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

    console.log("Register Driver:", formData);
    // TODO: replace with real API call
    router.push(ROUTES.CAPTAIN_DASHBOARD);
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title={t("auth.registerAsDriver")}
      subtitle={t("auth.driverRegisterSubtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Info */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            {t("auth.personalInformation")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            label={t("auth.phone")}
            name="phone"
            placeholder={t("auth.phonePlaceholder")}
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone ? validation(errors.phone as never) : undefined}
            disabled={isLoading}
          />
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Vehicle Info */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-2 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            {t("auth.vehicleInformation")}
          </h3>
        </div>

        <Input
          label={t("auth.driverLicenseNumber")}
          name="licenseNumber"
          placeholder={t("auth.licensePlaceholder")}
          value={formData.licenseNumber}
          onChange={handleChange}
          error={errors.licenseNumber ? validation(errors.licenseNumber as never) : undefined}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t("auth.vehicleType")}
            name="vehicleType"
            placeholder={t("auth.vehicleTypePlaceholder")}
            value={formData.vehicleType}
            onChange={handleChange}
            error={errors.vehicleType ? validation(errors.vehicleType as never) : undefined}
            disabled={isLoading}
          />

          <Input
            label={t("auth.vehiclePlateNumber")}
            name="vehiclePlate"
            placeholder={t("auth.plateNumberPlaceholder")}
            value={formData.vehiclePlate}
            onChange={handleChange}
            error={errors.vehiclePlate ? validation(errors.vehiclePlate as never) : undefined}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" fullWidth loading={isLoading}>
          {t("auth.createDriverAccount")}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.haveAccount")}
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
