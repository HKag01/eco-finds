'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getCookie } from '@/lib/utils'
import { XIcon, ShoppingCartIcon } from '@phosphor-icons/react'
import { CircleNotchIcon } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  category: string
  blurHash?: string
}

interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  addedAt: string
  product: Product
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

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [processingCheckout, setProcessingCheckout] = useState(false)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const token = getCookie('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get('/api/cart', { headers })
      setCartItems(response.data)
    } catch (error) {
      console.error('Error fetching cart items:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to load cart items'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }


  const removeItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    
    try {
      const token = getCookie('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.delete(`/api/cart/${productId}`, { headers })
      setCartItems(response.data)
      toast.success('Item removed from cart!')
    } catch (error) {
      console.error('Error removing item:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to remove item'
        toast.error(errorMessage)
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleCheckout = async () => {
    setProcessingCheckout(true)
    
    try {
      const token = getCookie('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      // Call the checkout API
      const response = await axios.post('/api/checkout', {}, { headers })
      
      if (response.status === 201) {
        // Clear the cart items from state since API clears them
        setCartItems([])
        
        // Navigate to success page
        router.push('/checkout/success')
        
        toast.success('Order placed successfully!')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Checkout failed. Please try again.'
        toast.error(errorMessage)
      } else {
        toast.error('Checkout failed. Please try again.')
      }
    } finally {
      setProcessingCheckout(false)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price, 0)
  const totalItems = cartItems.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 pb-20 md:pb-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShoppingCartIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <span className="text-sm text-muted-foreground">({totalItems} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.productId)
              
              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-background"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        placeholder={item.product.blurHash ? "blur" : "empty"}
                        blurDataURL={
                          item.product.blurHash
                            ? blurHashToDataURL(item.product.blurHash)
                            : undefined
                        }
                        sizes="96px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {item.product.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.product.description}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Category:{" "}
                            {item.product.category.charAt(0).toUpperCase() +
                              item.product.category.slice(1)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                          disabled={isUpdating}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Qty: 1
                        </div>

                        <div className="text-right">
                          <p className="text-sm sm:text-base font-semibold">
                            {item.product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 bg-background sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                   <span>Items ({totalItems})</span>
                   <span>{totalPrice.toFixed(2)}</span>
                 </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-semibold">
                   <span>Total</span>
                   <span>{totalPrice.toFixed(2)}</span>
                 </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={handleCheckout}
                disabled={processingCheckout}
              >
                {processingCheckout ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}