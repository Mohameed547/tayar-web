// Auth feature – request / response DTOs
// These types are intentionally separate from the User/AuthResponse domain
// types so that request payloads are never coupled to UI or response shapes.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterCustomerRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterDriverRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  licenseNumber: string;
  vehicleType: string;
  plateNumber: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}
