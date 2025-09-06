'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CircleNotchIcon } from "@phosphor-icons/react"

type Profile = {
  id?: string
  email: string
  firstName: string
  lastName: string
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; secure; samesite=strict`
}

function parseUserCookie(): Partial<Profile> | null {
  try {
    const raw = getCookie('user')
    if (!raw) return null
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    return {
      id: parsed.id,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
    }
  } catch {
    return null
  }
}

function initialsFrom(firstName?: string, lastName?: string, email?: string): string {
  const a = (firstName?.trim()?.[0] ?? '')
  const b = (lastName?.trim()?.[0] ?? '')
  const fromName = `${a}${b}`.toUpperCase()
  if (fromName) return fromName
  const local = email?.split('@')[0] ?? ''
  if (local) return local.slice(0, 2).toUpperCase()
  return 'U'
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<Profile>>(() => parseUserCookie() ?? {})
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const initials = useMemo(
    () => initialsFrom(profile.firstName, profile.lastName, profile.email),
    [profile.firstName, profile.lastName, profile.email],
  )

  useEffect(() => {
    // Initialize fullName from cookie data
    const cookieProfile = parseUserCookie()
    if (cookieProfile) {
      const initialFullName = `${cookieProfile.firstName || ''} ${cookieProfile.lastName || ''}`.trim()
      setFullName(initialFullName)
    }

    const token = getCookie('token')
    if (!token) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    fetch('/api/profile/me', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load profile')
        return res.json()
      })
      .then((data: Profile) => {
        setProfile(data)
        const apiFullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        setFullName(apiFullName)
      })
      .catch(() => {
        // keep current cookie state
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])



  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Name is required')
      return
    }
    if (!profile.email?.trim()) {
      toast.error('Email is required')
      return
    }
    setSaving(true)
    try {
      const token = getCookie('token')
      if (!token) {
        toast.error('You are not authenticated')
        return
      }
      
      // Split the full name into firstName and lastName
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || '.'
      
      const res = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: profile.email.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to update profile')
      }
      const updated = (await res.json()) as Profile

      // Update "user" cookie to keep UI consistent
      const cookieUser = {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
      }
      setCookie('user', encodeURIComponent(JSON.stringify(cookieUser)), 7 * 24 * 60 * 60)


      toast.success('Profile updated')
      router.push('/dashboard/profile')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotchIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
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
        <h1 className="text-xl font-semibold">Edit profile</h1>
        <div></div> {/* Spacer for alignment */}
      </div>

      <form onSubmit={onSave} className="mt-8 space-y-6">
        {/* Avatar (initials only) */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          <div>
            <div className="font-medium">
              {fullName || 'Your name'}
            </div>
            <div className="text-sm text-muted-foreground">{profile.email}</div>
          </div>
        </div>

        {/* Name and Email fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="Your email"
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  )
}