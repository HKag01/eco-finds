import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Params {
	params: { productId: string };
}

export async function DELETE(req: Request, { params }: Params) {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { productId } = await params;
	if (!productId) {
		return NextResponse.json(
			{ error: "Product ID is required" },
			{ status: 400 }
		);
	}

	try {
		await prisma.cartItem.delete({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		});

		const updatedCart = await prisma.cartItem.findMany({
			where: { userId },
			include: { product: true },
			orderBy: { addedAt: "desc" },
		});

		return NextResponse.json(updatedCart);
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			return NextResponse.json(
				{ error: "Item not found in cart" },
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
