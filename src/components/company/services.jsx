import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookOpen,
  Calculator,
  Landmark,
  Users,
  Receipt,
  FileText,
  Banknote,
  Building,
  FileCheck,
  ClipboardList,
  Umbrella,
  HandCoins,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Catálogos ─────────────────────────────────────────────────────── */

const TAX_ITEMS = [
  {
    key: "iva",
    label: "IVA",
    desc: "Declaraciones mensuales / quincenales de IVA",
    icon: Receipt,
  },
  {
    key: "ivaRetenciones",
    label: "Retenciones IVA",
    desc: "Comprobantes de retención y archivos XML",
    icon: FileCheck,
  },
  {
    key: "islrRetenciones",
    label: "Retenciones ISLR",
    desc: "AR-I, AR-C y honorarios profesionales",
    icon: FileText,
  },
  {
    key: "igtf",
    label: "IGTF / IGP",
    desc: "Impuesto a grandes transacciones financieras",
    icon: Banknote,
  },
  {
    key: "municipales",
    label: "Impuesto municipal",
    desc: "Declaraciones ante alcaldías y municipios",
    icon: Building,
  },
]

const PAYROLL_ITEMS = [
  {
    key: "txtFaov",
    label: "Archivo TXT FAOV",
    desc: "Generación del archivo de aportes habitacionales",
    icon: ClipboardList,
  },
  {
    key: "recibos",
    label: "Recibos de pago",
    desc: "Emisión y firma digital de recibos de nómina",
    icon: FileText,
  },
  {
    key: "liquidaciones",
    label: "Liquidaciones / Finiquitos",
    desc: "Cálculo de prestaciones sociales y antigüedad",
    icon: HandCoins,
  },
  {
    key: "vacaciones",
    label: "Vacaciones / Bono vacacional",
    desc: "Control, programación y cálculo de vacaciones",
    icon: Umbrella,
  },
  {
    key: "utilidades",
    label: "Utilidades",
    desc: "Cálculo y declaración de utilidades anuales",
    icon: Banknote,
  },
]

/* ─── Componente principal ───────────────────────────────────────────── */

export default function CompanyServices({ value, onChange }) {
  const taxDetails = value.taxDetails || {}
  const payrollDetails = value.payrollDetails || {}

  function setTaxDetail(key, val) {
    onChange({ taxDetails: { ...taxDetails, [key]: val } })
  }

  function setPayrollDetail(key, val) {
    onChange({ payrollDetails: { ...payrollDetails, [key]: val } })
  }

  const activeTaxCount = TAX_ITEMS.filter((i) => taxDetails[i.key]).length
  const activePayrollCount = PAYROLL_ITEMS.filter((i) => payrollDetails[i.key]).length

  return (
    <div className="space-y-4">
      {/* Contabilidad */}
      <ServiceCard
        icon={<BookOpen className="h-5 w-5" />}
        title="Contabilidad"
        description="Libro diario, mayor, balances y conciliaciones bancarias"
        badge="Fase 3"
        checked={!!value.accounting}
        onCheckedChange={(v) => onChange({ accounting: v })}
      />

      {/* Impuestos */}
      <ServiceCard
        icon={<Landmark className="h-5 w-5" />}
        title="Impuestos"
        description="Declaraciones, retenciones y tributos nacionales y municipales"
        checked={!!value.taxes}
        onCheckedChange={(v) => onChange({ taxes: v })}
        summaryBadge={
          value.taxes && activeTaxCount > 0
            ? `${activeTaxCount} tipo${activeTaxCount !== 1 ? "s" : ""} seleccionado${activeTaxCount !== 1 ? "s" : ""}`
            : null
        }
      >
        {value.taxes && (
          <div className="space-y-3 pt-4">
            <Separator />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tipos de impuestos gestionados
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {TAX_ITEMS.map((item) => (
                <CheckItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  checked={!!taxDetails[item.key]}
                  onCheckedChange={(v) => setTaxDetail(item.key, v)}
                />
              ))}
            </div>
          </div>
        )}
      </ServiceCard>

      {/* Parafiscales */}
      <ServiceCard
        icon={<Calculator className="h-5 w-5" />}
        title="Parafiscales"
        description="SSO, FAOV, MINTRA, INCES — soportes y archivos de carga"
        checked={!!value.parafiscales}
        onCheckedChange={(v) => onChange({ parafiscales: v })}
      />

      {/* Nómina */}
      <ServiceCard
        icon={<Users className="h-5 w-5" />}
        title="Nómina"
        description="Empleados, beneficios, recibos y cálculos laborales"
        checked={!!value.payroll}
        onCheckedChange={(v) => onChange({ payroll: v })}
        summaryBadge={
          value.payroll && activePayrollCount > 0
            ? `${activePayrollCount} proceso${activePayrollCount !== 1 ? "s" : ""} habilitado${activePayrollCount !== 1 ? "s" : ""}`
            : null
        }
      >
        {value.payroll && (
          <div className="space-y-4 pt-4">
            <Separator />

            {/* Frecuencia */}
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                Frecuencia de nómina
              </Label>
              <Select
                value={payrollDetails.frequency || "quincenal"}
                onValueChange={(v) => setPayrollDetail("frequency", v)}
              >
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quincenal">Quincenal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Procesos de nómina */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Procesos incluidos
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PAYROLL_ITEMS.map((item) => (
                  <CheckItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    desc={item.desc}
                    checked={!!payrollDetails[item.key]}
                    onCheckedChange={(v) => setPayrollDetail(item.key, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </ServiceCard>
    </div>
  )
}

/* ─── Sub-componentes ────────────────────────────────────────────────── */

function ServiceCard({ icon, title, description, badge, checked, onCheckedChange, summaryBadge, children }) {
  return (
    <Card className={cn("transition-colors", checked ? "border-primary/40 bg-primary/5" : "")}>
      <CardContent className="p-4">
        {/* Header del servicio */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                checked
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold leading-none">{title}</p>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
                {summaryBadge && checked && (
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    {summaryBadge}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="shrink-0"
          />
        </div>

        {/* Sub-opciones expandibles */}
        {children}
      </CardContent>
    </Card>
  )
}

function CheckItem({ icon: Icon, label, desc, checked, onCheckedChange }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none",
        checked
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "hover:bg-muted/50",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium leading-none">{label}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </label>
  )
}
