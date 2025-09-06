import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 6 characters long" }),
	firstName: z.string().min(1, { message: "First name is required" }),
	lastName: z.string().min(1, { message: "Last name is required" }),
});

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export const updateProfileSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }).optional(),
	firstName: z
		.string()
		.min(1, { message: "First name is required" })
		.optional(),
	lastName: z.string().min(1, { message: "Last name is required" }).optional(),
});
