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

export const shipmentRequestSchema = z
  .object({
    pickupAddress: z.string().min(5, "Pickup address is too short"),
    deliveryAddress: z.string().min(5, "Delivery address is too short"),
    weight: z.number().positive("Weight must be greater than 0"),
    packageType: z.enum(["small_box", "medium_box", "large_box", "pallet"]),
    deliverySpeed: z.enum(["standard", "express", "scheduled"]),
    scheduledDate: z.union([z.string(), z.date()]).optional(),
    notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.deliverySpeed === "scheduled") {
        return !!data.scheduledDate && data.scheduledDate !== "";
      }
      return true;
    },
    {
      message: "Scheduled date is required when delivery speed is Scheduled",
      path: ["scheduledDate"],
    }
  );

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Must be a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[0-2,5]{1}[0-9]{8}$/, "Must be a valid Egyptian phone number (e.g. 01012345678)"),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.enum(["delay", "billing", "damage", "other"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const topUpSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(10, "Minimum top-up amount is 10 EGP"),
  paymentMethod: z.enum(["visa", "mastercard", "vodafone_cash"]),
});

export const withdrawSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(10, "Minimum withdrawal amount is 10 EGP"),
  destination: z.string().min(5, "Destination details are required"),
});


