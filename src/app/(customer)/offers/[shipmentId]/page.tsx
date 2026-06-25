"use client";

import { useParams } from "next/navigation";
import { OffersView } from "@/features/offers";

export default function Page() {
  const params = useParams();
  const shipmentId = params.shipmentId as string;

  return <OffersView shipmentId={shipmentId} />;
}
