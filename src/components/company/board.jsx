import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function CompanyBoard({ value, onChange }) {
  const [share, setShare] = useState({ name: "", id: "", percent: "", amount: "" })
  const [move, setMove] = useState({ date: "", type: "constitucion", note: "" })

  const addShareholder = () => {
    if (!share.name) return
    onChange({ shareholders: [...(value.shareholders || []), share] })
    setShare({ name: "", id: "", percent: "", amount: "" })
  }
  const removeShareholder = (i) => onChange({ shareholders: (value.shareholders || []).filter((_, idx)=>idx!==i) })
  const addMovement = () => {
    if (!move.date) return
    onChange({ movements: [...(value.movements || []), move] })
    setMove({ date: "", type: "constitucion", note: "" })
  }
  const removeMovement = (i) => onChange({ movements: (value.movements || []).filter((_, idx)=>idx!==i) })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="grid gap-2">
          <Label>N° tomo/registro</Label>
          <Input value={value.registryTome} onChange={e=>onChange({ registryTome: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Fecha de registro</Label>
          <Input type="date" value={value.registryDate} onChange={e=>onChange({ registryDate: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Vigencia hasta</Label>
          <Input type="date" value={value.validityUntil} onChange={e=>onChange({ validityUntil: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Representante legal</Label>
          <Input value={value.legalRep} onChange={e=>onChange({ legalRep: e.target.value })} placeholder="Nombre completo" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="grid gap-2 md:col-span-2">
          <Label>Contacto (legal)</Label>
          <Input value={value.contactName || ""} onChange={e=>onChange({ contactName: e.target.value })} placeholder="Apoderado/abogado" />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label>Capital social (USD)</Label>
          <Input inputMode="decimal" value={value.shareCapital || ""} onChange={e=>onChange({ shareCapital: e.target.value })} placeholder="0.00" />
        </div>
      </div>

      {/* Accionistas */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Accionista</Label>
              <Input value={share.name} onChange={e=>setShare({...share, name: e.target.value})} placeholder="Nombre" />
            </div>
            <div className="grid gap-2">
              <Label>Documento</Label>
              <Input value={share.id} onChange={e=>setShare({...share, id: e.target.value})} placeholder="CI/RIF/Pasaporte" />
            </div>
            <div className="grid gap-2">
              <Label>% Participación</Label>
              <Input inputMode="decimal" value={share.percent} onChange={e=>setShare({...share, percent: e.target.value})} placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label>Aporte (USD)</Label>
              <Input inputMode="decimal" value={share.amount} onChange={e=>setShare({...share, amount: e.target.value})} placeholder="0.00" />
            </div>
          </div>
          <Button size="sm" onClick={addShareholder}>Agregar accionista</Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accionista</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Aporte</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(value.shareholders || []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin accionistas</TableCell></TableRow>
              ) : (
                value.shareholders.map((s, i)=>(
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.percent}%</TableCell>
                    <TableCell>${s.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={()=>removeShareholder(i)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movimientos societarios */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={move.date} onChange={e=>setMove({...move, date: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={move.type} onValueChange={(v)=>setMove({...move, type: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="constitucion">Acta de constitución</SelectItem>
                  <SelectItem value="aumento">Aumento de capital</SelectItem>
                  <SelectItem value="venta">Venta/cesión de acciones</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Descripción / N° de acta</Label>
              <Input value={move.note} onChange={e=>setMove({...move, note: e.target.value})} placeholder="Acta N°..., folio..., notaría..." />
            </div>
          </div>
          <Button size="sm" onClick={addMovement}>Agregar movimiento</Button>

          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(value.movements || []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin movimientos</TableCell></TableRow>
              ) : (
                value.movements.map((m, i)=>(
                  <TableRow key={i}>
                    <TableCell>{m.date}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>{m.note}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={()=>removeMovement(i)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}