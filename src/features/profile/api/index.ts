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
    avatar: user.profileImage || user.avatar || undefined,
    email: user.email || "",
    createdAt: user.createdAt || undefined,
    status: user.status || undefined,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Resize the image to fit 300x300 while maintaining aspect ratio
        const maxW = 300;
        const maxH = 300;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
        } else {
          if (h > maxH) {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        // Convert to low-size jpeg base64 (70% quality)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
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
    { profileImage: base64 },
    { timeout: 60_000 } // Extended timeout for this request
  );

  return { url: res.data.data.profileImage || base64 };
}

export async function deleteAccount(reason: string, password?: string, otp?: string): Promise<any> {
  const timestamp = new Date().toISOString();
  return await api.delete<ApiResponse<any>>("/api/users/me", {
    data: { reason, password, otp },
    headers: {
      "x-request-timestamp": timestamp,
    },
  });
}

export async function restoreAccount(): Promise<any> {
  const timestamp = new Date().toISOString();
  return await api.post<ApiResponse<any>>("/api/users/me/restore", {}, {
    headers: {
      "x-request-timestamp": timestamp,
    },
  });
}

export async function getDeleteStatus(): Promise<any> {
  const res = await api.get<ApiResponse<any>>("/api/users/me/delete-status");
  return res.data.data;
}
