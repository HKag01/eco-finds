import { headers } from "next/headers";
import jwt from "jsonwebtoken";

interface UserPayload {
	userId: string;
	iat: number;
	exp: number;
}

export async function getUserIdFromToken(): Promise<string | null> {
	const authHeader = (await headers()).get("authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
		return decoded.userId;
	} catch {
		return null;
	}
}

