import api from "@/lib/api/client";
import type { VerificationStatus } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type { SubmitVerificationRequest } from "../types/dtos";

function mapVerificationStatus(v: any): VerificationStatus {
  const status = v.status || "pending";
  return {
    isVerified: status === "approved",
    complianceText: status === "approved"
      ? "Your verification documents have been fully approved. You can start receiving shipments."
      : status === "rejected"
      ? `Verification rejected: ${v.reviewNote || "Please resubmit documents"}`
      : "Your verification request is pending review.",
  };
}

// ── Verification API ──────────────────────────────────────────────────────────

export async function getVerificationStatus(): Promise<VerificationStatus> {
  const res = await api.get<ApiResponse<any>>(
    "/api/verification/captain/verification/status",
  );
  return mapVerificationStatus(res.data.data);
}

export async function submitVerification(
  data: SubmitVerificationRequest,
): Promise<VerificationStatus> {
  const mappedType = data.documentType === "commercial_license" ? "commercial_register" : data.documentType;
  
  const res = await api.post<ApiResponse<any>>(
    "/api/verification/captain/verification/upload",
    {
      documentType: mappedType,
      documentUrl: data.documentImageUrl || "",
    },
  );
  return mapVerificationStatus(res.data.data);
}

export async function resubmitVerification(
  data: SubmitVerificationRequest,
): Promise<VerificationStatus> {
  return submitVerification(data);
}
