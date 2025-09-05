'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon } from '@phosphor-icons/react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show content with a slight delay for better UX
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-4 max-w-2xl">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
        {/* Success Icon */}
        <div
          className={`transition-all duration-500 ${
            showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <div className="relative">
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Success Message */}
        <div
          className={`transition-all duration-700 delay-200 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Successful! 🎉
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Thank you for your purchase! Your items have been bought
            successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            You should receive a confirmation email shortly with your order
            details.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-3 w-full max-w-sm transition-all duration-700 delay-400 ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <Button asChild className="flex-1">
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}