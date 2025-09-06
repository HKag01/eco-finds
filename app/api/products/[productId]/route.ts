import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface Params {
	params: { productId: string };
}

export async function GET(req: Request, { params }: Params) {
	const { productId } = params;

	try {
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}

export async function PUT(req: Request, { params }: Params) {
	const { productId } = params;
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const product = await prisma.product.findFirst({
			where: { id: productId, sellerId: userId },
		});

		if (!product) {
			return NextResponse.json(
				{ error: "Product not found or you do not have permission to edit it" },
				{ status: 404 }
			);
		}

		const body = await req.json();
		const validatedData = updateProductSchema.parse(body);

		const updatedProduct = await prisma.product.update({
			where: { id: productId },
			data: validatedData,
		});

		return NextResponse.json(updatedProduct);
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

export async function DELETE(req: Request, { params }: Params) {
	const { productId } = params;
	const userId = await getUserIdFromToken();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const product = await prisma.product.findFirst({
			where: { id: productId, sellerId: userId },
		});

		if (!product) {
			return NextResponse.json(
				{
					error: "Product not found or you do not have permission to delete it",
				},
				{ status: 404 }
			);
		}

		await prisma.product.delete({
			where: { id: productId },
		});

		return NextResponse.json(
			{ message: "Product deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
