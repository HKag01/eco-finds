import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const cartItems = await prisma.cartItem.findMany({
			where: { userId },
			include: {
				product: true,
			},
			orderBy: {
				addedAt: "desc",
			},
		});

		return NextResponse.json(cartItems);
	} catch (error) {
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { productId, quantity } = cartItemSchema.parse(body);

		await prisma.cartItem.upsert({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
			update: {
				quantity,
			},
			create: {
				userId,
				productId,
				quantity,
			},
		});

		const updatedCart = await prisma.cartItem.findMany({
			where: { userId },
			include: { product: true },
			orderBy: { addedAt: "desc" },
		});

		return NextResponse.json(updatedCart, { status: 200 });
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
