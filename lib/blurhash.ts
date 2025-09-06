import { encode } from "blurhash";
import sharp from "sharp";

const FALLBACK_BLURHASH = "L6Pj0^i_.AyE_3t7t7Rk00t7%Mxu";

export async function generateBlurHash(imageUrl: string): Promise<string> {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}
		const imageBuffer = await response.arrayBuffer();

		const { data, info } = await sharp(Buffer.from(imageBuffer))
			.raw()
			.ensureAlpha()
			.toBuffer({ resolveWithObject: true });

		return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
	} catch (error) {
		console.error("Failed to generate BlurHash:", error);
		return FALLBACK_BLURHASH;
	}
}
