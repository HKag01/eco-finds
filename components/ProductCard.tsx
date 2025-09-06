'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { getCookie } from '@/lib/utils'

interface Product {
  id: number
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  createdAt: string
  sellerId: string
  blurHash?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      
      const token = getCookie('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await axios.post(
        "/api/cart",
        {
          productId: product.id,
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

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.imageUrl || '/api/placeholder/300/300'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </div>
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
              ${product.price.toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">4.5</span>
          </div>
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Adding...
            </div>
          ) : (
            'Add to Cart'
          )}
        </Button>
      </div>
    </div>
  )
}