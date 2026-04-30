import { ArrowRight, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ModuleShell({
  title,
  description,
  badge = "Próximamente",
  highlights = [],
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit">{badge}</Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          Esta vista ya tiene ruta propia y queda lista para crecer sin romper la navegación principal.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Alcance previsto</CardTitle>
            <CardDescription>Punto de partida para desarrollar el módulo con estructura de firma, estados y métricas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Esta base evita que el menú visible termine en pantallas genéricas.
            </span>
            <Button variant="outline" size="sm">
              Prioridad de implementación
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del módulo</CardTitle>
            <CardDescription>Resumen corto para el equipo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock3 className="h-4 w-4" />
                Preparado para diseño funcional
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                La vista puede recibir luego filtros, tablas, indicadores y estados por empresa.
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Ideal para integrar datos reales en la siguiente etapa sin rehacer navegación ni layout.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
