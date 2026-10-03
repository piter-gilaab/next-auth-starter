import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Use a valid email address.")
  .max(254, "Email is too long.");

const password = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128, "Password is too long.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short.").max(80),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required.").max(128),
});

export const emailSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
