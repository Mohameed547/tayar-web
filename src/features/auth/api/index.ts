import api from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { AuthResponse, AuthTokens, User } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type {
  LoginRequest,
  RegisterCustomerRequest,
  RegisterDriverRequest,
  VerifyOtpRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/dtos";

// ── Helper to map backend user object to frontend User shape ───────────────────
function mapUser(rawUser: any): User {
  return {
    id: rawUser._id || rawUser.id,
    name: rawUser.fullName || rawUser.name || "",
    email: rawUser.email,
    phone: rawUser.phone,
    role: rawUser.role,
    avatar: rawUser.profileImage || rawUser.avatar || undefined,
    isVerified: rawUser.isPhoneVerified || rawUser.isVerified || false,
    createdAt: rawUser.createdAt || new Date().toISOString(),
    driverStatus: rawUser.driverStatus,
    officeStatus: rawUser.officeStatus,
    status: rawUser.status,
    activeOfficeId: rawUser.activeOfficeId || null,
    workingMode: rawUser.workingMode || "independent",
  };
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens }>>(
    "/api/auth/login",
    {
      emailOrPhone: data.email,
      password: data.password,
    },
  );
  
  const { user, tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);

  return {
    user: mapUser(user),
    tokens,
  };
}

export async function registerCustomer(
  data: RegisterCustomerRequest,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens }>>(
    "/api/auth/register",
    {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "customer",
    },
  );

  const { user, tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);

  return {
    user: mapUser(user),
    tokens,
  };
}

export async function registerDriver(
  data: RegisterDriverRequest,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens }>>(
    "/api/auth/register",
    {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "driver",
      vehicleType: data.vehicleType,
      plateNumber: data.plateNumber,
      licenseNumber: data.licenseNumber,
    },
  );

  const { user, tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);

  return {
    user: mapUser(user),
    tokens,
  };
}

export async function registerOffice(
  data: any,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens }>>(
    "/api/auth/register",
    {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "office",
      businessName: data.businessName,
      licenseNumber: data.licenseNumber,
      officeAddress: data.officeAddress,
    },
  );

  const { user, tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);

  return {
    user: mapUser(user),
    tokens,
  };
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens }>>(
    "/api/auth/otp/verify",
    {
      phone: data.email, // backend validation schema expects phone in place of email
      otp: data.otp,
    },
  );
  
  const { user, tokens } = res.data.data;
  if (tokens) {
    tokenStorage.setToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
  }

  return {
    user: mapUser(user),
    tokens: tokens || { accessToken: "", refreshToken: "" },
  };
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<AuthTokens> {
  const res = await api.post<ApiResponse<{ tokens: AuthTokens }>>(
    "/api/auth/refresh-token",
    {
      refreshToken: data.token,
    },
  );
  const { tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  if (tokens.refreshToken) {
    tokenStorage.setRefreshToken(tokens.refreshToken);
  }
  return tokens;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<ApiResponse<{ user: any }>>("/api/auth/me");
  return mapUser(res.data.data.user);
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<void> {
  await api.post<ApiResponse<void>>("/api/auth/forgot-password", {
    email: data.email,
  });
}

export async function verifyResetOtp(data: {
  email: string;
  otp: string;
}): Promise<{ token: string }> {
  const res = await api.post<ApiResponse<{ token: string }>>(
    "/api/auth/verify-reset-otp",
    {
      email: data.email,
      otp: data.otp,
    },
  );
  return res.data.data;
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await api.post<ApiResponse<void>>("/api/auth/reset-password", {
    token: data.token,
    newPassword: data.password,
  });
}

export async function logout(): Promise<void> {
  const refreshTokenVal = tokenStorage.getRefreshToken() ?? "";
  try {
    await api.post<ApiResponse<void>>("/api/auth/logout", {
      refreshToken: refreshTokenVal,
    });
  } finally {
    tokenStorage.clearAll();
  }
}

// ─── Captain Onboarding API ───────────────────────────────────────────────────

export async function verifyCaptainOtp(phone: string, otp: string) {
  const res = await api.post<ApiResponse<{ accountStatus: string }>>("/api/auth/captain/verify-otp", { phone, otp });
  return res.data.data;
}

export async function setCaptainPassword(phone: string, password: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<{ user: any; tokens: AuthTokens; accountStatus: string }>>(
    "/api/auth/captain/set-password",
    { phone, password }
  );
  const { user, tokens } = res.data.data;
  tokenStorage.setToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);
  return { user: mapUser(user), tokens };
}

export async function resendCaptainOtp(phone: string) {
  const res = await api.post<ApiResponse<{ resendsLeft: number }>>("/api/auth/captain/resend-otp", { phone });
  return res.data.data;
}

export async function getCaptainOnboardingStatus(phone: string) {
  const res = await api.post<ApiResponse<{ accountStatus: string; isPhoneVerified: boolean; email: string }>>(
    "/api/auth/captain/onboarding-status",
    { phone }
  );
  return res.data.data;
}
