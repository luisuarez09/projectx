import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListFilter, SlidersHorizontal, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { userRoleOptions, userStatusOptions } from "./columns"

export default function UsersDataTable({ columns, data, onAdd }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({ query: false })
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(25)
  const [q, setQ] = useState("")

  const tableData = useMemo(() => {
    if (!q) return data
    const k = q.toLowerCase()
    return data.filter((r) =>
      `${r.name} ${r.email}`.toLowerCase().includes(k)
    )
  }, [data, q])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const roleColumn = table.getColumn("role")
  const statusColumn = table.getColumn("isActive")
  const activeRoles = roleColumn?.getFilterValue() || []
  const activeStatuses = statusColumn?.getFilterValue() || []

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar por nombre o correo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full min-w-[220px] sm:w-[300px]"
          />

          <FilterGroup
            label="Rol"
            options={userRoleOptions}
            values={activeRoles}
            onChange={(next) => roleColumn.setFilterValue(next)}
          />

          <FilterGroup
            label="Estatus"
            options={userStatusOptions}
            values={activeStatuses}
            onChange={(next) => statusColumn.setFilterValue(next)}
          />

          {(activeRoles.length > 0 || activeStatuses.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                roleColumn.setFilterValue([])
                statusColumn.setFilterValue([])
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((col) => !["select", "actions", "query"].includes(col.id))
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {col.columnDef.header || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onAdd}>Nuevo usuario</Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="h-10">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-3 text-left align-middle font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Sin usuarios encontrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} seleccionado(s) de {table.getFilteredRowModel().rows.length}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Por página</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

          <div className="text-sm">
            Pág. {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ label, options, values = [], onChange }) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ListFilter className="h-4 w-4" />
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={values.includes(opt.value)}
              onCheckedChange={(v) =>
                onChange(v ? [...values, opt.value] : values.filter((x) => x !== opt.value))
              }
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={values.length === 0} onCheckedChange={() => onChange([])}>
            Limpiar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-wrap items-center gap-1">
        {values.map((v) => {
          const opt = options.find((o) => o.value === v)
          return (
            <Badge key={v} variant="secondary" className="gap-1">
              {opt?.label || v}
              <button onClick={() => onChange(values.filter((x) => x !== v))}>
                <X className="ml-1 h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
