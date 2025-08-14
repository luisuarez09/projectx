import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import CompanyDataTable from "@/components/company/table/data-table"
import { getCompanyColumns } from "@/components/company/table/columns"
import { Button } from "@/components/ui/button"

export default function CompanyIndex() {
  const navigate = useNavigate()

  // DEMO: reemplaza con fetch GET /api/companies
  const [companies, setCompanies] = useState([
    {
      id: "acme",
      status: "Activa",
      basic: { tradeName: "Acme Inc", legalName: "Acme S.A.", rif: "J-12345678-9", logoUrl: "/logos/acme.svg" },
      services: { taxes: true, parafiscales: true, payroll: true },
      board: { validityUntil: "2026-12-31" },
    },
    {
      id: "ecorisas",
      status: "Activa",
      basic: { tradeName: "Fundación Ecorisas", legalName: "Fundación Ecorisas", rif: "J-87654321-0", logoUrl: "/logos/ecorisas.svg" },
      services: { taxes: true },
      board: { validityUntil: "2025-11-15" },
    },
    {
      id: "consultoria",
      status: "Inactiva",
      basic: { tradeName: "Consultoría Luis Suárez", legalName: "Servicios LS, C.A.", rif: "J-11223344-5" },
      services: { accounting: true, taxes: true },
      board: {},
    },
  ])

  const columns = useMemo(
    () =>
      getCompanyColumns({
        onDelete: (id) => setCompanies((prev) => prev.filter((c) => c.id !== id)),
      }),
    []
  )

  return (
    <div className="w-full space-y-4">
      {/* Encabezado a ancho completo */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground">
            Busca, filtra y gestiona las empresas. Crea una nueva o edita una existente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/settings/company/new")}>Registrar empresa</Button>
        </div>
      </div>

      {/* DataTable ocupa todo el ancho */}
      <CompanyDataTable
        columns={columns}
        data={companies}
        onAdd={() => navigate("/settings/company/new")}
      />
    </div>
  )
}