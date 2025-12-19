import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must have at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password is too long"),
});