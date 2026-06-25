import api from "@/lib/api/client";
import type { AdminUser } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type { UpdateUserStatusRequest, UpdateUserRoleRequest } from "../types/dtos";

// ── Users Admin API ───────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminUser[]> {
  const res = await api.get<ApiResponse<{ users: any[] }>>("/api/admin/users");
  const users = res.data.data.users || [];
  return users.map((u: any) => ({
    id: u.id || u._id,
    name: u.name || u.fullName || "",
    email: u.email || "",
    role: "customer", // Backend Admin user service focuses on customers
    status: u.status || "pending",
    createdAt: u.joined || new Date().toISOString(),
  }));
}

export async function getUserById(id: string): Promise<AdminUser> {
  const res = await api.get<ApiResponse<any>>(`/api/admin/users/${id}`);
  const u = res.data.data;
  return {
    id: u.id || u._id,
    name: u.name || u.fullName || "",
    email: u.email || "",
    role: "customer",
    status: u.status || "pending",
    createdAt: u.joined || new Date().toISOString(),
  };
}

export async function updateUserStatus(
  id: string,
  data: UpdateUserStatusRequest,
): Promise<AdminUser> {
  const res = await api.patch<ApiResponse<any>>(
    `/api/admin/users/${id}/status`,
    { status: data.status },
  );
  const u = res.data.data;
  return {
    id: u.id || u._id || id,
    name: u.name || u.fullName || "",
    email: u.email || "",
    role: "customer",
    status: u.status || data.status,
    createdAt: new Date().toISOString(),
  };
}

export async function updateUserRole(
  id: string,
  data: UpdateUserRoleRequest,
): Promise<AdminUser> {
  // Not supported on backend; mock success
  console.log("Updating user role (local mock):", id, data);
  const user = await getUserById(id);
  return {
    ...user,
    role: data.role,
  };
}

export async function deleteUser(id: string): Promise<void> {
  // Not supported on backend; mock success
  console.log("Deleting user (local mock):", id);
}
