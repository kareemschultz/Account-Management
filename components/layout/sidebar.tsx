"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  FileText,
  Network,
  UserCheck,
  Import,
  HelpCircle,
  Home,
  Bell,
  Activity,
  Database,
  Clock,
  GitBranch,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Services", href: "/services", icon: Database },
  { name: "Service Groups", href: "/services/groups", icon: UserCheck },
  { name: "Temporary Accounts", href: "/temporary-accounts", icon: Clock },
  { name: "Access Matrix", href: "/access-matrix", icon: UserCheck },
  { name: "VPN Management", href: "/vpn", icon: Network },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Audit Trail", href: "/audit-trail", icon: FileText },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Compliance Reports", href: "/compliance/reports", icon: FileText },
  { name: "Import/Export", href: "/import-export", icon: Import },
  { name: "Service Management", href: "/services/manage", icon: Settings },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GitBranch className="h-6 w-6" />
            <span className="">ESM Platform</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}
