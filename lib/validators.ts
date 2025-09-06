import { z } from "zod";
import { ProductCategory, ProductCondition } from "@prisma/client";

export const registerSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" }),
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
	quantity: z
		.number()
		.int()
		.positive({ message: "Quantity must be a positive integer" })
		.default(1),
	condition: z.nativeEnum(ProductCondition),
	yearOfManufacture: z
		.number()
		.int()
		.min(1900, { message: "Year of manufacture must be 1900 or later" })
		.optional()
		.nullable(),
	brand: z.string().optional().nullable(),
	model: z.string().optional().nullable(),
	length: z
		.number()
		.positive({ message: "Length must be a positive number" })
		.optional()
		.nullable(),
	width: z
		.number()
		.positive({ message: "Width must be a positive number" })
		.optional()
		.nullable(),
	height: z
		.number()
		.positive({ message: "Height must be a positive number" })
		.optional()
		.nullable(),
	weight: z
		.number()
		.positive({ message: "Weight must be a positive number" })
		.optional()
		.nullable(),
	material: z.string().optional().nullable(),
	color: z.string().optional().nullable(),
	hasOriginalPackaging: z.boolean().default(false),
	hasManual: z.boolean().default(false),
	workingConditionDescription: z.string().optional().nullable(),
});

export const updateProductSchema = z
	.object({
		title: z
			.string()
			.min(3, { message: "Title must be at least 3 characters long" }),
		description: z
			.string()
			.min(10, { message: "Description must be at least 10 characters long" }),
		price: z.number().positive({ message: "Price must be a positive number" }),
		imageUrl: z.string().url({ message: "Invalid image URL" }),
		category: z.nativeEnum(ProductCategory),
		quantity: z
			.number()
			.int()
			.positive({ message: "Quantity must be a positive integer" }),
		condition: z.enum(ProductCondition),
		yearOfManufacture: z
			.number()
			.int()
			.min(1900, { message: "Year of manufacture must be 1900 or later" })
			.nullable(),
		brand: z.string().nullable(),
		model: z.string().nullable(),
		length: z
			.number()
			.positive({ message: "Length must be a positive number" })
			.nullable(),
		width: z
			.number()
			.positive({ message: "Width must be a positive number" })
			.nullable(),
		height: z
			.number()
			.positive({ message: "Height must be a positive number" })
			.nullable(),
		weight: z
			.number()
			.positive({ message: "Weight must be a positive number" })
			.nullable(),
		material: z.string().nullable(),
		color: z.string().nullable(),
		hasOriginalPackaging: z.boolean(),
		hasManual: z.boolean(),
		workingConditionDescription: z.string().nullable(),
	})
	.partial();

export const cartItemSchema = z.object({
	productId: z.string().uuid({ message: "Invalid product ID" }),
	quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});
