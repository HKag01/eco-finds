'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavDock from '@/components/dock'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null
  return null
}

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Routes that should not show sidebar/dock even when authenticated
  const authRoutes = ['/login', '/signup']
  
  // Check authentication status
  useEffect(() => {
    const token = getCookie('token')
    setIsAuthenticated(!!token)
  }, [])

  // Show auth routes (login/signup) without sidebar/dock
  if (authRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // Show layout with conditional sidebar and dock
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Desktop Sidebar - Always show except auth routes */}
        <AppSidebar isAuthenticated={isAuthenticated} />
        
        {/* Main Content */}
        <SidebarInset className="flex-1">
          <main className="flex-1 md:p-0">
            {children}
          </main>
        </SidebarInset>
        
        {/* Mobile Dock - Always show on mobile for all pages except auth pages */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <NavDock isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </SidebarProvider>
  )

}