import { z } from "zod";
import { verifyOtpSchema } from "@/lib/validation/common";

export type UserRole = "customer" | "driver" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
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

