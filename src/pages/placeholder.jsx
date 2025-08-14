import { useLocation } from "react-router-dom"

export default function Placeholder() {
  const { pathname } = useLocation()
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Ruta: {pathname}</h1>
      <p className="text-muted-foreground">
        Vista de ejemplo. Crea tu página real y apunta el enlace del sidebar a esa ruta.
      </p>
    </div>
  )
}