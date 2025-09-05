'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getCookie } from '@/lib/utils'
import { ShoppingCartIcon, ArrowLeftIcon } from '@phosphor-icons/react'
import { CircleNotchIcon } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  createdAt: string
  sellerId: string
  blurHash?: string
  quantity?: number
  condition?: string
  yearOfManufacture?: number | null
  brand?: string | null
  model?: string | null
  length?: number | null
  width?: number | null
  height?: number | null
  weight?: number | null
  material?: string | null
  color?: string | null
  hasOriginalPackaging?: boolean
  hasManual?: boolean
  workingConditionDescription?: string | null
}

const blurHashToDataURL = (hash: string): string => {
  const fallbackDataURL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  
  if (!hash || typeof hash !== 'string' || hash.length < 6) {
    return fallbackDataURL
  }
  
  if (typeof document === 'undefined') return fallbackDataURL
  
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 4
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return fallbackDataURL
  
  const hashCode = hash.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const r = (hashCode & 0xFF0000) >> 16
  const g = (hashCode & 0x00FF00) >> 8
  const b = hashCode & 0x0000FF
  
  ctx.fillStyle = `rgb(${Math.abs(r) % 256}, ${Math.abs(g) % 256}, ${Math.abs(b) % 256})`
  ctx.fillRect(0, 0, 4, 4)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`/api/products/${productId}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error('Product not found')
        router.push('/')
      } else {
        toast.error('Failed to load product details')
      }
    } finally {
      setLoading(false)
    }
  }, [productId, router])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      
      const token = getCookie('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await axios.post(
        "/api/cart",
        {
          productId: product?.id,
          quantity: 1,
        },
        {headers}
      );
      
      if (response.status === 200) {
        toast.success('Product added to cart!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to add product to cart'
        toast.error(errorMessage)
      } else {
        toast.error('Failed to add product to cart')
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 pb-20 md:pb-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-4 max-w-6xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              placeholder={product.blurHash ? "blur" : "empty"}
              blurDataURL={
                product.blurHash
                  ? blurHashToDataURL(product.blurHash)
                  : undefined
              }
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Action Buttons */}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-3">
              {product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-foreground">
                ₹{product.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Specifications */}
          {(product.condition ||
            product.brand ||
            product.model ||
            product.yearOfManufacture) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.condition && (
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="ml-2 font-medium">
                      {product.condition}
                    </span>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                )}
                {product.model && (
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <span className="ml-2 font-medium">{product.model}</span>
                  </div>
                )}
                {product.yearOfManufacture && (
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <span className="ml-2 font-medium">
                      {product.yearOfManufacture}
                    </span>
                  </div>
                )}
                {product.color && (
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <span className="ml-2 font-medium">{product.color}</span>
                  </div>
                )}
                {product.material && (
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <span className="ml-2 font-medium">{product.material}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div>
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Adding to Cart...
                </div>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>

          <Separator />
        </div>
      </div>
    </div>
  );
}