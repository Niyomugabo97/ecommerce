
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must have at least 6 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Reset code must contain 6 digits"),

  newPassword: z
    .string()
    .min(6, "New password must have at least 6 characters"),
});
