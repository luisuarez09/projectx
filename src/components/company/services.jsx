import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const items = [
  {
    key: "accounting",
    title: "Contabilidad",
    desc: "Libro diario, mayor, balances, conciliaciones. (Fase 3).",
  },
  {
    key: "taxes",
    title: "Impuestos",
    desc: "IVA, municipales, retenciones ISLR/IVA, IGTF/IGP. Declaraciones y comprobantes.",
  },
  {
    key: "parafiscales",
    title: "Parafiscales",
    desc: "SSO, FAOV, MINTRA, INCES. Soportes y archivos de carga.",
  },
  {
    key: "payroll",
    title: "Nómina",
    desc: "Empleados, beneficios, nómina quincenal, recibos y TXT FAOV.",
  },
]

export default function CompanyServices({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((it) => (
        <Card key={it.key}>
          <CardContent className="flex items-start gap-3 p-4">
            <Switch
              checked={!!value[it.key]}
              onCheckedChange={(v) => onChange({ [it.key]: v })}
              id={`svc-${it.key}`}
            />
            <div className="space-y-1">
              <Label htmlFor={`svc-${it.key}`}>{it.title}</Label>
              <p className="text-sm text-muted-foreground">{it.desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}