export const ROUTES = {
  // Landing
  HOME: "/",

  // Auth
  LOGIN: "/login",
  REGISTER_CUSTOMER: "/register/customer",
  REGISTER_DRIVER: "/register/driver",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",

  // Customer
  CUSTOMER_DASHBOARD: "/dashboard",
  SHIPMENTS: "/shipments",
  SHIPMENTS_NEW: "/shipments/new",
  TRACKING: "/tracking",
  WALLET: "/wallet",
  NOTIFICATIONS: "/notifications",
  REVIEWS: "/reviews",
  SUPPORT: "/support",
  PROFILE: "/profile",

  // Captain / Office Dashboard
  CAPTAIN_DASHBOARD: "/captain-dashboard",
} as const;
