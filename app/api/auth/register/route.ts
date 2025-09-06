import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, password, firstName, lastName } = registerSchema.parse(body);

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				firstName,
				lastName,
			},
		});

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: "7d",
		});

		const { password: _, ...userWithoutPassword } = user;

		return NextResponse.json(
			{ user: userWithoutPassword, token },
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
