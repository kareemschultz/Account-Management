"use client"
import { format } from "date-fns"
import { CalendarIcon, User, Shield, Server, Wifi, Cog, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { users } from "@/lib/data"

interface AuditFiltersProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  user: string
  setUser: (user: string) => void
  actionType: string
  setActionType: (action: string) => void
  onReset: () => void
}

const actionTypeIcons = {
  USER_MANAGEMENT: User,
  SECURITY: Shield,
  SERVICE_UPDATE: Server,
  VPN_CONFIG: Wifi,
  SYSTEM: Cog,
}

export function AuditFilters({ date, setDate, user, setUser, actionType, setActionType, onReset }: AuditFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-transparent",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={user} onValueChange={setUser}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.name}>
                  {u.name}
                </SelectItem>
              ))}
              <SelectItem value="System">System</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Action Types</SelectItem>
              {Object.entries(actionTypeIcons).map(([type, Icon]) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    {type.replace("_", " ")}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
