import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calendar, ChevronDown, Columns2, Filter, Search, FilePlus2, Printer, CircleDollarSign } from "lucide-react"
import { Toaster, toast } from "sonner"

/**
 * Pantalla de Ventas (Listado de facturas)
 * Inspirada en la vista de Compras. Muestra facturas ya procesadas y permite filtrar,
 * buscar, ordenar y navegar al detalle. Diseño responsive, con control de columnas.
 */

const SAMPLE_SALES = [
  {
    id: "VEN-0001",
    date: "2025-08-04",
    number: "FV-000321",
    customerName: "Inversiones Los Llanos, C.A.",
    rif: "J-10293847-6",
    status: "Emitida",
    currency: "USD",
    subtotal: 250.0,
    tax: 40.0,
    total: 290.0,
    collected: 0.0,
  },
  {
    id: "VEN-0002",
    date: "2025-08-06",
    number: "FV-000322",
    customerName: "Clínica Santa María, C.A.",
    rif: "J-55443322-1",
    status: "Parcial",
    currency: "USD",
    subtotal: 480.0,
    tax: 76.8,
    total: 556.8,
    collected: 300.0,
  },
  {
    id: "VEN-0003",
    date: "2025-07-29",
    number: "FV-000319",
    customerName: "Servicios Atlántida, S.R.L.",
    rif: "J-66778899-0",
    status: "Pagada",
    currency: "VES",
    subtotal: 14200.0,
    tax: 2272.0,
    total: 16472.0,
    collected: 16472.0,
  },
  {
    id: "VEN-0004",
    date: "2025-08-10",
    number: "FV-000323",
    customerName: "TecnoMundo, C.A.",
    rif: "J-11223344-5",
    status: "Emitida",
    currency: "USD",
    subtotal: 120.0,
    tax: 19.2,
    total: 139.2,
    collected: 0.0,
  },
  {
    id: "VEN-0005",
    date: "2025-08-12",
    number: "FV-000324",
    customerName: "Panadería Central, C.A.",
    rif: "J-22334455-6",
    status: "Anulada",
    currency: "USD",
    subtotal: 0,
    tax: 0,
    total: 0,
    collected: 0,
  },
]

const STATUSES = ["Emitida", "Por Cobrar", "Parcial", "Pagada", "Anulada"]

function currencyFormat(n, currency = "USD", locale = "es-VE") {
  if (Number.isNaN(Number(n))) return ""
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(n))
}

function useSortedFilteredData({ data, query, status, period, sortKey, sortDir }) {
  return useMemo(() => {
    let rows = data.map((r) => ({ ...r, balance: +(r.total - (r.collected || 0)).toFixed(2) }))

    // Filtros
    if (period && period !== "todos") rows = rows.filter((r) => formatPeriod(r.date) === period)
    if (status && status !== "todos") rows = rows.filter((r) => r.status === status)
    if (query) {
      const q = query.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.rif.toLowerCase().includes(q)
      )
    }

    // Ordenamiento
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (sortKey === "date") return sortDir === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }

    return rows
  }, [data, query, status, period, sortKey, sortDir])
}

