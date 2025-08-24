import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import AuthSessionProvider from "@/components/auth/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ESM Platform - Enterprise Service Management",
  description: "Comprehensive enterprise service management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
