import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const cartItems = await prisma.cartItem.findMany({
			where: { userId },
			include: { product: true },
		});

		if (cartItems.length === 0) {
			return NextResponse.json(
				{ error: "Your cart is empty" },
				{ status: 400 }
			);
		}

		const total = cartItems.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0
		);

		const createdOrder = await prisma.$transaction(async (tx) => {
			const order = await tx.order.create({
				data: {
					userId,
					total,
					items: {
						create: cartItems.map((item) => ({
							title: item.product.title,
							price: item.product.price,
							imageUrl: item.product.imageUrl,
							productId: item.product.id,
						})),
					},
				},
				include: {
					items: true,
				},
			});

			await tx.cartItem.deleteMany({
				where: { userId },
			});

			return order;
		});

		return NextResponse.json(createdOrder, { status: 201 });
	} catch (error) {
		console.error("Checkout error:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred during checkout." },
			{ status: 500 }
		);
	}
}
