import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function GET() {
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const purchases = await prisma.order.findMany({
			where: { 
				userId: userId
			},
			include: {
				items: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return NextResponse.json(purchases);
	} catch (error) {
		console.error('Error fetching purchases:', error);
		return NextResponse.json(
			{ error: "Failed to fetch purchases" },
			{ status: 500 }
		);
	}
}