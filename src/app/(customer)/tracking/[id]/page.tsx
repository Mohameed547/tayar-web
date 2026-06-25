"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { TrackingDetailView } from "@/features/tracking";

export default function LiveMapTrackingPage() {
  const t = useTranslations("customer.tracking");

  return (
    <Suspense fallback={<div className="text-zinc-400 text-xs p-6 text-center">{t("loading")}</div>}>
      <TrackingPageContent />
    </Suspense>
  );
}

function TrackingPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const offerId = searchParams.get("offerId");

  return <TrackingDetailView id={id} offerId={offerId} />;
}
