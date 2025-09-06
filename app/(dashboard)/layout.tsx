import NavDock from "@/components/comp-438"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <NavDock />
        </div>
      </div>
    </div>
  )
}