// Shared Reusable Types for DeliveryHub Frontend

export type ThemeMode = "light" | "dark";

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}
