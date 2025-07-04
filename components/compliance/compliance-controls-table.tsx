"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ComplianceControl } from "@/lib/types"
import { FileText, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const getStatusVariant = (status: ComplianceControl["status"]) => {
  switch (status) {
    case "Compliant":
      return "success"
    case "In Progress":
      return "warning"
    case "Non-Compliant":
      return "destructive"
    default:
      return "secondary"
  }
}

const columns: ColumnDef<ComplianceControl>[] = [
  {
    accessorKey: "name",
    header: "Control",
    cell: ({ row }) => {
      const control = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{control.name}</span>
          <span className="text-xs text-muted-foreground">{control.id}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ComplianceControl["status"]
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "lastReviewed",
    header: "Last Reviewed",
  },
  {
    accessorKey: "evidenceCount",
    header: "Evidence",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        {row.getValue("evidenceCount")}
      </Button>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Update Status</DropdownMenuItem>
          <DropdownMenuItem>Upload Evidence</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ComplianceControlsTable({ data }: { data: ComplianceControl[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
                No controls found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
