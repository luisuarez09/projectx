import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, Plus, Filter, Columns2, Calendar, Search, Upload, UserPlus } from "lucide-react"
import { Toaster, toast } from "sonner"

/**
 * Vista principal del módulo de Compras.
 * Cambios solicitados:
 * - Un solo botón "Registrar documento". Dentro del diálogo se elige el tipo (por defecto Factura).
 * - Botón "Importar por lotes" al lado (placeholder para futuro Excel/OCR).
 * - Form con Base Imponible, Monto Exento; auto-calcula IVA 16% y Total.
 * - Búsqueda de proveedor en "BD" (mock) y opción de crearlo si no existe.
 * - Interfaz rápida para captura masiva y totalmente responsive.
 */

const SAMPLE_DATA = [
  {
    id: "CMP-0001",
    date: "2025-08-02",
    period: "2025-08",
    number: "F-000145",
    type: "Factura",
    supplierName: "Papelería El Sol, C.A.",
    rif: "J-12345678-9",
    status: "Pendiente",
    currency: "USD",
    subtotal: 120.0,
    tax: 19.2,
    total: 139.2,
  },
  {
    id: "CMP-0002",
    date: "2025-08-05",
    period: "2025-08",
    number: "NC-0042",
    type: "Nota de Crédito",
    supplierName: "Distribuidora Andina, C.A.",
    rif: "J-87654321-0",
    status: "Aplicada",
    currency: "USD",
    subtotal: -20.0,
    tax: -3.2,
    total: -23.2,
  },
  {
    id: "CMP-0003",
    date: "2025-07-28",
    period: "2025-07",
    number: "NE-1020",
    type: "Nota de Entrega",
    supplierName: "Servicios Globales, S.R.L.",
    rif: "J-11223344-5",
    status: "Por Facturar",
    currency: "VES",
    subtotal: 950.0,
    tax: 0,
    total: 950.0,
  },
  {
    id: "CMP-0004",
    date: "2025-08-09",
    period: "2025-08",
    number: "F-000146",
    type: "Factura",
    supplierName: "Tecnologías Orion, C.A.",
    rif: "J-22334455-6",
    status: "Pagada",
    currency: "USD",
    subtotal: 480.0,
    tax: 76.8,
    total: 556.8,
  },
  {
    id: "CMP-0005",
    date: "2025-08-10",
    period: "2025-08",
    number: "F-000147",
    type: "Factura",
    supplierName: "Farmacia La Salud, C.A.",
    rif: "J-99887766-5",
    status: "Pendiente",
    currency: "VES",
    subtotal: 12800.0,
    tax: 2048.0,
    total: 14848.0,
  },
]

const STATUSES = ["Pendiente", "Pagada", "Aplicada", "Por Facturar", "Anulada"]
const TYPES = ["Factura", "Nota de Crédito", "Nota de Entrega"]

// Mock de proveedores (cuando conectemos a DB, se reemplaza por fetch/rtk-query)
const SUPPLIERS = [
  { id: "prov-1", name: "Papelería El Sol, C.A.", rif: "J-12345678-9" },
  { id: "prov-2", name: "Distribuidora Andina, C.A.", rif: "J-87654321-0" },
  { id: "prov-3", name: "Tecnologías Orion, C.A.", rif: "J-22334455-6" },
]

function currencyFormat(n, currency = "USD", locale = "es-VE") {
  if (Number.isNaN(Number(n))) return ""
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(n))
}

function useSortedFilteredData({ data, query, type, status, period, sortKey, sortDir }) {
  return useMemo(() => {
    let rows = [...data]

    // Filtros
    if (period && period !== "todos") rows = rows.filter((r) => r.period === period)
    if (type && type !== "todos") rows = rows.filter((r) => r.type === type)
    if (status && status !== "todos") rows = rows.filter((r) => r.status === status)
    if (query) {
      const q = query.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q) ||
          r.rif.toLowerCase().includes(q)
      )
    }

    // Ordenamiento
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (sortKey === "date") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
        if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }

    return rows
  }, [data, query, type, status, period, sortKey, sortDir])
}

