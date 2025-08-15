import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"

/**
 * CompanyBoard (DD/MM/AAAA + Actas de asamblea completas + Sonner)
 * - Capital/Aportes en Bs.
 * - Fechas renderizadas en formato DD/MM/AAAA (inputs siguen en YYYY-MM-DD para compatibilidad HTML).
 * - Accionistas: número de acciones -> % y aporte (Bs). Editar/Eliminar con confirmación.
 * - Junta Directiva y Comisario: cálculo de vencimiento desde fecha de acta + años (number stepper).
 * - Movimientos societarios: registra ACTAS DE ASAMBLEA con múltiples puntos/temas, Nº de documento, Tomo, Folio, adjunto PDF.
 * - Sonner: feedback visual en agregar/editar/eliminar.
 */

const REGISTROS_ZULIA = [
  "Registro Mercantil Primero del Estado Zulia",
  "Registro Mercantil Segundo del Estado Zulia",
  "Registro Mercantil Tercero del Estado Zulia",
  "Registro Mercantil Cuarto del Estado Zulia",
  "Registro Mercantil Quinto del Estado Zulia",
]

const CONCEPTOS_PREDEF = [
  { value: "eeff", label: "Aprobación EEFF" },
  { value: "aumento_capital", label: "Aumento de capital" },
  { value: "ratificacion_jd", label: "Ratificación de Junta Directiva" },
  { value: "designacion_comisario", label: "Designación de Comisario" },
  { value: "reforma_estatutos", label: "Reforma de estatutos" },
  { value: "cambio_domicilio", label: "Cambio de domicilio" },
  { value: "cambio_objeto", label: "Cambio de objeto" },
  { value: "otros", label: "Otros" },
]

