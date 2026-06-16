import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(6, "passwordMin"),
});

export const registerCustomerSchema = z
  .object({
    name: z.string().min(3, "nameMin"),
    email: z.string().email("invalidEmail"),
    phone: z.string().min(11, "invalidPhone"),
    password: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export const registerDriverSchema = z
  .object({
    name: z.string().min(3, "nameMin"),
    email: z.string().email("invalidEmail"),
    phone: z.string().min(11, "invalidPhone"),
    password: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
    licenseNumber: z.string().min(5, "invalidLicense"),
    vehicleType: z.string().min(2, "vehicleRequired"),
    vehiclePlate: z.string().min(3, "invalidPlate"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("invalidEmail"),
});
export const verifyOtpSchema = z.object({
  otp: z.string().length(6, "otpLength"),
  email: z.string().email(),
});
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export const landingSearchSchema = z.object({
  from: z.string().min(2, "pickupRequired"),
  to: z.string().min(2, "destinationRequired"),
});

export const shipmentRequestSchema = z
  .object({
    pickupAddress: z.string().min(5, "pickupShort"),
    deliveryAddress: z.string().min(5, "deliveryShort"),
    weight: z.number().positive("weightPositive"),
    packageType: z.enum(["small_box", "medium_box", "large_box", "pallet"]),
    deliverySpeed: z.enum(["standard", "express", "scheduled"]),
    scheduledDate: z.union([z.string(), z.date()]).optional(),
    notes: z.string().max(300, "notesMax").optional(),
  })
  .refine(
    (data) => {
      if (data.deliverySpeed === "scheduled") {
        return !!data.scheduledDate && data.scheduledDate !== "";
      }
      return true;
    },
    {
      message: "scheduledDateRequired",
      path: ["scheduledDate"],
    }
  );

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "nameRequired")
    .min(3, "nameMin"),
  email: z
    .string()
    .min(1, "emailRequired")
    .email("validEmail"),
  phone: z
    .string()
    .min(1, "phoneRequired")
    .regex(/^01[0-2,5]{1}[0-9]{8}$/, "validEgyptianPhone"),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "subjectMin"),
  category: z.enum(["delay", "billing", "damage", "other"]),
  message: z.string().min(10, "messageMin"),
});

export const topUpSchema = z.object({
  amount: z
    .number({ message: "amountNumber" })
    .min(10, "topUpMin"),
  paymentMethod: z.enum(["visa", "mastercard", "vodafone_cash"]),
});

export const withdrawSchema = z.object({
  amount: z
    .number({ message: "amountNumber" })
    .min(10, "withdrawalMin"),
  destination: z.string().min(5, "destinationDetails"),
});


