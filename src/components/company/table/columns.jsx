import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

// Util: chips de servicios
function ServicesCell({ services = {} }) {
  const items = []
  if (services.accounting) items.push("Contabilidad")
  if (services.taxes) items.push("Impuestos")
  if (services.parafiscales) items.push("Parafiscales")
  if (services.payroll) items.push("Nómina")
  if (items.length === 0) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((s) => <Badge key={s} variant="secondary" className="whitespace-nowrap">{s}</Badge>)}
    </div>
  )
}

export const companyStatuses = ["Activa", "Inactiva", "Suspendida"]
export const companyServices = ["accounting", "taxes", "parafiscales", "payroll"]

export function getCompanyColumns({ onDelete }) {
  return [
    // selección
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Seleccionar todas"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    // columna "empresa" (logo + nombre comercial)
    {
      accessorKey: "basic.tradeName",
      id: "tradeName",
      header: "Empresa",
      cell: ({ row }) => {
        const basic = row.original.basic || {}
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-md border bg-muted">
              {basic.logoUrl || basic.logoDataUrl ? (
                <img src={basic.logoUrl || basic.logoDataUrl} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">Logo</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{basic.tradeName || basic.legalName || "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{basic.legalName || "—"}</div>
            </div>
          </div>
        )
      },
    },
    { accessorKey: "basic.rif", id: "rif", header: "RIF" },
    {
      accessorKey: "status",
      header: "Estatus",
      cell: ({ getValue }) => {
        const v = getValue()
        return <span className="text-sm">{v || "—"}</span>
      },
      filterFn: (row, _id, filterValues) => {
        if (!filterValues?.length) return true
        const current = row.getValue("status")
        return filterValues.includes(current)
      },
    },
    {
      accessorKey: "services",
      id: "services",
      header: "Servicios",
      cell: ({ row }) => <ServicesCell services={row.original.services} />,
      filterFn: (row, _id, filterValues) => {
        if (!filterValues?.length) return true
        const s = row.original.services || {}
        return filterValues.some((k) => !!s[k])
      },
    },
    {
      accessorKey: "board.validityUntil",
      id: "validityUntil",
      header: "Vigencia acta",
      cell: ({ getValue }) => {
        const v = getValue()
        return v ? <span>{v}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    // columna "oculta" para búsqueda global (nombre + rif)
    {
      accessorFn: (row) => {
        const b = row.basic || {}
        return `${b.tradeName || ""} ${b.legalName || ""} ${b.rif || ""}`.toLowerCase()
      },
      id: "query",
      header: "query",
      enableHiding: true,
      enableSorting: false,
      cell: () => null,
    },
    // acciones
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <RowActions row={row} onDelete={onDelete} />,
      size: 40,
    },
  ]
}

function RowActions({ row, onDelete }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const id = row.original.id

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/settings/company/${id}`)}>Editar</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => setConfirm(true)}>Eliminar…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará esta empresa y sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete?.(id)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}