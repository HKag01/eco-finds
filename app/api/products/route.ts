import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ProductCategory } from "@prisma/client";
import { generateBlurHash } from "@/lib/blurhash";

export async function POST(req: Request) {
	const sellerId = await getUserIdFromToken();
	if (!sellerId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const productData = createProductSchema.parse(body);

		const blurHash = await generateBlurHash(productData.imageUrl);

		const newProduct = await prisma.product.create({
			data: {
				...productData,
				sellerId,
				blurHash,
			},
		});

		return NextResponse.json(newProduct, { status: 201 });
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

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const category = searchParams.get("category");
	const search = searchParams.get("search");

	try {
		const where: Prisma.ProductWhereInput = {};

		if (category) {
			where.category = {
				equals: category as ProductCategory,
			};
		}

		if (search) {
			where.title = {
				contains: search,
				mode: "insensitive",
			};
		}

		const products = await prisma.product.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(products);
	} catch (error) {
		return NextResponse.json(
			{ error: "An unexpected error occurred." },
			{ status: 500 }
		);
	}
}
