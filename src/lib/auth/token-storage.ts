/**
 * Token Storage Layer
 * Centralized, SSR-safe access to auth tokens.
 * Keeps localStorage concerns out of the API client and views.
 */

const TOKEN_KEY = "sc_token";
const REFRESH_TOKEN_KEY = "sc_refresh_token";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (!isClient()) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (!isClient()) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (!isClient()) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    if (!isClient()) return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  },
};
