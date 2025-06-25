import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getSession } from "@/lib/auth.ts"
import { Sidebar } from "@/components/layout/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Loft Management System",
  description: "Professional SaaS platform for managing loft properties",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    return (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar user={session.user} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
