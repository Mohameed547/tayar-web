// Placeholder — will be populated when admin user management is integrated

export type UserStatus = "active" | "suspended" | "pending";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "driver" | "admin";
  status: UserStatus;
  createdAt: string;
}
