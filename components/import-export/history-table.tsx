"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { DataOperationLog } from "@/lib/types"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

const getStatusVariant = (status: DataOperationLog["status"]) => {
  switch (status) {
    case "Completed":
      return "success"
    case "Processing":
      return "warning"
    case "Failed":
      return "destructive"
    default:
      return "secondary"
  }
}

const columns: ColumnDef<DataOperationLog>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const Icon = type === "Import" ? ArrowDownToLine : ArrowUpFromLine
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "dataType",
    header: "Data Type",
  },
  {
    accessorKey: "fileName",
    header: "File Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as DataOperationLog["status"]
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>
    },
  },
  {
    accessorKey: "recordsProcessed",
    header: "Records",
  },
  {
    accessorKey: "user",
    header: "Initiated By",
    cell: ({ row }) => {
      const user = row.original.user
      return user.name
    },
  },
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("timestamp")).toLocaleString(),
  },
]

export function HistoryTable({ data }: { data: DataOperationLog[] }) {
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
                No history found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
