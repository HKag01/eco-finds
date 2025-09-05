"use client";

import * as React from "react";
import { ShoppingCartIcon, HouseIcon, UserCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAuthenticated?: boolean
}

// Navigation items from NavDock
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

export function AppSidebar({ isAuthenticated = false, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  // Function to handle navigation for unauthenticated users
  const getNavigationHref = (href: string) => {
    if (!isAuthenticated && (href === '/cart' || href === '/profile')) {
      return `/login?redirect=${href}`
    }
    return href
  }

  return (
    <Sidebar collapsible="icon" {...props} className="px-4">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2">
          <Logo size="md" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} className="py-6 text-lg px-4">
                  <Link href={getNavigationHref(item.href)}>
                    <Icon
                      size={18}
                      weight={isActive ? "fill" : "regular"}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
