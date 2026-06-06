"use client";

import * as React from "react";
import Link from "next/link";

import { forgotPasswordSchema } from "@/lib/validations";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    const validationResult = forgotPasswordSchema.safeParse({ email });

    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    console.log("Forgot Password:", { email });

    setIsSent(true);
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive a password reset link"
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
              Check your email
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              We sent a reset link to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
          </div>

          <Button type="button" onClick={() => setIsSent(false)} fullWidth>
            Send Again
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Back to{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={isLoading}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Send Reset Link
          </Button>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Remembered your password?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
