import axios from "axios";
import { tokenStorage } from "@/lib/auth/token-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: global error handling ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired → clear storage.
      // Navigation is handled by the Router (not window.location) at the
      // component / middleware level to avoid hard reloads inside Next.js.
      tokenStorage.clearAll();
    }

    return Promise.reject(error);
  },
);

export default api;
