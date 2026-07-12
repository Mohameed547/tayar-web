export enum AccountStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED"
}

export interface VerificationStatus {
  isVerified: boolean;
  complianceText: string;
  status?: AccountStatus | string;
  hasSubmitted?: boolean;
}
