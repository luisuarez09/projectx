import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Building2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ROLE_META } from "@/pages/settings/users/_mock"

export function UserAvatar({ name = "", size = "sm" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase()
  const palettes = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ]
  const color = palettes[(name.charCodeAt(0) || 0) % palettes.length]
  const sz = size === "lg" ? "h-12 w-12 text-base" : size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs"
  return (
    <div className={`${sz} ${color} flex shrink-0 items-center justify-center rounded-full font-semibold`}>
      {initials || "?"}
    </div>
  )
}

export const userRoleOptions = Object.entries(ROLE_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const userStatusOptions = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
]

export function getUserColumns({ onDelete, onToggleStatus }) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Seleccionar todos"
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
    {
      id: "user",
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        const { name, email } = row.original
        return (
          <div className="flex items-center gap-3">
            <UserAvatar name={name} />
            <div className="min-w-0">
              <div className="truncate font-medium">{name}</div>
              <div className="truncate text-xs text-muted-foreground">{email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Rol en la firma",
      cell: ({ getValue }) => {
        const role = getValue()
        const meta = ROLE_META[role]
        if (!meta) return <span className="text-muted-foreground">{role}</span>
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
            {meta.label}
          </span>
        )
      },
      filterFn: (row, _id, filterValues) => {
        if (!filterValues?.length) return true
        return filterValues.includes(row.getValue("role"))
      },
    },
    {
      id: "companies",
      header: "Empresas",
      cell: ({ row }) => {
        const count = (row.original.companies || []).length
        if (count === 0) return <span className="text-xs text-muted-foreground">Sin acceso</span>
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            {count} empresa{count !== 1 ? "s" : ""}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "isActive",
      header: "Estatus",
      cell: ({ getValue }) => {
        const active = getValue()
        return active ? (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Inactivo
          </span>
        )
      },
      filterFn: (row, _id, filterValues) => {
        if (!filterValues?.length) return true
        const status = row.original.isActive ? "Activo" : "Inactivo"
        return filterValues.includes(status)
      },
    },
    {
      accessorFn: (row) => `${row.name} ${row.email}`.toLowerCase(),
      id: "query",
      header: "query",
      enableHiding: true,
      enableSorting: false,
      cell: () => null,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <RowActions row={row} onDelete={onDelete} onToggleStatus={onToggleStatus} />,
      size: 40,
    },
  ]
}

function RowActions({ row, onDelete, onToggleStatus }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const { id, name, isActive } = row.original

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/settings/users/${id}`)}>
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/settings/users/${id}/edit`)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onToggleStatus?.(id)}>
            {isActive ? "Desactivar usuario" : "Activar usuario"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setConfirm(true)}>
            Eliminar…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{name}</strong> y perderá acceso a todas las empresas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete?.(id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
