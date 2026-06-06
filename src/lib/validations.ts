import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerCustomerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(11, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerDriverSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(11, "Invalid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    licenseNumber: z.string().min(5, "Invalid license number"),
    vehicleType: z.string().min(2, "Vehicle type is required"),
    vehiclePlate: z.string().min(3, "Invalid plate number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  email: z.string().email(),
});
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const landingSearchSchema = z.object({
  from: z.string().min(2, "Pickup location is required"),
  to: z.string().min(2, "Destination is required"),
});

export const shipmentRequestSchema = z.object({
  pickupAddress: z.string().min(5, "Pickup address is too short"),
  deliveryAddress: z.string().min(5, "Delivery address is too short"),
  weight: z.number().positive("Weight must be greater than 0"),
  packageType: z.enum(["small_box", "medium_box", "large_box", "pallet"]),
  deliverySpeed: z.enum(["standard", "express", "scheduled"]),
  scheduledDate: z.union([z.string(), z.date()]).optional(),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});