export default function VentasIndex() {
  // Estado filtros
  const [period, setPeriod] = useState("2025-08")
  const [status, setStatus] = useState("todos")
  const [query, setQuery] = useState("")

  // Estado tabla
  const [sortKey, setSortKey] = useState("date")
  const [sortDir, setSortDir] = useState("desc")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Visibilidad de columnas
  const [cols, setCols] = useState({ rif: true, currency: true, subtotal: true, tax: true, collected: true, balance: true, status: true })

  const data = useSortedFilteredData({ data: SAMPLE_SALES, query, status, period, sortKey, sortDir })

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const pageData = data.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  // Periodos simulados (últimos 6 meses)
  const periods = ["2025-08", "2025-07", "2025-06", "2025-05", "2025-04", "2025-03"]

  return (
    <div className="flex flex-col gap-4">
      <Toaster richColors position="bottom-right" />

      {/* Encabezado */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Ventas</CardTitle>
          <CardDescription>
            Facturas de venta procesadas por período. Filtra, busca y navega al detalle de cada documento.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            {/* Acciones principales */}
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild className="gap-2">
                <a href="/invoices/ventas/new">
                  <FilePlus2 className="h-4 w-4" /> Crear factura
                </a>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info("Registrar cobro rápido estará disponible pronto")}
              >
                <CircleDollarSign className="h-4 w-4" /> Registrar cobro
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Período
                  </label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Estatus</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" /> Buscar
                  </label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cliente / RIF / N° factura"
                  />
                </div>
              </div>

              {/* Columna: opciones */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" /> Más filtros <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Visibilidad de columnas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[
                      { key: "rif", label: "RIF" },
                      { key: "currency", label: "Moneda" },
                      { key: "subtotal", label: "Subtotal" },
                      { key: "tax", label: "Impuesto" },
                      { key: "collected", label: "Cobrado" },
                      { key: "balance", label: "Saldo" },
                      { key: "status", label: "Estatus" },
                    ].map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.key}
                        checked={cols[c.key]}
                        onCheckedChange={(v) => setCols((prev) => ({ ...prev, [c.key]: Boolean(v) }))}
                      >
                        {c.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Columns2 className="h-4 w-4" /> Vista <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opciones de tabla</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>Fijar encabezado</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked>Compacta</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <HeadCell onClick={() => toggleSort("date")} label="Fecha" sortKey={sortKey} sortDir={sortDir} myKey="date" />
                  <HeadCell onClick={() => toggleSort("number")} label="N° Factura" sortKey={sortKey} sortDir={sortDir} myKey="number" />
                  <HeadCell onClick={() => toggleSort("customerName")} label="Cliente" sortKey={sortKey} sortDir={sortDir} myKey="customerName" />
                  {cols.rif && <TableHead className="hidden md:table-cell">RIF</TableHead>}
                  {cols.currency && <TableHead className="hidden sm:table-cell">Moneda</TableHead>}
                  {cols.subtotal && <HeadCell className="hidden lg:table-cell" onClick={() => toggleSort("subtotal")} label="Subtotal" sortKey={sortKey} sortDir={sortDir} myKey="subtotal" />}
                  {cols.tax && <HeadCell className="hidden xl:table-cell" onClick={() => toggleSort("tax")} label="Impuesto" sortKey={sortKey} sortDir={sortDir} myKey="tax" />}
                  <HeadCell onClick={() => toggleSort("total")} label="Total" sortKey={sortKey} sortDir={sortDir} myKey="total" />
                  {cols.collected && <HeadCell className="hidden xl:table-cell" onClick={() => toggleSort("collected")} label="Cobrado" sortKey={sortKey} sortDir={sortDir} myKey="collected" />}
                  {cols.balance && <HeadCell className="hidden xl:table-cell" onClick={() => toggleSort("balance")} label="Saldo" sortKey={sortKey} sortDir={sortDir} myKey="balance" />}
                  {cols.status && <TableHead className="hidden sm:table-cell">Estatus</TableHead>}
                  <TableHead className="w-14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                    <TableCell className="font-medium">
                      <a href={`/invoices/ventas/${r.id}`} className="underline-offset-2 hover:underline">{r.number}</a>
                    </TableCell>
                    <TableCell className="min-w-[220px]">{r.customerName}</TableCell>
                    {cols.rif && <TableCell className="hidden md:table-cell">{r.rif}</TableCell>}
                    {cols.currency && <TableCell className="hidden sm:table-cell">{r.currency}</TableCell>}
                    {cols.subtotal && (
                      <TableCell className="hidden lg:table-cell text-right">{currencyFormat(r.subtotal, r.currency)}</TableCell>
                    )}
                    {cols.tax && (
                      <TableCell className="hidden xl:table-cell text-right">{currencyFormat(r.tax, r.currency)}</TableCell>
                    )}
                    <TableCell className="text-right font-semibold">{currencyFormat(r.total, r.currency)}</TableCell>
                    {cols.collected && (
                      <TableCell className="hidden xl:table-cell text-right">{currencyFormat(r.collected, r.currency)}</TableCell>
                    )}
                    {cols.balance && (
                      <TableCell className="hidden xl:table-cell text-right">{currencyFormat(r.total - r.collected, r.currency)}</TableCell>
                    )}
                    {cols.status && (
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={r.status} />
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Imprimir">
                        <a href={`/invoices/ventas/${r.id}/print`}>
                          <Printer className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      No hay registros para los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer de tabla */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{pageData.length}</span> de {data.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                «
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ←
              </Button>
              <span className="text-sm">
                Página <span className="font-medium">{page}</span> de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HeadCell({ label, sortKey, sortDir, myKey, className = "", onClick }) {
  const is = sortKey === myKey
  return (
    <TableHead onClick={onClick} className={`cursor-pointer select-none ${className}`} title="Ordenar">
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-xs opacity-60">{is ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
      </div>
    </TableHead>
  )
}

function StatusBadge({ status }) {
  const map = {
    Pagada: "success",
    Parcial: "warning",
    "Por Cobrar": "info",
    Emitida: "secondary",
    Anulada: "destructive",
  }
  const variant = map[status] || "secondary"
  const colors = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-sky-100 text-sky-800 border-sky-200",
    destructive: "bg-red-100 text-red-700 border-red-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
  }
  return <Badge variant="outline" className={`${colors[variant]} font-normal`}>{status}</Badge>
}

function formatDate(iso) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function formatPeriod(iso) {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${yyyy}-${mm}`
}
