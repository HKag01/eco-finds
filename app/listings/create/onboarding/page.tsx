/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { UploadIcon, XIcon } from '@phosphor-icons/react'
interface ListingData {
  title: string
  description: string
}

export default function ListingOnboardingPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[] | undefined>()
  const [formData, setFormData] = useState<ListingData>({
    title: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof ListingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDrop = (acceptedFiles: File[]) => {
    console.log(acceptedFiles)
    setFiles(acceptedFiles)
  }

  const handleDropError = (error: Error) => {
    console.error('Drop error:', error)
    toast.error(error.message || 'Failed to upload file')
  }

  const handleRemoveFile = () => {
    setFiles(undefined)
  }

  const validateForm = (): boolean => {
    if (!files || files.length === 0) {
      toast.error('Please upload an image for your listing')
      return false
    }

    const title = formData.title.trim()
    const description = formData.description.trim()

    if (!title) {
      toast.error('Title is required')
      return false
    }

    if (title.length < 3) {
      toast.error('Title must be at least 3 characters long')
      return false
    }

    if (!description) {
      toast.error('Description is required')
      return false
    }

    if (description.length < 10) {
      toast.error('Description must be at least 10 characters long')
      return false
    }

    return true
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Convert file to base64 for temporary storage
      const fileBase64 = files && files[0] ? await fileToBase64(files[0]) : null
      
      // Store the onboarding data in localStorage for the next step
      const onboardingData = {
        title: formData.title,
        description: formData.description,
        imagePreview: fileBase64,
        imageFile: files?.[0]?.name
      }
      
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Listing details saved!')
      
      // Navigate to the next step
      router.push('/listings/create')
      
    } catch (error: unknown) {
      console.error('Submission error:', error)
      toast.error('Failed to save listing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Create listing</h1>
        <div></div> {/* Spacer for alignment */}
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              {files && files.length > 0 ? (
                <div className="relative">
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex-shrink-0">
                      <img
                        src={URL.createObjectURL(files[0])}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {files[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <Dropzone 
                  onDrop={handleDrop} 
                  onError={handleDropError}
                  accept={{
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/png': ['.png'],
                    'image/webp': ['.webp']
                  }}
                  maxSize={5 * 1024 * 1024} // 5MB
                  maxFiles={1}
                  src={files}
                >
                  <DropzoneEmptyState>
                    <div className="flex w-full items-center gap-4 cursor-pointer">
                      <div className="flex size-16 items-center justify-center rounded-lg text-muted-foreground">
                        <UploadIcon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-base">Upload a photo</p>
                        <p className="text-muted-foreground text-sm">
                          Drag and drop or click to upload
                        </p>
                      </div>
                    </div>
                  </DropzoneEmptyState>
                  <DropzoneContent />
                </Dropzone>
              )}
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Give your item a catchy title"
                maxLength={100}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder="Describe your item in detail..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </div>
              ) : (
                "Continue"
              )}
            </Button>

            <div className="text-center">
              <Button variant="ghost" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
      </form>
    </div>
  )
}