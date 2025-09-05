"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";
import { getCookie } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: string;
  sellerId: string;
  blurHash?: string;
  condition?: string;
}

interface ProductCardProps {
  product: Product;
}

// Convert BlurHash to base64 data URL for Next.js Image component
const blurHashToDataURL = (hash: string): string => {
  // For now, create a simple base64 placeholder until we implement full BlurHash decoding
  // This is a minimal 1x1 transparent pixel as base64
  const fallbackDataURL =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  if (!hash || typeof hash !== "string" || hash.length < 6) {
    return fallbackDataURL;
  }

  // TODO: Implement actual BlurHash to base64 conversion
  // For now, return a solid color based on hash
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");

  if (!ctx) return fallbackDataURL;

  // Create a simple color based on hash
  const hashCode = hash.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const r = (hashCode & 0xff0000) >> 16;
  const g = (hashCode & 0x00ff00) >> 8;
  const b = hashCode & 0x0000ff;

  ctx.fillStyle = `rgb(${Math.abs(r) % 256}, ${Math.abs(g) % 256}, ${
    Math.abs(b) % 256
  })`;
  ctx.fillRect(0, 0, 4, 4);

  return canvas.toDataURL("image/jpeg", 0.1);
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      const token = getCookie("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        "/api/cart",
        {
          productId: product.id,
          quantity: 1,
        },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Product added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "Failed to add product to cart";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to add product to cart");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.imageUrl || "/api/placeholder/300/300"}
          alt={product.title}
          fill
          className="object-cover transition-all duration-300 hover:scale-105"
          placeholder={product.blurHash ? "blur" : "empty"}
          blurDataURL={
            product.blurHash ? blurHashToDataURL(product.blurHash) : undefined
          }
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Badge variant="default" className="text-xs text-center">
            {product.category.charAt(0).toUpperCase() +
              product.category.slice(1)}
          </Badge>
          {product.condition && (
            <Badge variant="secondary" className="text-xs text-center">
              {product.condition.charAt(0).toUpperCase() +
                product.condition.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-lg line-clamp-1">
            {product.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              ₹{product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/product/${product.id}`}>View Product</Link>
          </Button>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex-1"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-1"></div>
                Adding...
              </div>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
