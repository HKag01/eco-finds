'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import axios from 'axios'
import { getCookie } from '@/lib/utils'
import { TrashIcon, EyeIcon, PlusIcon } from "@phosphor-icons/react";
import { CircleNotchIcon } from '@phosphor-icons/react'
import Image from 'next/image'

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
  condition: string
  quantity: number
}

interface MyListingCardProps {
  product: Product
  onDelete: (id: string) => void
  isDeleting?: boolean
}

function MyListingCard({ product, onDelete, isDeleting = false }: MyListingCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.imageUrl || "/api/placeholder/300/300"}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Badge variant="default" className="text-xs text-center">
            {product.category.charAt(0).toUpperCase() +
              product.category.slice(1)}
          </Badge>
          <Badge variant="secondary" className="text-xs text-center">
            {product.condition.charAt(0).toUpperCase() +
              product.condition.slice(1).toLowerCase()}
          </Badge>
        </div>
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="outline"
            className="text-xs text-center bg-background/90"
          >
            Qty: {product.quantity}
          </Badge>
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
          <div className="text-xs text-muted-foreground">
            Listed on {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/product/${product.id}`}>
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={isDeleting}
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
                )
              ) {
                onDelete(product.id);
              }
            }}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-1"></div>
                Deleting...
              </div>
            ) : (
              <>
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const fetchListings = useCallback(async () => {
    try {
      const token = getCookie('token')
      if (!token) {
        toast.error('You need to be logged in to view your listings')
        router.push('/login')
        return
      }

      const response = await axios.get('/api/products/my-listings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setListings(response.data)
    } catch (error) {
      console.error('Error fetching listings:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to load your listings'
        toast.error(errorMessage)
        if (error.response?.status === 401) {
          router.push('/login')
        }
      } else {
        toast.error('Failed to load your listings')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleDelete = async (productId: string) => {
    try {
      setDeletingIds(prev => new Set(prev).add(productId))
      
      const token = getCookie('token')
      if (!token) {
        toast.error('You need to be logged in to delete listings')
        router.push('/login')
        return
      }

      await axios.delete(`/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setListings(prev => prev.filter(listing => listing.id !== productId))
      toast.success('Listing deleted successfully')
    } catch (error) {
      console.error('Error deleting listing:', error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Failed to delete listing'
        toast.error(errorMessage)
        if (error.response?.status === 401) {
          router.push('/login')
        }
      } else {
        toast.error('Failed to delete listing')
      }
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">My Listings</h1>
        <div></div> {/* Spacer for alignment */}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <PlusIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first listing to start selling your products
          </p>
          <Button asChild>
            <Link href="/listings/create">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Listing
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}{" "}
              found
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <MyListingCard
                key={listing.id}
                product={listing}
                onDelete={handleDelete}
                isDeleting={deletingIds.has(listing.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}