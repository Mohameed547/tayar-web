// Verification feature – request / response DTOs

export interface SubmitVerificationRequest {
  /** National ID or license number */
  documentNumber: string;
  documentType: "national_id" | "driving_license" | "commercial_license";
  /** Base64-encoded document image or a file reference */
  documentImageUrl?: string;
}
