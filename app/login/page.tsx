'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import axios from 'axios'
import { toast } from 'sonner'

interface LoginFormData {
  email: string
  password: string
}


export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const email = formData.email.trim()
    const password = formData.password

    if (!email) {
      toast.error('Email is required')
      return false
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!password) {
      toast.error('Password is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }


    setIsLoading(true)

    try {
      // Here you would typically send the data to your API
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      }

      const response = await axios.post("/api/auth/login", { ...loginData })
      
      if (response.data.token) {
        // Store the token in cookies for authentication
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        document.cookie = `user=${encodeURIComponent(JSON.stringify(response.data.user))}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        
        // On success, redirect to dashboard
        router.push('/dashboard')
      } else {
        toast.error('Login failed. Please try again.')
      }
      
    } catch (error: unknown) {
      console.error('Login error:', error)
      let errorMessage = 'Invalid email or password. Please try again.'
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { error?: string } | undefined
        if (data?.error) {
          errorMessage = data.error
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-3xl font-bold text-foreground font-serif">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your EcoFinds account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon
                      className="w-4 h-4 text-muted-foreground"
                    />
                  ) : (
                    <EyeIcon
                      className="w-4 h-4 text-muted-foreground"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <CircleNotchIcon className="w-4 h-4 mr-2 animate-spin text-primary-foreground" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>


            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Create an account</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}