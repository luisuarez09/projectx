import ModuleShell from "@/pages/module-shell"

export default function ControlAlertsPage() {
  return (
    <ModuleShell
      title="Alertas y vencimientos"
      description="Bandeja operativa para priorizar obligaciones cercanas, empresas en riesgo y elementos bloqueados por soportes o aprobaciones."
      highlights={[
        "Cola priorizada de vencimientos por cercanía e impacto.",
        "Estados por empresa: al día, en revisión, pendiente o en riesgo.",
        "Alertas accionables para el equipo interno de la firma.",
        "Base ideal para reglas futuras y notificaciones institucionales.",
      ]}
    />
  )
}
