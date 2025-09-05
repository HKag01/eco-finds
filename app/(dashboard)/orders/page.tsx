/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCookie } from '@/lib/utils'
import { toast } from 'sonner'
import { CircleNotchIcon } from '@phosphor-icons/react'

interface OrderItem {
  id: string
  title: string
  price: number
  imageUrl: string
  orderId: string
  productId?: string | null
}

interface Purchase {
  id: string
  total: number
  createdAt: string
  userId: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          toast.error('Please log in to view your orders')
          router.push('/login')
          return
        }

        const response = await fetch('/api/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Please log in to view your orders')
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch purchases')
        }

        const data = await response.json()
        setPurchases(data)
      } catch (error) {
        console.error('Error fetching purchases:', error)
        toast.error('Failed to load your orders')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Order History</h1>
        <div></div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your order history here
          </p>
          <Button asChild>
            <Link href="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{purchase.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(purchase.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${purchase.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                    Completed
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
                    <img
                      src={item.imageUrl || '/api/placeholder/80/80'}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Order item
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Product ID: {item.productId ? item.productId.slice(0, 8) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}