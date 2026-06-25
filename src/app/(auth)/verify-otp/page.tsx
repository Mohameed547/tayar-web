"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { VerifyOtpView } from "@/features/auth";

export default function VerifyOtpPage() {
  const common = useTranslations("common");

  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm">{common("loading")}</div>}>
      <VerifyOtpView />
    </Suspense>
  );
}
