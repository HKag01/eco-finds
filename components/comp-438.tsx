'use client'

import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    icon: HouseIcon,
    label: "Dashboard"
  },
  {
    href: "/products",
    icon: PanelsTopLeftIcon,
    label: "Products"
  },
  {
    href: "/profile",
    icon: BoxIcon,
    label: "Profile"
  }
]

export default function NavDock() {
  const pathname = usePathname()

  return (
    <nav className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex h-auto p-0 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex-col rounded-none px-4 py-3 text-xs flex items-center flex-1",
                "after:absolute after:inset-x-0 after:top-0 after:h-0.5",
                isActive
                  ? "after:bg-primary bg-transparent shadow-none text-primary"
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <Icon
                className="mb-1.5"
                size={18}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
