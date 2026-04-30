import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, CircleAlert, MonitorPlay, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const kpis = [
  { title: "Cumplimiento general", value: "82%", detail: "Obligaciones del período con avance satisfactorio", icon: ShieldCheck },
  { title: "Vencimientos próximos", value: "12", detail: "Obligaciones en los próximos 7 días", icon: CalendarDays },
  { title: "Empresas con riesgo", value: "4", detail: "Requieren seguimiento o soportes faltantes", icon: CircleAlert },
  { title: "Carga activa", value: "28", detail: "Frentes de trabajo abiertos para el equipo", icon: BriefcaseBusiness },
]

const teams = [
  { name: "Fiscal", summary: "8 declaraciones en preparación", status: "En foco" },
  { name: "Contable", summary: "6 cierres con avance estable", status: "Al día" },
  { name: "Legal", summary: "3 gestiones con revisión documental", status: "Atención" },
]

const watchlist = [
  "Fundación Ecorisas: retenciones ISLR pendientes de soporte.",
  "Grupo Nova: municipal entra en ventana de presentación esta semana.",
  "Acme Inc: documentos de compras por validar antes del cierre.",
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">Centro de supervisión</Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Centro de control</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Vista principal para el equipo de la firma con avance global, vencimientos, riesgos y capacidad operativa por empresa.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          <MonitorPlay className="h-4 w-4" />
          Arquitectura lista para derivar una futura Vista TV institucional.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="h-4 w-4" />
                <span className="text-sm">{kpi.title}</span>
              </div>
              <CardTitle className="text-3xl">{kpi.value}</CardTitle>
              <CardDescription>{kpi.detail}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Radar operativo</CardTitle>
            <CardDescription>Resumen rápido para entender dónde está concentrado el trabajo del período.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {teams.map((team) => (
              <div key={team.name} className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{team.name}</span>
                  <Badge variant="outline">{team.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{team.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas a vigilar</CardTitle>
            <CardDescription>Alertas de trabajo priorizado para seguimiento de la firma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {watchlist.map((item) => (
              <div key={item} className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>Atajos a los frentes más usados en la operación diaria.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              "Calendario fiscal para revisar vencimientos transversales.",
              "Compras para validar documentos del período actual.",
              "Ventas para revisar emisión, cobro y estatus.",
              "Empresas para cambiar contexto o registrar ajustes.",
            ].map((item) => (
              <div key={item} className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dirección de crecimiento</CardTitle>
            <CardDescription>Esta pantalla ya deja lista la evolución hacia indicadores más completos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4" />
                Visión por cartera de empresas
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                El siguiente paso natural es conectar datos reales por responsable, empresa y obligación.
              </p>
            </div>
            <Button variant="outline" className="w-full justify-between">
              Preparar métricas institucionales
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
