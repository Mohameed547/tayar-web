"use client";

import * as React from "react";
import Link from "next/link";

import { registerDriverSchema } from "@/lib/validations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function RegisterDriverPage() {
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

    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Join as a driver"
      subtitle="Register to start delivering shipments and earning money"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Info */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
          />

          <Input
            label="Phone Number"
            name="phone"
            placeholder="01xxxxxxxxx"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordInput
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />

          <PasswordInput
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isLoading}
          />
        </div>

        {/* Vehicle Info */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-2 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
            Vehicle & Licensing
          </h3>
        </div>

        <Input
          label="Driver License Number"
          name="licenseNumber"
          placeholder="DL-12345678"
          value={formData.licenseNumber}
          onChange={handleChange}
          error={errors.licenseNumber}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vehicle Type"
            name="vehicleType"
            placeholder="Van / Truck"
            value={formData.vehicleType}
            onChange={handleChange}
            error={errors.vehicleType}
            disabled={isLoading}
          />

          <Input
            label="Vehicle Plate Number"
            name="vehiclePlate"
            placeholder="ABC 1234"
            value={formData.vehiclePlate}
            onChange={handleChange}
            error={errors.vehiclePlate}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" fullWidth loading={isLoading}>
          Create Driver Account
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
