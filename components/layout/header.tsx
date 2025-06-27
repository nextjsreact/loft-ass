"use client"

import { Menu, Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import type { User } from "@/lib/database"

import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between bg-gray-900 px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center">
        <Building2 className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-semibold text-white">LoftManager</span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-gray-900 p-0">
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}