import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import UsersDataTable from "@/components/users/table/data-table"
import { getUserColumns } from "@/components/users/table/columns"
import { Button } from "@/components/ui/button"
import { MOCK_USERS } from "./_mock"

export default function UsersIndex() {
  const navigate = useNavigate()
  const [users, setUsers] = useState(MOCK_USERS)

  const columns = useMemo(
    () =>
      getUserColumns({
        onDelete: (id) => setUsers((prev) => prev.filter((u) => u.id !== id)),
        onToggleStatus: (id) =>
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
          ),
      }),
    []
  )

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios de la firma, sus roles y acceso a cada empresa.
          </p>
        </div>
        <Button onClick={() => navigate("/settings/users/new")}>Nuevo usuario</Button>
      </div>

      <UsersDataTable
        columns={columns}
        data={users}
        onAdd={() => navigate("/settings/users/new")}
      />
    </div>
  )
}
