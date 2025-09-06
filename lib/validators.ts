import { z } from "zod";
import { ProductCategory } from "@prisma/client";

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

export const createProductSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" }),
	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters long" }),
	price: z.number().positive({ message: "Price must be a positive number" }),
	imageUrl: z.string().url({ message: "Invalid image URL" }),
	category: z.nativeEnum(ProductCategory),
});

export const updateProductSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" })
		.optional(),
	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters long" })
		.optional(),
	price: z
		.number()
		.positive({ message: "Price must be a positive number" })
		.optional(),
	imageUrl: z.string().url({ message: "Invalid image URL" }).optional(),
	category: z.nativeEnum(ProductCategory).optional(),
});
