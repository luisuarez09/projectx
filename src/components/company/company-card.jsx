import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function CompanyCard({ company, onDelete }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const svc = company.services || {}
  const services = [
    svc.accounting && "Contabilidad",
    svc.taxes && "Impuestos",
    svc.parafiscales && "Parafiscales",
    svc.payroll && "Nómina",
  ].filter(Boolean)

  const daysLeft = company.board?.validityUntil
    ? Math.ceil((new Date(company.board.validityUntil) - new Date()) / (1000*60*60*24))
    : null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg border bg-muted">
            {company.basic?.logoUrl || company.basic?.logoDataUrl ? (
              <img
                src={company.basic.logoUrl || company.basic.logoDataUrl}
                alt={company.basic.tradeName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Logo</div>
            )}
          </div>
          <div className="mr-auto">
            <div className="font-medium leading-none">{company.basic?.tradeName || company.basic?.legalName}</div>
            <div className="text-xs text-muted-foreground">
              {company.basic?.legalName} · RIF {company.basic?.rif || "—"}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/settings/company/${company.id}`)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)} className="text-destructive">
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Resumen */}
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {services.length ? services.map((s) => <Badge key={s} variant="secondary">{s}</Badge>) : <span className="text-muted-foreground">Sin servicios activos</span>}
          </div>

          {company.board?.validityUntil && (
            <div className="text-xs text-muted-foreground">
              Vigencia de acta: <span className="font-medium">{company.board.validityUntil}</span>
              {Number.isFinite(daysLeft) && (
                <> · {daysLeft >= 0 ? `${daysLeft} días restantes` : `vencida hace ${Math.abs(daysLeft)} días`}</>
              )}
            </div>
          )}
        </div>

        {/* Footer acciones */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(`/settings/company/${company.id}`)}>Editar</Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar empresa</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará <b>{company.basic?.tradeName || company.basic?.legalName}</b> y todos sus datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete?.(company.id)}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}