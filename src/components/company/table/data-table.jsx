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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { companyStatuses, companyServices } from "./columns"
import { ListFilter, SlidersHorizontal, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"

export default function CompanyDataTable({ columns, data, onAdd, onDelete }) {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({ query: false })
    const [rowSelection, setRowSelection] = useState({})
    const [pageSize, setPageSize] = useState(25)
    const [q, setQ] = useState("")

    const tableData = useMemo(() => {
        if (!q) return data
        const k = q.toLowerCase()
        return data.filter((r) => {
            const query = `${r?.basic?.tradeName || ""} ${r?.basic?.legalName || ""} ${r?.basic?.rif || ""}`.toLowerCase()
            return query.includes(k)
        })
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

    // Helpers filtros
    const statusColumn = table.getColumn("status")
    const servicesColumn = table.getColumn("services")
    const activeStatuses = statusColumn?.getFilterValue() || []
    const activeServices = servicesColumn?.getFilterValue() || []

    function clearFilters() {
        setColumnFilters((prev) => prev.filter((f) => !["status", "services"].includes(f.id)))
    }

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Izquierda: búsqueda + grupos de filtros */}
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Input
                        placeholder="Buscar por nombre o RIF…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full min-w-[220px] sm:w-[300px]"
                    />

                    {/* Grupo: Estatus */}
                    <FilterGroup
                        label="Estatus"
                        options={[
                            { value: "Activa", label: "Activa" },
                            { value: "Inactiva", label: "Inactiva" },
                            { value: "Suspendida", label: "Suspendida" },
                        ]}
                        values={activeStatuses}
                        onChange={(next) => statusColumn.setFilterValue(next)}
                    />

                    {/* Grupo: Servicios */}
                    <FilterGroup
                        label="Servicios"
                        options={[
                            { value: "accounting", label: "Contabilidad" },
                            { value: "taxes", label: "Impuestos" },
                            { value: "parafiscales", label: "Parafiscales" },
                            { value: "payroll", label: "Nómina" },
                        ]}
                        values={activeServices}
                        onChange={(next) => servicesColumn.setFilterValue(next)}
                    />

                    {(activeStatuses.length > 0 || activeServices.length > 0) && (
                        <Button variant="ghost" size="sm" onClick={() => { statusColumn.setFilterValue([]); servicesColumn.setFilterValue([]) }}>
                            Reset
                        </Button>
                    )}
                </div>

                {/* Derecha: View + Nuevo */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                View
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

                    <Button onClick={onAdd}>Registrar empresa</Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="[&_tr]:border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="h-10">
                                {headerGroup.headers.map((header) => (
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
                                <tr key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className="border-b last:border-0">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-3 py-2 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Sin resultados…
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    {Object.keys(rowSelection).length} seleccionada(s) de {table.getFilteredRowModel().rows.length}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Rows per page</span>
                        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                            <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

                    <div className="text-sm">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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

function FilterGroup({ label, icon: Icon, options, values = [], onChange }) {
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

            {/* Chips pegados al botón */}
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
