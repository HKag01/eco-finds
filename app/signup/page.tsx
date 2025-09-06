'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FloatingInput } from '@/components/ui/floating-input'
import { FloatingPasswordInput } from '@/components/ui/floating-password-input'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const signupSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Display name can only contain letters, numbers, and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignupFormData = z.infer<typeof signupSchema>

interface FormErrors {
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
  submit?: string
}

interface PasswordStrength {
  score: number
  feedback: string[]
  isStrong: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isStrong: false
  })

  const validatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One lowercase letter')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One uppercase letter')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('One number')
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1
    } else {
      feedback.push('One special character (@$!%*?&)')
    }

    return {
      score,
      feedback,
      isStrong: score === 5
    }
  }

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Real-time password strength validation
    if (field === 'password') {
      setPasswordStrength(validatePasswordStrength(value))
    }

    // Real-time password match validation
    if (field === 'confirmPassword' || (field === 'password' && formData.confirmPassword)) {
      const passwordToCheck = field === 'password' ? value : formData.password
      const confirmPasswordToCheck = field === 'confirmPassword' ? value : formData.confirmPassword
      
      if (confirmPasswordToCheck && passwordToCheck !== confirmPasswordToCheck) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }))
      } else if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }))
      }
    }
  }

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData)
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

  const hashPassword = async (password: string): Promise<string> => {
    try {
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      return hashedPassword
    } catch (error) {
      throw new Error('Failed to secure password')
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
      // Hash the password securely
      const hashedPassword = await hashPassword(formData.password)
      
      // Here you would typically send the data to your API
      const signupData = {
        displayName: formData.displayName.trim(),
        email: formData.email.toLowerCase().trim(),
        hashedPassword, // Never send plain text password
      }
      
      console.log('Signup data (hashedPassword would be sent to API):', {
        ...signupData,
        hashedPassword: '[HASHED]' // Don't log actual hash in production
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // On success, redirect to login or dashboard
      router.push('/login?message=Account created successfully')
      
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-destructive'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join EcoFinds and start your sustainable shopping journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Sign up failed
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
                id="displayName"
                name="displayName"
                type="text"
                label="Display Name"
                autoComplete="name"
                required
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                error={errors.displayName}
                aria-invalid={!!errors.displayName}
                aria-describedby={errors.displayName ? "displayName-error" : undefined}
              />
              {errors.displayName && (
                <p id="displayName-error" className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.displayName}
                </p>
              )}
            </div>

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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : "password-help"}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={cn(
                      "font-medium",
                      passwordStrength.score <= 2 ? "text-destructive" :
                      passwordStrength.score <= 3 ? "text-yellow-600" :
                      passwordStrength.score <= 4 ? "text-blue-600" :
                      "text-green-600"
                    )}>
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="mt-1 flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          i <= passwordStrength.score 
                            ? getPasswordStrengthColor(passwordStrength.score)
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Missing: {passwordStrength.feedback.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <FloatingPasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                className={cn(
                  !errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && "border-green-500"
                )}
                rightIcon={
                  formData.confirmPassword && formData.password === formData.confirmPassword ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : null
                }
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordStrength.isStrong}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>

       
      </div>
    </div>
  )
}