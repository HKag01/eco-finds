import NavDock from "@/components/comp-438"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <SidebarInset className="flex-1">
          <main className="flex-1 md:p-0">
            {children}
          </main>
        </SidebarInset>
        
        {/* Mobile Dock - Only show on mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <NavDock />
        </div>
      </div>
    </SidebarProvider>
  )
}