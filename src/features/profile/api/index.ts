import api from "@/lib/api/client";
import type { CustomerProfile, ProviderProfile } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type {
  UpdateCustomerProfileRequest,
  UpdateProviderProfileRequest,
} from "../types/dtos";

function mapCustomerProfile(user: any): CustomerProfile {
  return {
    id: user._id || user.id,
    name: user.fullName || user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    avatar: user.profileImage || user.avatar || undefined,
  };
}

function mapProviderProfile(user: any): ProviderProfile {
  return {
    name: user.fullName || user.name || "",
    phone: user.phone || "",
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// ── Profile API ───────────────────────────────────────────────────────────────

export async function getCustomerProfile(): Promise<CustomerProfile> {
  const res = await api.get<ApiResponse<any>>("/api/profile");
  return mapCustomerProfile(res.data.data);
}

export async function updateCustomerProfile(
  data: UpdateCustomerProfileRequest,
): Promise<CustomerProfile> {
  const res = await api.patch<ApiResponse<any>>("/api/profile", {
    fullName: data.name,
    phone: data.phone,
  });
  return mapCustomerProfile(res.data.data);
}

export async function getProviderProfile(): Promise<ProviderProfile> {
  const res = await api.get<ApiResponse<any>>("/api/profile");
  return mapProviderProfile(res.data.data);
}

export async function updateProviderProfile(
  data: UpdateProviderProfileRequest,
): Promise<ProviderProfile> {
  const res = await api.patch<ApiResponse<any>>("/api/profile", {
    fullName: data.name,
    phone: data.phone,
  });
  return mapProviderProfile(res.data.data);
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  let base64 = "";
  try {
    base64 = await fileToBase64(file);
  } catch {
    base64 = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
  }

  const res = await api.patch<ApiResponse<any>>(
    "/api/profile/avatar",
    { profileImage: base64 }
  );

  return { url: res.data.data.profileImage || base64 };
}
