import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json(user);
}

export async function PUT(req: Request) {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { email, firstName, lastName } = updateProfileSchema.parse(body);

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				email,
				firstName,
				lastName,
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(updatedUser);
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
