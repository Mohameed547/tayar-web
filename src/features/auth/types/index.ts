// Source of truth for: modules/auth/types/auth.ts
export * from "./dtos";
import { z } from "zod";
import { verifyOtpSchema } from "@/lib/validation/common";

export type UserRole = "customer" | "driver" | "office" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  driverStatus?: "available" | "busy" | "offline";
  officeStatus?: "available" | "offline";
  status?: "pending" | "active" | "suspended" | "banned";
  activeOfficeId?: string | null;
  workingMode?: "independent" | "office";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
