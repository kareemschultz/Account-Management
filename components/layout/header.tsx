'use client'

import { Bell, Home, LineChart, Package, Search, Users, Shield, LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserRoles = () => {
    return session?.user?.roles || []
  }

  const hasRole = (roleName: string) => {
    return getUserRoles().some(role => role.name === roleName)
  }

  if (status === 'loading') {
    return (
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </header>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Package className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-6 w-6 text-primary" />
              <span className="sr-only">ESM Platform</span>
            </Link>
            <Link
              href="/"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/users"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
            >
              <Users className="h-5 w-5" />
              Users
            </Link>
            <Link
              href="/services"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Package className="h-5 w-5" />
              Services
            </Link>
            <Link
              href="/reports"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Reports
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users, services, assets..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <ThemeToggle />
      <Button variant="outline" size="icon" className="relative bg-transparent">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name ? getInitials(session.user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>
                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {getUserRoles().map(role => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.display_name}
                  </Badge>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div>ID: {session?.user?.employeeId}</div>
                <div>Dept: {session?.user?.department}</div>
                <div>Clearance: {session?.user?.securityClearance}</div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href={`/users/${session?.user?.id}`} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
          
          {hasRole('admin') || hasRole('super_admin') ? (
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          ) : null}
          
          {hasRole('admin') || hasRole('super_admin') || hasRole('manager') ? (
            <DropdownMenuItem asChild>
              <Link href="/audit-trail" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security Dashboard
              </Link>
            </DropdownMenuItem>
          ) : null}
          
          <DropdownMenuItem asChild>
            <Link href="/support" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Support
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
