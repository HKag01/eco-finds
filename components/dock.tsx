'use client'

import { ShoppingCartIcon, HouseIcon, UserCircleIcon  } from "@phosphor-icons/react";
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavDockProps {
  isAuthenticated?: boolean
}

const navItems = [
  {
    href: "/",
    icon: HouseIcon,
    label: "Home",
  },
  {
    href: "/cart",
    icon: ShoppingCartIcon,
    label: "Cart",
  },
  {
    href: "/profile",
    icon: UserCircleIcon,
    label: "Profile",
  },
];

export default function NavDock({ isAuthenticated = false }: NavDockProps) {
  const pathname = usePathname()

  // Function to handle navigation for unauthenticated users
  const getNavigationHref = (href: string) => {
    if (!isAuthenticated && (href === '/cart' || href === '/profile')) {
      return `/login?redirect=${href}`
    }
    return href
  }

  return (
    <nav className="border-t bg-background w-full">
      <div className="flex h-auto p-0 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={getNavigationHref(item.href)}
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
                weight={isActive ? "fill" : "regular"}
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
