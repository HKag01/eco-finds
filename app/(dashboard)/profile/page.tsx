'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SunIcon,
  MoonIcon,
  DesktopIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [fullNameDisplay, setFullNameDisplay] = useState('')
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Initialize from cookie data
    const cookieProfile = parseUserCookie()
    if (cookieProfile) {
      setProfile(cookieProfile)
      const initialFullName = `${cookieProfile.firstName || ''} ${cookieProfile.lastName || ''}`.trim()
      setFullNameDisplay(initialFullName)
      setLoading(false) // Stop loading immediately when cookie data is available
    }

    const token = getCookie('token')
    if (!token) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    fetch('/api/profile/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load profile')
        return res.json()
      })
      .then((data: Profile) => {
        setProfile(data)
        const apiFullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        setFullNameDisplay(apiFullName)
      })
      .catch(() => {
        // no-op; we already have cookie fallback
      })
      .finally(() => {
        // Only set loading to false if no cookie data was available initially
        if (!cookieProfile) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  const initials = useMemo(
    () => initialsFrom(profile?.firstName, profile?.lastName, profile?.email),
    [profile?.firstName, profile?.lastName, profile?.email],
  )

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="size-16 rounded-full bg-muted/50" />
          ) : (
            <div className="size-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xl font-semibold truncate">
              {loading ? (
                <Skeleton className="h-5 w-40 bg-muted/50" />
              ) : (
                fullNameDisplay && <span>{fullNameDisplay}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {loading ? (
                <Skeleton className="h-4 w-56 bg-muted/50" />
              ) : (
                profile?.email && <span>{profile.email}</span>
              )}
            </div>
          </div>
        </div>
        <Button asChild size="icon" variant="ghost">
          <Link href="/profile/edit" aria-label="Edit profile">
            <PencilSimpleIcon size={20} aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {/* Actions/List */}
      <div className="space-y-3">
        {/* Order history */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="font-medium">Order history</div>
            <div className="text-sm text-muted-foreground">
              View your past orders
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/orders">View</Link>
          </Button>
        </div>

        {/* Theme selector */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="mr-4">
            <div className="font-medium">Theme</div>
            <div className="text-sm text-muted-foreground">
              Change the theme.
            </div>
          </div>
          <Tabs
            value={(theme ?? 'system') as 'light' | 'dark' | 'system'}
            onValueChange={(v) => {
              const val = v as 'light' | 'dark' | 'system'
              setTheme(val)
            }}
            className="items-center"
          >
            <TabsList>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="light">
                        <SunIcon size={22} aria-hidden="true" />
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-sm">
                    Light
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="dark">
                        <MoonIcon size={22} aria-hidden="true" />
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Dark
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <TabsTrigger value="system">
                        <DesktopIcon size={22} aria-hidden="true" />
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    System
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}