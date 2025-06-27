import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import "./globals.css"
import { getSession } from "@/lib/auth.ts"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Loft Management System",
  description: "Professional SaaS platform for managing loft properties",
    generator: 'v0.dev'
}

import { ThemeProvider } from "@/components/theme-provider"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body /* className={inter.className} */>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body /* className={inter.className} */>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen bg-background">
            <div className="hidden md:flex">
              <Sidebar user={session.user} />
            </div>
            <div className="flex flex-1 flex-col">
              <Header user={session.user} />
              <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8">{children}</div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
