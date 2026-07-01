import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(8, "passwordMin"),
});

export const registerCustomerSchema = z
  .object({
    name: z.string().min(3, "nameMin"),
    email: z.string().email("invalidEmail"),
    phone: z
      .string()
      .regex(/^01[0-2,5]{1}[0-9]{8}$/, "invalidPhone"),
    password: z.string().min(8, "passwordMin"),
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
    phone: z
      .string()
      .regex(/^01[0-2,5]{1}[0-9]{8}$/, "invalidPhone"),
    password: z.string().min(8, "passwordMin"),
    confirmPassword: z.string(),
    licenseNumber: z.string().min(5, "invalidLicense"),
    vehicleType: z.string().min(2, "vehicleRequired"),
    vehiclePlate: z.string().min(3, "invalidPlate"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsMismatch",
    path: ["confirmPassword"],
  });

export const registerOfficeSchema = z
  .object({
    name: z.string().min(3, "nameMin"),
    email: z.string().email("invalidEmail"),
    phone: z
      .string()
      .regex(/^01[0-2,5]{1}[0-9]{8}$/, "invalidPhone"),
    password: z.string().min(8, "passwordMin"),
    confirmPassword: z.string(),
    businessName: z.string().min(2, "nameRequired"),
    licenseNumber: z.string().min(5, "invalidLicense"),
    officeAddress: z.string().min(5, "pickupShort"),
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
  email: z.string(),
});
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "passwordMin"),
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
    weight: z.number({ message: "weightPositive" }).positive("weightPositive"),
    packageType: z.enum(["small_box", "medium_box", "large_box", "pallet"]),
    deliverySpeed: z.enum(["standard", "express", "scheduled"]),
    scheduledDate: z.union([z.string(), z.date()]).optional(),
    notes: z.string().max(300, "notesMax").optional(),
    price: z.number({ message: "pricePositive" }).positive("pricePositive").optional(),
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
  category: z.enum([
    "delay",
    "billing",
    "damage",
    "app_issue",
    "payment",
    "accident",
    "customer_issue",
    "driver_issue",
    "system_issue",
    "other"
  ]),
  shipmentId: z
    .string()
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "messageMin"),
});

export const topUpSchema = z.object({
  amount: z
    .number({ message: "amountNumber" })
    .min(10, "topUpMin"),
  paymentMethod: z.enum(["visa", "mastercard", "vodafone_cash"]),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  firstName: z.string().min(2, "Min 2 characters").optional().or(z.literal("")),
  lastName: z.string().min(2, "Min 2 characters").optional().or(z.literal("")),
});

export const withdrawSchema = z.object({
  amount: z
    .number({ message: "amountNumber" })
    .min(10, "withdrawalMin"),
  destination: z.string().min(5, "destinationDetails"),
});


