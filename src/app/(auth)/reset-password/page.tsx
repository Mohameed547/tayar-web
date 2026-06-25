"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ResetPasswordView } from "@/features/auth";

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
      <ResetPasswordView />
    </React.Suspense>
  );
}