export default function ComprasIndex() {
  const navigate = useNavigate()

  // Estado filtros
  const [period, setPeriod] = useState("2025-08")
  const [type, setType] = useState("todos")
  const [status, setStatus] = useState("todos")
  const [query, setQuery] = useState("")

  // Estado tabla
  const [sortKey, setSortKey] = useState("date")
  const [sortDir, setSortDir] = useState("desc")
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Visibilidad de columnas (además de las clases responsive hidden)
  const [cols, setCols] = useState({ rif: true, currency: true, subtotal: true, tax: true, status: true })

  const data = useSortedFilteredData({ data: SAMPLE_DATA, query, type, status, period, sortKey, sortDir })

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

  function handleSaved(doc) {
    toast.success(`${doc.type} registrada correctamente`)
    // TODO: push al estado global cuando conectemos a la API
  }

  // Periodos simulados (últimos 6 meses)
  const periods = ["2025-08", "2025-07", "2025-06", "2025-05", "2025-04", "2025-03"]

  return (
    <div className="flex flex-col gap-4">
      <Toaster richColors position="bottom-right" />

      {/* Encabezado */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Compras</CardTitle>
          <CardDescription>
            Registro de documentos de compra por período de imposición (mensual). Selecciona el período para ver
            las compras registradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            {/* Acciones principales */}
            <div className="flex flex-wrap items-center gap-2">
              <Button className="gap-2" onClick={() => navigate("/facturas/compras/new")}>
                <Plus className="h-4 w-4" /> Registrar documento
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info("Importación por lotes estará disponible en breve (Excel/OCR)")}
              >
                <Upload className="h-4 w-4" /> Importar por lotes
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
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
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
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" /> Buscar
                  </label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Proveedor / RIF / N° documento"
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
                  <HeadCell onClick={() => toggleSort("number")} label="N° Doc" sortKey={sortKey} sortDir={sortDir} myKey="number" />
                  <HeadCell onClick={() => toggleSort("type")} label="Tipo" sortKey={sortKey} sortDir={sortDir} myKey="type" />
                  <HeadCell onClick={() => toggleSort("supplierName")} label="Proveedor" sortKey={sortKey} sortDir={sortDir} myKey="supplierName" />
                  {cols.rif && <TableHead className="hidden md:table-cell">RIF</TableHead>}
                  {cols.currency && <TableHead className="hidden sm:table-cell">Moneda</TableHead>}
                  {cols.subtotal && <HeadCell className="hidden lg:table-cell" onClick={() => toggleSort("subtotal")} label="Subtotal" sortKey={sortKey} sortDir={sortDir} myKey="subtotal" />}
                  {cols.tax && <HeadCell className="hidden xl:table-cell" onClick={() => toggleSort("tax")} label="Impuesto" sortKey={sortKey} sortDir={sortDir} myKey="tax" />}
                  <HeadCell onClick={() => toggleSort("total")} label="Total" sortKey={sortKey} sortDir={sortDir} myKey="total" />
                  {cols.status && <TableHead className="hidden sm:table-cell">Estatus</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                    <TableCell className="font-medium">{r.number}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell className="min-w-[220px]">{r.supplierName}</TableCell>
                    {cols.rif && <TableCell className="hidden md:table-cell">{r.rif}</TableCell>}
                    {cols.currency && <TableCell className="hidden sm:table-cell">{r.currency}</TableCell>}
                    {cols.subtotal && (
                      <TableCell className="hidden lg:table-cell text-right">
                        {currencyFormat(r.subtotal, r.currency)}
                      </TableCell>
                    )}
                    {cols.tax && (
                      <TableCell className="hidden xl:table-cell text-right">
                        {currencyFormat(r.tax, r.currency)}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-semibold">{currencyFormat(r.total, r.currency)}</TableCell>
                    {cols.status && (
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={r.status} />
                      </TableCell>
                    )}
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
    <TableHead
      onClick={onClick}
      className={`cursor-pointer select-none ${className}`}
      title="Ordenar"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-xs opacity-60">{is ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
      </div>
    </TableHead>
  )
}

function StatusBadge({ status }) {
  const map = {
    Pendiente: "warning",
    Pagada: "success",
    Aplicada: "info",
    "Por Facturar": "secondary",
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

function RegisterDocumentDialog({ onSaved }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("Factura")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [number, setNumber] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [supplierQuery, setSupplierQuery] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [base, setBase] = useState("")
  const [exempt, setExempt] = useState("")

  const rate = 0.16 // 16%
  const baseNum = Number(base) || 0
  const exemptNum = Number(exempt) || 0
  const tax = +(baseNum * rate).toFixed(2)
  const total = +(baseNum + exemptNum + tax).toFixed(2)

  function resetForm() {
    setType("Factura"); setDate(new Date().toISOString().slice(0, 10)); setNumber(""); setCurrency("USD")
    setSupplierQuery(""); setSelectedSupplier(null); setBase(""); setExempt("")
  }

  function handleSave() {
    if (!selectedSupplier) {
      toast.error("Selecciona o crea un proveedor")
      return
    }
    const doc = { type, date, number, currency, supplier: selectedSupplier, base: baseNum, exempt: exemptNum, tax, total }
    onSaved?.(doc)
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Registrar documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar documento</DialogTitle>
          <DialogDescription>Completa los campos. El IVA se calcula automáticamente (16%).</DialogDescription>
        </DialogHeader>

        {/* Fila 1: Tipo, Fecha, N° Doc */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">N° Documento</label>
            <Input placeholder="Ej: F-000148" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
        </div>

        {/* Proveedor */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Proveedor</label>
          <SupplierPicker
            query={supplierQuery}
            setQuery={setSupplierQuery}
            value={selectedSupplier}
            onChange={setSelectedSupplier}
          />
        </div>

        {/* Moneda y totales */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1 sm:col-span-1">
            <label className="text-sm font-medium">Moneda</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="VES">VES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Base imponible</label>
            <Input inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value.replace(/,/g, '.'))} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Monto exento</label>
            <Input inputMode="decimal" value={exempt} onChange={(e) => setExempt(e.target.value.replace(/,/g, '.'))} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">IVA (16%)</label>
            <Input value={tax.toFixed(2)} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium">Total</label>
            <Input value={total.toFixed(2)} readOnly />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {currencyFormat(total, currency)}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SupplierPicker({ query, setQuery, value, onChange }) {
  const matches = useMemo(() => {
    if (!query) return SUPPLIERS
    const q = query.toLowerCase()
    return SUPPLIERS.filter((s) => s.name.toLowerCase().includes(q) || s.rif.toLowerCase().includes(q))
  }, [query])

  const showCreate = query && matches.length === 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex gap-2">
          <Input
            value={value ? `${value.name} (${value.rif})` : query}
            onChange={(e) => { onChange(null); setQuery(e.target.value) }}
            placeholder="Buscar por nombre o RIF"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
        <div className="flex flex-col gap-2">
          {matches.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange(s)}
              className="text-left px-2 py-1 rounded hover:bg-muted"
            >
              {s.name} <span className="text-muted-foreground">({s.rif})</span>
            </button>
          ))}
          {showCreate && (
            <button
              onClick={() => {
                const newSupplier = { id: crypto.randomUUID(), name: query, rif: "" }
                onChange(newSupplier)
                toast.success("Proveedor creado (borrador)")
              }}
              className="flex items-center gap-2 px-2 py-1 rounded border hover:bg-muted"
            >
              <UserPlus className="h-4 w-4" /> Crear proveedor "{query}"
            </button>
          )}
          {!showCreate && matches.length === 0 && (
            <div className="text-sm text-muted-foreground px-2">Escribe para buscar o crear</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function formatDate(iso) {
  // Mostrar DD/MM/AAAA
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
