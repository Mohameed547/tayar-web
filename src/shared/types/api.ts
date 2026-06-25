/**
 * Shared API Contract Types
 * Every API function in every feature MUST use these shapes.
 * Do not return raw data or custom envelope shapes.
 */

// ── Standard envelope ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  /** Field-level or general validation error messages from the backend */
  errors?: string[];
}

// ── Error shape (for caught AxiosError payloads) ──────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  /** Field-level validation errors, e.g. { email: ["is required"] } */
  fieldErrors?: Record<string, string[]>;
}

// ── Paginated response ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
