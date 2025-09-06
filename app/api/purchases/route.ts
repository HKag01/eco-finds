import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const orders = await prisma.order.findMany({
			where: { userId },
			include: {
				items: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(orders);
	} catch (error) {
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
