import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const moduleList = [
  { key: "accounting", label: "Contabilidad" },
  { key: "taxes", label: "Impuestos" },
  { key: "parafiscales", label: "Parafiscales" },
  { key: "payroll", label: "Nómina" },
]

const roles = [
  { value: "viewer", label: "Solo lectura" },
  { value: "registrar", label: "Registro" },
  { value: "editor", label: "Edición" },
  { value: "approver", label: "Aprobación" },
  { value: "admin", label: "Admin" },
]

export default function CompanyUsers({ value = [], onChange }) {
  const [row, setRow] = useState({ email: "", role: "viewer", modules: ["taxes", "parafiscales"] })

  const addUser = () => {
    if (!row.email) return
    onChange([row, ...value])
    setRow({ email: "", role: "viewer", modules: ["taxes"] })
  }
  const removeUser = (i) => onChange(value.filter((_, idx) => idx !== i))
  const toggleModule = (k) =>
    setRow((prev) => ({ ...prev, modules: prev.modules.includes(k) ? prev.modules.filter((m) => m !== k) : [...prev.modules, k] }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Correo del usuario</Label>
          <Input value={row.email} onChange={e=>setRow({...row, email: e.target.value})} placeholder="correo@dominio.com" />
        </div>
        <div className="grid gap-2">
          <Label>Rol</Label>
          <Select value={row.role} onValueChange={(v)=>setRow({...row, role: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {roles.map(r=><SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Módulos</Label>
          <div className="flex flex-wrap gap-4">
            {moduleList.map(m=>(
              <label key={m.key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={row.modules.includes(m.key)} onCheckedChange={()=>toggleModule(m.key)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button size="sm" onClick={addUser}>Agregar usuario</Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Módulos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {value.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin usuarios vinculados</TableCell></TableRow>
          ) : (
            value.map((u, i)=>(
              <TableRow key={i}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell>{u.modules?.map(k=>moduleList.find(m=>m.key===k)?.label).join(", ")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={()=>removeUser(i)}>Quitar</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}