/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Link from 'next/link'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null
  return null
}

interface OnboardingData {
  title: string
  description: string
  imagePreview: string | null
  imageFile: string
}

export default function CreateListingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [formData, setFormData] = useState({
    price: '',
    category: '',
    condition: '',
    yearOfManufacture: '',
    brand: '',
    model: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    material: '',
    color: '',
    hasOriginalPackaging: false,
    hasManual: false,
    workingConditionDescription: '',
  })

  useEffect(() => {
    // Load onboarding data from localStorage
    const storedData = localStorage.getItem('onboardingData')
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setOnboardingData(parsed)
      } catch (error) {
        console.error('Failed to parse onboarding data:', error)
        toast.error('Failed to load previous data')
        router.push('/listings/create/onboarding')
      }
    } else {
      toast.error('No onboarding data found')
      router.push('/listings/create/onboarding')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = getCookie('token')
      if (!token) {
        toast.error('Please log in to create a listing')
        router.push('/login')
        return
      }

      if (!onboardingData) {
        toast.error('Missing onboarding data')
        return
      }

      // Prepare the payload with proper type conversions
      const payload = {
        title: onboardingData.title,
        description: onboardingData.description,
        imageUrl: onboardingData.imagePreview || '', // For now using base64, in production would upload to CDN
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: 1, // Default quantity to 1
        condition: formData.condition,
        yearOfManufacture: formData.yearOfManufacture ? parseInt(formData.yearOfManufacture) : null,
        brand: formData.brand || null,
        model: formData.model || null,
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        material: formData.material || null,
        color: formData.color || null,
        hasOriginalPackaging: formData.hasOriginalPackaging,
        hasManual: formData.hasManual,
        workingConditionDescription: formData.workingConditionDescription || null,
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create listing')
      }

      toast.success('Product listed successfully!')
      
      // Clear onboarding data after successful submission
      localStorage.removeItem('onboardingData')
      
      router.push('/listings/my')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading your listing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/listings/create/onboarding">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Complete listing</h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Preview */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Product Preview</h2>
            
            <div className="flex gap-4 p-4 border rounded-lg bg-muted/20">
              {onboardingData.imagePreview && (
                <div className="flex-shrink-0">
                  <img
                    src={onboardingData.imagePreview}
                    alt="Product preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">{onboardingData.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {onboardingData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
            
            {/* Product Category */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Product Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                  <SelectItem value="FURNITURE">Furniture</SelectItem>
                  <SelectItem value="CLOTHING">Clothing</SelectItem>
                  <SelectItem value="BOOKS">Books</SelectItem>
                  <SelectItem value="SPORTS">Sports</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-base font-medium">
                Price (₹) *
              </Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Condition *</Label>
              <Tabs
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="EXCELLENT">Excellent</TabsTrigger>
                  <TabsTrigger value="GOOD">Good</TabsTrigger>
                  <TabsTrigger value="POOR">Poor</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Product Details</h2>
            
            {/* Year of Manufacture and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearOfManufacture" className="text-base font-medium">
                  Year of Manufacture
                </Label>
                <Input
                  id="yearOfManufacture"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.yearOfManufacture}
                  onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                  placeholder="e.g., 2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-base font-medium">
                  Brand
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Apple, Samsung, Nike"
                />
              </div>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium">
                Model
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., iPhone 14 Pro, Galaxy S23"
              />
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Dimensions (cm)</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length" className="text-sm">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-sm">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-medium">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.00"
              />
            </div>

            {/* Material and Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material" className="text-base font-medium">
                  Material
                </Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g., Plastic, Metal, Wood"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-base font-medium">
                  Color
                </Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Black, White, Blue"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b pb-2">Additional Information</h2>
            
            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Original Packaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Does this item come with its original packaging?
                  </p>
                </div>
                <Switch
                  checked={formData.hasOriginalPackaging}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasOriginalPackaging: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Manual/Instructions Included</Label>
                  <p className="text-sm text-muted-foreground">
                    Does this item come with manual or instructions?
                  </p>
                </div>
                <Switch
                  checked={formData.hasManual}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasManual: checked })}
                />
              </div>
            </div>

            {/* Working Condition Description */}
            <div className="space-y-2">
              <Label htmlFor="workingConditionDescription" className="text-base font-medium">
                Working Condition Description
              </Label>
              <Textarea
                id="workingConditionDescription"
                value={formData.workingConditionDescription}
                onChange={(e) => setFormData({ ...formData, workingConditionDescription: e.target.value })}
                placeholder="Describe any defects, wear, or special conditions..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:pb-0">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}