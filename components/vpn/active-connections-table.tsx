"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { VpnConnection } from "@/lib/data"
import { Shield } from "lucide-react"

const columns: ColumnDef<VpnConnection>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "vpnType",
    header: "VPN Type",
    cell: ({ row }) => {
      const type = row.original.vpnType
      return (
        <div className="flex items-center gap-1">
          <Shield className={`h-4 w-4 ${type === "Mikrotik" ? "text-blue-400" : "text-green-400"}`} />
          <span>{type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "group",
    header: "Group",
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "dataUsage",
    header: "Data Usage",
  },
  {
    accessorKey: "sessionDuration",
    header: "Duration",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => <Badge variant="success">Connected</Badge>,
  },
]

export function ActiveConnectionsTable({ data }: { data: VpnConnection[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Active VPN Connections</CardTitle>
        <CardDescription>Real-time view of currently connected users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No active connections.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
