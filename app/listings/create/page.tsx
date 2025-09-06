'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function ListingCreatePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-3xl font-bold text-foreground font-serif">
            Complete your listing
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add pricing and additional details
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              This step will be implemented in the next phase.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/listings/create/onboarding')}
                variant="outline" 
                className="w-full"
              >
                Back to Previous Step
              </Button>
              
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}