"use client"

import { Building2, Calendar, DollarSign, Home, LogOut, Settings, Users, ClipboardList, UserCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/database"
import { logout } from "@/lib/auth"

import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User
}

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["admin", "manager", "member"] },
    { name: "Lofts", href: "/lofts", icon: Building2, roles: ["admin", "manager"] },
    { name: "Tasks", href: "/tasks", icon: ClipboardList, roles: ["admin", "manager", "member"] },
    { name: "Teams", href: "/teams", icon: Users, roles: ["admin", "manager"] },
    { name: "Owners", href: "/owners", icon: UserCheck, roles: ["admin"] },
    { name: "Transactions", href: "/transactions", icon: DollarSign, roles: ["admin", "manager"] },
    { name: "Reports", href: "/reports", icon: Calendar, roles: ["admin", "manager"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["admin", "manager", "member"] },
    { name: "Categories", href: "/settings/categories", icon: ClipboardList, roles: ["admin"] },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role))

  return (
    <div className={cn("flex h-full w-64 flex-col bg-gray-900", className)}>
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center">
          <Building2 className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-semibold text-white">LoftManager</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="flex-shrink-0 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user.full_name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}

