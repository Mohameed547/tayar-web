"use client";

import * as React from "react";
import Link from "next/link";

import { loginSchema } from "@/lib/validations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
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

      // TODO: API CALL HERE
      // مثال:
      // await loginApi({ email, password, rememberMe });

      console.log("Login data:", {
        email,
        password,
        rememberMe,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isLoading}
          required
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>

            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>

          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
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
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Remember me
          </label>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          <div className="mt-2 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 font-semibold text-blue-600">
            <Link href={ROUTES.REGISTER_CUSTOMER} className="hover:underline">
              Register as Customer
            </Link>

            <span className="hidden sm:inline text-gray-300">•</span>

            <Link href={ROUTES.REGISTER_DRIVER} className="hover:underline">
              Register as Driver
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
