'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FloatingInput } from '@/components/ui/floating-input'
import { FloatingPasswordInput } from '@/components/ui/floating-password-input'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

interface FormErrors {
  email?: string
  password?: string
  submit?: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormErrors
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Here you would typically send the data to your API
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      }
      
      console.log('Login attempt for:', loginData.email)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // On success, redirect to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        submit: 'Invalid email or password. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your EcoFinds account
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <div className="flex">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Sign in failed
                  </h3>
                  <p className="mt-1 text-sm text-destructive">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <FloatingInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <FloatingPasswordInput
                id="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link 
                href="/forgot-password" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}