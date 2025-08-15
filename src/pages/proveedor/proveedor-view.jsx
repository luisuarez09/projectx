import { useMemo, useState } from "react"
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
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ChevronDown, Plus, Filter, Columns2, Search, Phone, Mail, MapPin, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { Toaster, toast } from "sonner"

/**
 * Lista de Proveedores
 * - Basada en la tabla de compras, adaptada a campos de proveedor
 * - Ordenable, filtrable, paginada y responsive
 * - Acciones rápidas: Ver, Editar, Eliminar
 * - Botón: Registrar proveedor (navega a /proveedores/new o usa creación rápida)
 */

const SAMPLE_SUPPLIERS = [
  {
    id: "prov-001",
    name: "Papelería El Sol, C.A.",
    rif: "J123456789",
    phone: "+58 414-1234567",
    email: "contacto@elsol.com",
    state: "Zulia",
    city: "Maracaibo",
    status: "Activo",
  },
  {
    id: "prov-002",
    name: "Distribuidora Andina, C.A.",
    rif: "J876543210",
    phone: "+58 424-7654321",
    email: "ventas@andina.com",
    state: "Distrito Capital",
    city: "Caracas",
    status: "Activo",
  },
  {
    id: "prov-003",
    name: "Servicios Globales, S.R.L.",
    rif: "J112233445",
    phone: "+58 412-1122334",
    email: "info@servglobal.com",
    state: "Carabobo",
    city: "Valencia",
    status: "Inactivo",
  },
]

const STATUSES = ["Activo", "Inactivo"]

function useSortedFiltered({ data, query, status, state, sortKey, sortDir }) {
  return useMemo(() => {
    let rows = [...data]

    if (status && status !== "todos") rows = rows.filter((r) => r.status === status)
    if (state && state !== "todos") rows = rows.filter((r) => r.state === state)

    if (query) {
      const q = query.toLowerCase()
      rows = rows.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.rif.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q)
      )
    }

    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    }

    return rows
  }, [data, query, status, state, sortKey, sortDir])
}

export default function ProveedoresIndex() {
  // Filtros
  const [status, setStatus] = useState("todos")
  const [state, setState] = useState("todos")
  const [query, setQuery] = useState("")

  // Orden / Paginación
  const [sortKey, setSortKey] = useState("name")
  const [sortDir, setSortDir] = useState("asc")
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Visibilidad de columnas
  const [cols, setCols] = useState({ rif: true, phone: true, email: true, location: true, status: true })

  const data = useSortedFiltered({ data: SAMPLE_SUPPLIERS, query, status, state, sortKey, sortDir })

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const pageData = data.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  function handleDelete(id) {
    toast("Proveedor eliminado", { description: `ID: ${id}` })
    // TODO: eliminar en API/estado global
  }

  return (
    <div className="flex flex-col gap-4">
      <Toaster richColors position="bottom-right" />

      {/* Encabezado */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Proveedores</CardTitle>
          <CardDescription>Directorio de proveedores. Gestiona contactos, estatus y datos fiscales.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            {/* Acciones principales */}
            <div className="flex flex-wrap items-center gap-2">
              <Button className="gap-2" onClick={() => toast.info("Ir a crear proveedor (/proveedores/new)") }>
                <Plus className="h-4 w-4" /> Registrar proveedor
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" /> Buscar
                  </label>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre / RIF / Email / Teléfono" />
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
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {["Zulia","Distrito Capital","Carabobo","Lara","Anzoátegui","Aragua","Bolívar"].map((st) => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Acciones</label>
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
                          { key: "phone", label: "Teléfono" },
                          { key: "email", label: "Email" },
                          { key: "location", label: "Ubicación" },
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
                  <HeadCell onClick={() => toggleSort("name")} label="Proveedor" sortKey={sortKey} sortDir={sortDir} myKey="name" />
                  {cols.rif && <HeadCell onClick={() => toggleSort("rif")} label="RIF" sortKey={sortKey} sortDir={sortDir} myKey="rif" />}
                  {cols.phone && <TableHead className="hidden sm:table-cell">Teléfono</TableHead>}
                  {cols.email && <TableHead className="hidden lg:table-cell">Email</TableHead>}
                  {cols.location && <TableHead className="hidden md:table-cell">Ubicación</TableHead>}
                  {cols.status && <TableHead className="hidden sm:table-cell">Estatus</TableHead>}
                  <TableHead className="w-[1%]"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50">
                    <TableCell className="min-w-[260px]">
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.email}</span>
                      </div>
                    </TableCell>
                    {cols.rif && <TableCell className="whitespace-nowrap">{formatRif(r.rif)}</TableCell>}
                    {cols.phone && <TableCell className="hidden sm:table-cell whitespace-nowrap">{r.phone}</TableCell>}
                    {cols.email && <TableCell className="hidden lg:table-cell">{r.email}</TableCell>}
                    {cols.location && (
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {r.city}, {r.state}
                        </div>
                      </TableCell>
                    )}
                    {cols.status && (
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={r.status} />
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <RowActions id={r.id} onDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
                {pageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                      No hay proveedores para los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{pageData.length}</span> de {data.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>«</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>←</Button>
              <span className="text-sm">Página <span className="font-medium">{page}</span> de {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet de vista rápida (placeholder) */}
      <QuickViewSheet />
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
  const map = { Activo: "success", Inactivo: "secondary" }
  const variant = map[status] || "secondary"
  const colors = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
  }
  return <Badge variant="outline" className={`${colors[variant]} font-normal`}>{status}</Badge>
}

function RowActions({ id, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <button className="w-full text-left px-2 py-1.5 hover:bg-muted flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4" /> Ver
        </button>
        <button className="w-full text-left px-2 py-1.5 hover:bg-muted flex items-center gap-2 text-sm">
          <Pencil className="h-4 w-4" /> Editar
        </button>
        <Separator className="my-1" />
        <button onClick={() => onDelete?.(id)} className="w-full text-left px-2 py-1.5 hover:bg-muted flex items-center gap-2 text-sm text-red-600">
          <Trash2 className="h-4 w-4" /> Eliminar
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function QuickViewSheet() {
  // Placeholder para cuando conectemos Ver -> abre vista rápida del proveedor
  return (
    <Sheet>
      <SheetTrigger asChild>
        <span className="sr-only">Abrir vista rápida</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Vista rápida de proveedor</SheetTitle>
          <SheetDescription>Conecta este panel al proveedor seleccionado.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

function formatRif(rif) {
  // Normaliza visualmente sin guiones: J123456789 -> J-12345678-9 si calza
  const m = rif.match(/^([VEJPG]{1})(\d{8})(\d)$/i)
  if (!m) return rif
  return `${m[1].toUpperCase()}-${m[2]}-${m[3]}`
}