export default function CompanyBoard({ value = {}, onChange }) {
  // Encabezado
  const shareCapital = value.shareCapital ?? "" // Bs
  const totalShares = value.totalShares ?? "" // entero

  // Helpers
  const toNumber = (v) => (v === "" || v === undefined || v === null ? 0 : Number(v))
  const addYears = (dateStr, years) => {
    if (!dateStr || !years) return ""
    const d = new Date(dateStr)
    if (isNaN(d)) return ""
    d.setFullYear(d.getFullYear() + Number(years))
    return d.toISOString().slice(0, 10)
  }
  const daysUntil = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    const today = new Date()
    today.setHours(0,0,0,0)
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
  }
  const statusFor = (end) => {
    const du = daysUntil(end)
    if (du === null) return { label: "Sin fecha", className: "" }
    if (du < 0) return { label: "Vencido", className: "bg-red-100 text-red-700" }
    if (du <= 60) return { label: `Por vencer (${du} días)`, className: "bg-amber-100 text-amber-700" }
    return { label: "Vigente", className: "bg-emerald-100 text-emerald-700" }
  }
  const fmt = (iso) => {
    if (!iso) return ""
    const d = new Date(iso)
    if (isNaN(d)) return iso
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  // Accionistas
  const [shareholder, setShareholder] = useState({ name: "", id: "", shares: "" })
  const shareholders = value.shareholders || []
  const totalSharesNum = toNumber(totalShares)
  const shareCapitalNum = toNumber(shareCapital)
  const totalHeldShares = useMemo(() => shareholders.reduce((acc, s) => acc + toNumber(s.shares), 0), [shareholders])

  const calcPercent = (shares) => {
    const sh = toNumber(shares)
    if (!totalSharesNum || totalSharesNum <= 0) return 0
    return (sh / totalSharesNum) * 100
  }
  const calcAmount = (shares) => (calcPercent(shares) / 100) * shareCapitalNum

  const mismatchShares = totalSharesNum > 0 && totalHeldShares !== totalSharesNum

  const [confirmDel, setConfirmDel] = useState({ open: false, i: null, type: "shareholders" })
  const askRemove = (i, type = "shareholders") => setConfirmDel({ open: true, i, type })
  const doRemove = () => {
    const { i, type } = confirmDel
    if (i === null) return setConfirmDel({ open: false, i: null, type: "shareholders" })
    const list = (value[type] || []).filter((_, idx) => idx !== i)
    onChange({ [type]: list })
    setConfirmDel({ open: false, i: null, type: "shareholders" })
    const label = type === "shareholders" ? "Accionista" : type === "directors" ? "Miembro de junta" : type === "auditors" ? "Comisario" : "Acta"
    toast.success(`${label} eliminado`)
  }

  const addShareholder = () => {
    if (!shareholder.name || !shareholder.shares) {
      toast.error("Complete nombre y acciones")
      return
    }
    const newList = [...shareholders, { ...shareholder }]
    onChange({ shareholders: newList })
    setShareholder({ name: "", id: "", shares: "" })
    toast.success("Accionista agregado")
  }

  const [editSH, setEditSH] = useState({ open: false, i: null, data: { name: "", id: "", shares: "" } })
  const openEditSH = (i) => setEditSH({ open: true, i, data: { ...shareholders[i] } })
  const saveEditSH = () => {
    const { i, data } = editSH
    const list = [...shareholders]
    list[i] = { ...data }
    onChange({ shareholders: list })
    setEditSH({ open: false, i: null, data: { name: "", id: "", shares: "" } })
    toast.success("Accionista actualizado")
  }

  // Junta Directiva
  const [director, setDirector] = useState({ name: "", id: "", position: "", actDate: "", years: "1" })
  const directors = value.directors || []
  const directorEndDate = (d) => addYears(d.actDate, d.years)

  const addDirector = () => {
    if (!director.name || !director.position || !director.actDate) {
      toast.error("Complete nombre, cargo y fecha del acta")
      return
    }
    const newList = [...directors, { ...director }]
    onChange({ directors: newList })
    setDirector({ name: "", id: "", position: "", actDate: "", years: "1" })
    toast.success("Miembro de junta agregado")
  }

  const [editDIR, setEditDIR] = useState({ open: false, i: null, data: { name: "", id: "", position: "", actDate: "", years: "1" } })
  const openEditDIR = (i) => setEditDIR({ open: true, i, data: { ...directors[i] } })
  const saveEditDIR = () => {
    const { i, data } = editDIR
    const list = [...directors]
    list[i] = { ...data }
    onChange({ directors: list })
    setEditDIR({ open: false, i: null, data: { name: "", id: "", position: "", actDate: "", years: "1" } })
    toast.success("Miembro de junta actualizado")
  }

  // Comisario(s)
  const [auditor, setAuditor] = useState({ name: "", id: "", cpc: "", actDate: "", years: "1" })
  const auditors = value.auditors || []
  const auditorEndDate = (a) => addYears(a.actDate, a.years)

  const addAuditor = () => {
    if (!auditor.name || !auditor.id || !auditor.cpc || !auditor.actDate) {
      toast.error("Complete nombre, cédula, CPC y fecha del acta")
      return
    }
    const newList = [...auditors, { ...auditor }]
    onChange({ auditors: newList })
    setAuditor({ name: "", id: "", cpc: "", actDate: "", years: "1" })
    toast.success("Comisario agregado")
  }

  const [editAUD, setEditAUD] = useState({ open: false, i: null, data: { name: "", id: "", cpc: "", actDate: "", years: "1" } })
  const openEditAUD = (i) => setEditAUD({ open: true, i, data: { ...auditors[i] } })
  const saveEditAUD = () => {
    const { i, data } = editAUD
    const list = [...auditors]
    list[i] = { ...data }
    onChange({ auditors: list })
    setEditAUD({ open: false, i: null, data: { name: "", id: "", cpc: "", actDate: "", years: "1" } })
    toast.success("Comisario actualizado")
  }

  // ACTAS DE ASAMBLEA (Movimientos societarios)
  const [acta, setActa] = useState({
    date: "",
    docNumber: "",
    tomo: "",
    folio: "",
    conceptos: [], // [{ value, label, detalle }]
    conceptoSel: "",
    detalle: "",
    file: null, // { name, size, type, url }
  })
  const movements = value.movements || []

  const addConcepto = () => {
    if (!acta.conceptoSel) {
      toast.error("Seleccione un concepto")
      return
    }
    const label = (CONCEPTOS_PREDEF.find(c=>c.value===acta.conceptoSel)||{}).label || acta.conceptoSel
    const conceptos = [...acta.conceptos, { value: acta.conceptoSel, label, detalle: acta.detalle }]
    setActa(prev=>({ ...prev, conceptos, conceptoSel: "", detalle: "" }))
    toast.success("Punto agregado al acta")
  }
  const removeConcepto = (idx) => setActa(prev=>({ ...prev, conceptos: prev.conceptos.filter((_,i)=>i!==idx) }))

  const onPickFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      toast.error("Adjunte un PDF válido")
      return
    }
    const url = URL.createObjectURL(f)
    setActa(prev=>({ ...prev, file: { name: f.name, size: f.size, type: f.type, url } }))
    toast.success("PDF adjuntado")
  }

  const addActa = () => {
    if (!acta.date) { toast.error("Indique la fecha del acta") ; return }
    if (acta.conceptos.length === 0) { toast.error("Agregue al menos un punto del orden del día") ; return }
    const nuevo = {
      date: acta.date,
      docNumber: acta.docNumber,
      tomo: acta.tomo,
      folio: acta.folio,
      conceptos: acta.conceptos,
      file: acta.file,
      type: "acta_asamblea",
      note: `Acta con ${acta.conceptos.length} punto(s)`,
    }
    onChange({ movements: [...movements, nuevo] })
    setActa({ date: "", docNumber: "", tomo: "", folio: "", conceptos: [], conceptoSel: "", detalle: "", file: null })
    toast.success("Acta registrada")
  }

  // Totales
  const totals = useMemo(() => {
    const sumShares = totalHeldShares
    const sumAmount = shareholders.reduce((acc, s) => acc + calcAmount(s.shares), 0)
    const percent = totalSharesNum > 0 ? (sumShares / totalSharesNum) * 100 : 0
    return { sumShares, sumAmount, percent }
  }, [shareholders, totalHeldShares, totalSharesNum, shareCapitalNum])

  return (
    <div className="space-y-8">
      {/* ENCABEZADO */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Datos registrales</h2>
            <p className="text-sm text-muted-foreground">Complete registro, expediente, fechas y defina capital y total de acciones.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <Label>Registro Mercantil</Label>
              <Select value={value.registry || ""} onValueChange={(v)=>onChange({ registry: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  {REGISTROS_ZULIA.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>N° de expediente</Label>
              <Input value={value.registryFile || ""} onChange={(e)=>onChange({ registryFile: e.target.value })} placeholder="Ej: 1234-2025" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha de registro</Label>
              <Input type="date" value={value.registryDate || ""} onChange={(e)=>onChange({ registryDate: e.target.value })} />
              {value.registryDate && <span className="text-xs text-muted-foreground">{fmt(value.registryDate)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Fecha de expiración</Label>
              <Input type="date" value={value.validityUntil || ""} onChange={(e)=>onChange({ validityUntil: e.target.value })} />
              {value.validityUntil && <span className="text-xs text-muted-foreground">{fmt(value.validityUntil)}</span>}
            </div>
            {/* Segunda línea: Capital y Total de acciones, juntos */}
            <div className="grid grid-cols-2 gap-2 md:col-span-2">
              <div className="grid gap-2">
                <Label>Capital social (Bs)</Label>
                <Input inputMode="decimal" value={shareCapital} onChange={(e)=>onChange({ shareCapital: e.target.value })} placeholder="0,00" />
              </div>
              <div className="grid gap-2">
                <Label>Total de acciones</Label>
                <Input inputMode="numeric" value={totalShares} onChange={(e)=>onChange({ totalShares: e.target.value.replace(/[^0-9]/g, "") })} placeholder="10.000" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ACCIONISTAS */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Accionistas</h2>
              <p className="text-sm text-muted-foreground">Ingrese acciones por socio. El sistema calcula porcentaje y aporte en Bs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="grid gap-2">
              <Label>Accionista</Label>
              <Input value={shareholder.name} onChange={(e)=>setShareholder({ ...shareholder, name: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="grid gap-2">
              <Label>Documento</Label>
              <Input value={shareholder.id} onChange={(e)=>setShareholder({ ...shareholder, id: e.target.value })} placeholder="CI/RIF/Pasaporte" />
            </div>
            <div className="grid gap-2">
              <Label>Acciones</Label>
              <Input type="number" inputMode="numeric" min={0} step={1} value={shareholder.shares}
                     onChange={(e)=>setShareholder({ ...shareholder, shares: e.target.value.replace(/[^0-9]/g, "") })}
                     placeholder="0" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button size="sm" onClick={addShareholder} disabled={!shareholder.name || !shareholder.shares}>Agregar accionista</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accionista</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                <TableHead className="text-right">% Part.</TableHead>
                <TableHead className="text-right">Aporte (Bs)</TableHead>
                <TableHead className="text-right">Gestión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareholders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin accionistas</TableCell></TableRow>
              ) : (
                shareholders.map((s, i) => {
                  const pct = calcPercent(s.shares)
                  const amt = calcAmount(s.shares)
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.id}</TableCell>
                      <TableCell className="text-right">{toNumber(s.shares).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{pct.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{"Bs " + amt.toFixed(2)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={()=>openEditSH(i)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={()=>askRemove(i, "shareholders")}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {shareholders.length > 0 && (
                <TableRow>
                  <TableCell className="font-semibold">Totales</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-semibold">{totalHeldShares.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{(totalSharesNum > 0 ? (totalHeldShares / totalSharesNum) * 100 : 0).toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-semibold">{"Bs " + shareholders.reduce((acc, s) => acc + calcAmount(s.shares), 0).toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {mismatchShares && (
            <div className="text-sm text-amber-600 border border-amber-200 bg-amber-50 px-3 py-2 rounded-md">
              Advertencia: la suma de acciones ({totalHeldShares.toLocaleString()}) no coincide con el total definido ({toNumber(totalShares).toLocaleString()}).
            </div>
          )}
        </CardContent>
      </Card>

      {/* JUNTA DIRECTIVA */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Junta Directiva</h2>
            <p className="text-sm text-muted-foreground">Indique fecha del acta y duración en años para calcular el vencimiento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={director.name} onChange={(e)=>setDirector({ ...director, name: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="grid gap-2">
              <Label>Documento</Label>
              <Input value={director.id} onChange={(e)=>setDirector({ ...director, id: e.target.value })} placeholder="CI/RIF/Pasaporte" />
            </div>
            <div className="grid gap-2">
              <Label>Cargo</Label>
              <Select value={director.position} onValueChange={(v)=>setDirector({ ...director, position: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="vicepresidente">Vicepresidente</SelectItem>
                  <SelectItem value="secretario">Secretario</SelectItem>
                  <SelectItem value="tesorero">Tesorero</SelectItem>
                  <SelectItem value="vocal">Vocal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Fecha del acta</Label>
              <Input type="date" value={director.actDate} onChange={(e)=>setDirector({ ...director, actDate: e.target.value })} />
              {director.actDate && <span className="text-xs text-muted-foreground">{fmt(director.actDate)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Duración (años)</Label>
              <Input type="number" inputMode="numeric" min={1} step={1} value={director.years} onChange={(e)=>setDirector({ ...director, years: e.target.value.replace(/[^0-9]/g, "") || "" })} placeholder="1" />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={addDirector}>Agregar</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Acta</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Gestión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(value.directors || []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin miembros</TableCell></TableRow>
              ) : (
                (value.directors || []).map((d, i) => {
                  const end = directorEndDate(d)
                  const st = statusFor(end)
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="capitalize">{d.position}</TableCell>
                      <TableCell>{fmt(d.actDate)}</TableCell>
                      <TableCell>
                        <Badge className={st.className}>{st.label}</Badge>
                        {end && <span className="ml-2 text-muted-foreground text-sm">{fmt(end)}</span>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={()=>openEditDIR(i)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={()=>askRemove(i, "directors")}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* COMISARIO(S) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Comisario</h2>
            <p className="text-sm text-muted-foreground">Registre comisarios con su CPC y vigencia derivada del acta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={auditor.name} onChange={(e)=>setAuditor({ ...auditor, name: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="grid gap-2">
              <Label>Cédula</Label>
              <Input value={auditor.id} onChange={(e)=>setAuditor({ ...auditor, id: e.target.value })} placeholder="V-xxxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label>CPC</Label>
              <Input value={auditor.cpc} onChange={(e)=>setAuditor({ ...auditor, cpc: e.target.value })} placeholder="Colegio de Contadores" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha del acta</Label>
              <Input type="date" value={auditor.actDate} onChange={(e)=>setAuditor({ ...auditor, actDate: e.target.value })} />
              {auditor.actDate && <span className="text-xs text-muted-foreground">{fmt(auditor.actDate)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Duración (años)</Label>
              <Input type="number" inputMode="numeric" min={1} step={1} value={auditor.years} onChange={(e)=>setAuditor({ ...auditor, years: e.target.value.replace(/[^0-9]/g, "") || "" })} placeholder="1" />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={addAuditor}>Agregar</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>CPC</TableHead>
                <TableHead>Acta</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Gestión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(value.auditors || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin comisarios</TableCell></TableRow>
              ) : (
                (value.auditors || []).map((a, i) => {
                  const end = auditorEndDate(a)
                  const st = statusFor(end)
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.id}</TableCell>
                      <TableCell>{a.cpc}</TableCell>
                      <TableCell>{fmt(a.actDate)}</TableCell>
                      <TableCell>
                        <Badge className={st.className}>{st.label}</Badge>
                        {end && <span className="ml-2 text-muted-foreground text-sm">{fmt(end)}</span>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={()=>openEditAUD(i)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={()=>askRemove(i, "auditors")}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ACTAS DE ASAMBLEA (Movimientos societarios) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Actas de asamblea protocolizadas</h2>
            <p className="text-sm text-muted-foreground">Registre los puntos tratados y los datos de protocolización en el expediente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="grid gap-2">
              <Label>Fecha del acta</Label>
              <Input type="date" value={acta.date} onChange={(e)=>setActa(prev=>({ ...prev, date: e.target.value }))} />
              {acta.date && <span className="text-xs text-muted-foreground">{fmt(acta.date)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>N° de documento</Label>
              <Input value={acta.docNumber} onChange={(e)=>setActa(prev=>({ ...prev, docNumber: e.target.value }))} placeholder="Ej: 00123" />
            </div>
            <div className="grid gap-2">
              <Label>Tomo</Label>
              <Input value={acta.tomo} onChange={(e)=>setActa(prev=>({ ...prev, tomo: e.target.value }))} placeholder="Ej: 45-A" />
            </div>
            <div className="grid gap-2">
              <Label>Folio (opcional)</Label>
              <Input value={acta.folio} onChange={(e)=>setActa(prev=>({ ...prev, folio: e.target.value }))} placeholder="Ej: 120-130" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Adjuntar PDF del acta</Label>
              <Input type="file" accept="application/pdf" onChange={onPickFile} />
              {acta.file && (
                <div className="text-xs text-muted-foreground">
                  {acta.file.name} · {(acta.file.size/1024/1024).toFixed(2)} MB
                  {acta.file.url && (
                    <a className="ml-2 underline" href={acta.file.url} target="_blank" rel="noreferrer">Ver</a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="grid gap-2 md:col-span-2">
              <Label>Punto/Concepto</Label>
              <Select value={acta.conceptoSel} onValueChange={(v)=>setActa(prev=>({ ...prev, conceptoSel: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccione un concepto" /></SelectTrigger>
                <SelectContent>
                  {CONCEPTOS_PREDEF.map(c=> (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-3">
              <Label>Detalle del punto</Label>
              <Input value={acta.detalle} onChange={(e)=>setActa(prev=>({ ...prev, detalle: e.target.value }))} placeholder="Ej: EEFF 2025 aprobados por unanimidad" />
            </div>
            <div className="md:col-span-1">
              <Button className="w-full" onClick={addConcepto}>Agregar punto</Button>
            </div>
          </div>

          {acta.conceptos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {acta.conceptos.map((c, idx)=> (
                <div key={idx} className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm bg-muted">
                  <span className="font-medium">{c.label}</span>
                  {c.detalle && <span className="text-muted-foreground">· {c.detalle}</span>}
                  <Button size="sm" variant="secondary" className="h-6 px-2" onClick={()=>removeConcepto(idx)}>✕</Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={addActa}>Guardar acta de asamblea</Button>
          </div>

          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Documento / Tomo</TableHead>
                <TableHead>Puntos tratados</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin actas registradas</TableCell></TableRow>
              ) : (
                movements.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{fmt(m.date)}</TableCell>
                    <TableCell>
                      {m.docNumber || "—"} {m.tomo ? ` / Tomo ${m.tomo}` : ""}
                      {m.folio ? <span className="text-muted-foreground"> · Folio {m.folio}</span> : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(m.conceptos || []).map((c, idx) => (
                          <Badge key={idx} variant="secondary">{c.label}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {m.file?.url ? (
                        <a className="underline" href={m.file.url} target="_blank" rel="noreferrer">Ver PDF</a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={()=>askRemove(i, "movements")}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CONFIRMAR ELIMINACIÓN */}
      <AlertDialog open={confirmDel.open} onOpenChange={(open)=> setConfirmDel(p=>({ ...p, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el elemento seleccionado de la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doRemove}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* EDITAR ACCIONISTA */}
      <Dialog open={editSH.open} onOpenChange={(open)=> setEditSH(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar accionista</DialogTitle>
            <DialogDescription>Actualice los campos necesarios y guarde los cambios.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="grid gap-2">
              <Label>Accionista</Label>
              <Input value={editSH.data.name} onChange={(e)=>setEditSH(prev=>({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Documento</Label>
              <Input value={editSH.data.id} onChange={(e)=>setEditSH(prev=>({ ...prev, data: { ...prev.data, id: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Acciones</Label>
              <Input type="number" inputMode="numeric" min={0} step={1} value={editSH.data.shares} onChange={(e)=>setEditSH(prev=>({ ...prev, data: { ...prev.data, shares: e.target.value.replace(/[^0-9]/g, "") } }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={()=>setEditSH({ open:false, i:null, data:{ name:"", id:"", shares:"" } })}>Cancelar</Button>
            <Button onClick={saveEditSH}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDITAR DIRECTIVO */}
      <Dialog open={editDIR.open} onOpenChange={(open)=> setEditDIR(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar miembro de junta</DialogTitle>
            <DialogDescription>Modifique cargo, fecha de acta o duración.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={editDIR.data.name} onChange={(e)=>setEditDIR(prev=>({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Documento</Label>
              <Input value={editDIR.data.id} onChange={(e)=>setEditDIR(prev=>({ ...prev, data: { ...prev.data, id: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Cargo</Label>
              <Select value={editDIR.data.position} onValueChange={(v)=>setEditDIR(prev=>({ ...prev, data: { ...prev.data, position: v } }))}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="vicepresidente">Vicepresidente</SelectItem>
                  <SelectItem value="secretario">Secretario</SelectItem>
                  <SelectItem value="tesorero">Tesorero</SelectItem>
                  <SelectItem value="vocal">Vocal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Fecha del acta</Label>
              <Input type="date" value={editDIR.data.actDate} onChange={(e)=>setEditDIR(prev=>({ ...prev, data: { ...prev.data, actDate: e.target.value } }))} />
              {editDIR.data.actDate && <span className="text-xs text-muted-foreground">{fmt(editDIR.data.actDate)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Duración (años)</Label>
              <Input type="number" inputMode="numeric" min={1} step={1} value={editDIR.data.years} onChange={(e)=>setEditDIR(prev=>({ ...prev, data: { ...prev.data, years: e.target.value.replace(/[^0-9]/g, "") || "" } }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={()=>setEditDIR({ open:false, i:null, data:{ name:"", id:"", position:"", actDate:"", years:"1" } })}>Cancelar</Button>
            <Button onClick={saveEditDIR}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDITAR COMISARIO */}
      <Dialog open={editAUD.open} onOpenChange={(open)=> setEditAUD(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar comisario</DialogTitle>
            <DialogDescription>Actualice datos del comisario y su vigencia.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={editAUD.data.name} onChange={(e)=>setEditAUD(prev=>({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Cédula</Label>
              <Input value={editAUD.data.id} onChange={(e)=>setEditAUD(prev=>({ ...prev, data: { ...prev.data, id: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>CPC</Label>
              <Input value={editAUD.data.cpc} onChange={(e)=>setEditAUD(prev=>({ ...prev, data: { ...prev.data, cpc: e.target.value } }))} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha del acta</Label>
              <Input type="date" value={editAUD.data.actDate} onChange={(e)=>setEditAUD(prev=>({ ...prev, data: { ...prev.data, actDate: e.target.value } }))} />
              {editAUD.data.actDate && <span className="text-xs text-muted-foreground">{fmt(editAUD.data.actDate)}</span>}
            </div>
            <div className="grid gap-2">
              <Label>Duración (años)</Label>
              <Input type="number" inputMode="numeric" min={1} step={1} value={editAUD.data.years} onChange={(e)=>setEditAUD(prev=>({ ...prev, data: { ...prev.data, years: e.target.value.replace(/[^0-9]/g, "") || "" } }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={()=>setEditAUD({ open:false, i:null, data:{ name:"", id:"", cpc:"", actDate:"", years:"1" } })}>Cancelar</Button>
            <Button onClick={saveEditAUD}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-right" />
    </div>
  )
}