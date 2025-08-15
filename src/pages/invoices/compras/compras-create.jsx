import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Toaster, toast } from "sonner"
import { ArrowLeft, Save, FilePlus2, UserPlus, Trash2, Plus, Search, Loader2, Check, X } from "lucide-react"

/**
 * Incluye:
 * - Fecha DD/MM/AAAA → se guarda ISO interno
 * - Moneda por defecto: VEF
 * - RIF sin guiones, validador y "Buscar en SENIAT" con feedback visual y Sonner
 * - Checkbox "Sin derecho a crédito fiscal"
 * - Distribución contable: solo Cuenta+Monto; IVA/IVA no deducible y CxP se autoajustan
 * - Validación débitos = créditos; bloqueo si no cuadra
 */

const IVA_RATE = 0.16

// Mock Plan de Cuentas (COA). Sustituir por consulta a BD
const COA = [
  { id: "6001", code: "6.1.1.01", name: "Gastos de papelería", type: "expense", nature: "debit" },
  { id: "6002", code: "6.1.1.02", name: "Gastos de servicios", type: "expense", nature: "debit" },
  { id: "6003", code: "6.1.1.03", name: "Gastos de mantenimiento", type: "expense", nature: "debit" },
  { id: "6004", code: "6.1.1.04", name: "Gastos de transporte", type: "expense", nature: "debit" },
  { id: "6006", code: "6.1.1.06", name: "IVA no deducible", type: "expense_nd_vat", nature: "debit" },
  { id: "1109", code: "1.1.09", name: "IVA Crédito Fiscal", type: "tax_credit", nature: "debit" },
  { id: "2110", code: "2.1.10", name: "Cuentas por pagar - Proveedores", type: "payable", nature: "credit" },
]

// Mock Proveedores
const SUPPLIERS_INIT = [
  { id: "prov-1", name: "Papelería El Sol, C.A.", rif: "J000000001", address: "", taxpayerType: "Ordinario", vatRetention: 75, defaultAccountId: "6001" },
  { id: "prov-2", name: "Distribuidora Andina, C.A.", rif: "J000000002", address: "", taxpayerType: "Ordinario", vatRetention: 100, defaultAccountId: "6002" },
]

function findAccountById(id) { return COA.find((a) => a.id === id) }
function accountLabel(a) { return a ? `${a.code} — ${a.name}` : "" }
function fix2(n) { return (Number(n) || 0).toFixed(2) }
function normalize(v) { return v.replace(/,/g, ".").replace(/[^0-9.]/g, "") }

// Conversión de fechas
function toISOFromDDMMYYYY(s) { const [dd, mm, yyyy] = (s || "").split("/"); if (!dd || !mm || !yyyy) return new Date().toISOString().slice(0, 10); return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` }
function toDDMMYYYYFromISO(iso) { const d = new Date(iso); const dd = String(d.getDate()).padStart(2, "0"); const mm = String(d.getMonth() + 1).padStart(2, "0"); const yyyy = d.getFullYear(); return `${dd}/${mm}/${yyyy}` }

export default function ComprasInvoiceCreate({ onSaved, onCancel }) {
  const [suppliers, setSuppliers] = useState(SUPPLIERS_INIT)
  const [supplierQuery, setSupplierQuery] = useState("")
  const [supplier, setSupplier] = useState(null)
  const [number, setNumber] = useState("")
  const [dateISO, setDateISO] = useState(() => new Date().toISOString().slice(0, 10))
  const [dateDisplay, setDateDisplay] = useState(() => toDDMMYYYYFromISO(new Date().toISOString().slice(0, 10)))
  const [currency, setCurrency] = useState("VEF")
  const [status] = useState("Borrador")

  // Totales
  const [base, setBase] = useState("")
  const [exempt, setExempt] = useState("")
  const [noCreditoFiscal, setNoCreditoFiscal] = useState(false)
  const baseNum = Number(base) || 0
  const exemptNum = Number(exempt) || 0
  const tax = +(baseNum * IVA_RATE).toFixed(2)
  const total = +(baseNum + exemptNum + tax).toFixed(2)

  // Distribución contable (GL): { id, accountId, amount }
  const [glLines, setGlLines] = useState(() => ensureSystemLines([makeLine()], { tax, total, noCreditoFiscal }))

  // Atajos Alt+S / Alt+N
  useEffect(() => {
    function handler(e) { if (e.altKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); handleSave() } if (e.altKey && (e.key === "n" || e.key === "N")) { e.preventDefault(); handleSaveAndNew() } }
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler)
  })

  // Sincronizar líneas IVA/CxP con tax/total/noCreditoFiscal
  useEffect(() => { setGlLines((prev) => syncSystemLines(prev, { tax, total, noCreditoFiscal })) }, [tax, total, noCreditoFiscal])

  // Proveedor → sugerir primera línea con su cuenta si está vacía
  useEffect(() => { if (supplier?.defaultAccountId) { setGlLines((prev) => autoFillFirstExpense(prev, supplier.defaultAccountId)) } }, [supplier])

  const balance = useMemo(() => computeBalance(glLines), [glLines])
  const allRemoved = glLines.length === 0
  const unbalanced = Math.abs(balance.debit - balance.credit) > 0.009

  function handleSave() {
    if (!supplier) return toast.error("Selecciona o crea un proveedor")
    if (!number) return toast.error("Indica el N° de documento")
    if (allRemoved) return toast.error("La factura no tiene registro contable. Agrega al menos una línea.")
    if (unbalanced) return toast.error("La partida doble no cuadra. Verifica Débito y Crédito.")

    const payload = { type: "Factura", number, date: dateISO, currency, supplier, base: baseNum, exempt: exemptNum, tax, total, noCreditoFiscal, glLines: glLines.map((l) => ({ id: l.id, accountId: l.accountId, amount: Number(l.amount) || 0 })), status: "Pendiente" }
    toast.success("Factura guardada")
    onSaved?.(payload)
  }

  function resetForm() { const iso = new Date().toISOString().slice(0, 10); setSupplierQuery(""); setSupplier(null); setNumber(""); setDateISO(iso); setDateDisplay(toDDMMYYYYFromISO(iso)); setCurrency("VEF"); setBase(""); setExempt(""); setNoCreditoFiscal(false); setGlLines(ensureSystemLines([makeLine()], { tax: 0, total: 0, noCreditoFiscal: false })) }
  function handleSaveAndNew() { handleSave(); resetForm() }

  function addLine() { setGlLines((prev) => ensureSystemLines([...prev, makeLine()], { tax, total, noCreditoFiscal })) }
  function removeLine(id) { setGlLines((prev) => prev.filter((l) => l.id !== id)) }
  function updateLine(id, patch) { setGlLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))) }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
      <Toaster richColors position="bottom-right" />

      {/* Encabezado / breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Compras</span>
          <span>/</span>
          <span className="text-foreground">Registrar factura</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-100">{status}</Badge>
          <div className="hidden sm:flex text-xs text-muted-foreground ml-2">
            <span className="mr-3">Atajos: Alt+S Guardar</span>
            <span>Alt+N Guardar y nuevo</span>
          </div>
        </div>
      </div>

      {/* Barra de acciones sticky */}
      <div className="sticky top-0 z-20 mt-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-2 py-2">
          <Button variant="ghost" className="gap-2" onClick={() => onCancel?.()}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4"/> Guardar
            </Button>
            <Button className="gap-2" onClick={handleSaveAndNew}>
              <FilePlus2 className="h-4 w-4"/> Guardar y nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Datos de la factura</CardTitle>
              <CardDescription>Completa los campos esenciales</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <Label>Proveedor</Label>
                  <SupplierPicker
                    suppliers={suppliers}
                    setSuppliers={setSuppliers}
                    query={supplierQuery}
                    setQuery={setSupplierQuery}
                    value={supplier}
                    onChange={setSupplier}
                  />
                </div>
                <SupplierCreateButton onCreate={(s) => { setSuppliers((prev) => [...prev, s]); setSupplier(s); toast.success("Proveedor creado") }} />
              </div>
              <Field label="N° documento">
                <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ej: F-000148" />
              </Field>
              <Field label="Fecha (DD/MM/AAAA)">
                <Input value={dateDisplay} onChange={(e) => { const val = e.target.value; setDateDisplay(val); setDateISO(toISOFromDDMMYYYY(val)) }} placeholder="31/08/2025" />
              </Field>
              <Field label="Moneda">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VEF">VEF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Totales</CardTitle>
              <CardDescription>Calculo automático de IVA 16%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <Field label="Base imponible">
                  <Input inputMode="decimal" value={base} onChange={(e) => setBase(normalize(e.target.value))} placeholder="0.00" />
                </Field>
                <Field label="Exento">
                  <Input inputMode="decimal" value={exempt} onChange={(e) => setExempt(normalize(e.target.value))} placeholder="0.00" />
                </Field>
                <Field label="IVA (16%)">
                  <Input value={fix2(tax)} readOnly />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <input id="nocf" type="checkbox" className="h-4 w-4" checked={noCreditoFiscal} onChange={(e) => setNoCreditoFiscal(e.target.checked)} />
                    <Label htmlFor="nocf">Sin derecho a crédito fiscal</Label>
                  </div>
                </div>
                <Field label="Total factura">
                  <Input value={fix2(total)} readOnly />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribución contable</CardTitle>
              <CardDescription>Cuenta + Monto. IVA/IVA no deducible y CxP se ajustan automáticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2">
                <div className="col-span-8">Cuenta</div>
                <div className="col-span-3 text-right">Monto</div>
                <div className="col-span-1 text-right"> </div>
              </div>

              <div className="flex flex-col gap-2">
                {glLines.map((l) => (
                  <div key={l.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-8">
                      <AccountPicker value={l.accountId} onChange={(val) => updateLine(l.id, { accountId: val })} />
                    </div>
                    <div className="sm:col-span-3">
                      <Input inputMode="decimal" className="text-right" value={l.amount} onChange={(e) => updateLine(l.id, { amount: normalize(e.target.value) })} placeholder="0.00" />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeLine(l.id)} title="Eliminar línea">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {glLines.length === 0 && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    La factura se queda sin registro contable. Agrega al menos una línea.
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <Button variant="outline" className="gap-2" onClick={addLine}><Plus className="h-4 w-4"/> Agregar línea</Button>
                  <div className="text-xs text-muted-foreground hidden sm:block">IVA (débito) o IVA no deducible (débito) y CxP (crédito) se ajustan al impuesto/total.</div>
                </div>

                <Separator className="my-3" />

                {/* Verificación partida doble */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>Débitos: <strong>{fix2(balance.debit)}</strong></div>
                  <div>Créditos: <strong>{fix2(balance.credit)}</strong></div>
                  <div className="sm:col-span-2 text-right">
                    {unbalanced ? (
                      <span className="text-amber-700">Descuadre: {fix2(balance.debit - balance.credit)}</span>
                    ) : (
                      <span className="text-emerald-700">Cuadrado</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notas y adjuntos</CardTitle>
              <CardDescription>Opcional</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notas">
                <TabsList>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
                </TabsList>
                <TabsContent value="notas" className="pt-3">
                  <Input placeholder="Observaciones (opcional)" />
                </TabsContent>
                <TabsContent value="adjuntos" className="pt-3 text-sm text-muted-foreground">
                  Arrastra y suelta archivos aquí (placeholder)
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: resumen */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen</CardTitle>
              <CardDescription>Revisa antes de guardar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="text-muted-foreground"><strong>Proveedor:</strong> {supplier ? `${supplier.name} (${supplier.rif})` : "—"}</div>
              <div className="text-muted-foreground"><strong>N° Doc:</strong> {number || "—"}</div>
              <div className="text-muted-foreground"><strong>Fecha:</strong> {dateDisplay}</div>
              <div className="text-muted-foreground"><strong>Moneda:</strong> {currency}</div>
              <Separator className="my-2" />
              <div><strong>Total:</strong> {fix2(total)}</div>
              <div className="text-muted-foreground">Base: {fix2(baseNum)} · Exento: {fix2(exemptNum)}</div>
              <div className="text-muted-foreground">IVA 16%: {fix2(tax)} {noCreditoFiscal ? "(no deducible)" : "(crédito fiscal)"}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer móvil para velocidad */}
      <div className="sm:hidden sticky bottom-0 z-20 bg-background border-t p-2 flex gap-2">
        <Button variant="outline" className="w-1/3" onClick={() => onCancel?.()}><ArrowLeft className="h-4 w-4 mr-1"/>Volver</Button>
        <Button variant="outline" className="w-1/3" onClick={handleSave}><Save className="h-4 w-4 mr-1"/>Guardar</Button>
        <Button className="w-1/3" onClick={handleSaveAndNew}><FilePlus2 className="h-4 w-4 mr-1"/>Nuevo</Button>
      </div>
    </div>
  )
}

function SupplierPicker({ suppliers, setSuppliers, query, setQuery, value, onChange }) {
  const [isSearching, setIsSearching] = useState(false)
  const [rifValid, setRifValid] = useState(null)

  const matches = useMemo(() => { const list = suppliers || []; if (!query) return list; const q = query.toLowerCase(); return list.filter((s) => s.name.toLowerCase().includes(q) || s.rif.toLowerCase().includes(q)) }, [query, suppliers])
  const showCreate = query && matches.length === 0

  async function handleLookup() {
    const rif = (value ? value.rif : query || "").toUpperCase().replace(/[^A-Z0-9]/g, "")
    if (!rif) return toast.error("Introduce un RIF para consultar")
    const rifRegex = /^[VJEGP][0-9]{9}$/
    if (!rifRegex.test(rif)) { setRifValid(false); toast.error("Formato de RIF inválido. Ej: J000000001"); return }
    setIsSearching(true); setRifValid(null)
    try {
      const data = await mockSeniatLookup(rif)
      if (!data) { setRifValid(false); toast.error("No se encontró información en SENIAT (mock)"); return }
      const newSupplier = { id: crypto.randomUUID(), rif, name: data.name, address: data.address, taxpayerType: data.taxpayerType, vatRetention: 75, defaultAccountId: "" }
      setSuppliers((prev) => [...prev, newSupplier])
      onChange(newSupplier)
      setQuery("")
      setRifValid(true)
      toast.success("Proveedor cargado desde SENIAT (mock)")
    } catch (e) {
      setRifValid(false)
      toast.error("Error consultando SENIAT (mock)")
    } finally { setIsSearching(false) }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              className="pr-10"
              value={value ? `${value.name} (${value.rif})` : query}
              onChange={(e) => { onChange(null); setQuery(e.target.value) }}
              placeholder="Buscar por nombre o RIF (ej.: J000000001)"
            />
            {isSearching && (<Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />)}
            {!isSearching && rifValid === true && (<Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />)}
            {!isSearching && rifValid === false && (<X className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />)}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleLookup} title="Buscar en SENIAT">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
        <div className="flex flex-col gap-2 max-h-64 overflow-auto">
          {matches.map((s) => (
            <button key={s.id} onClick={() => onChange(s)} className="text-left px-2 py-1 rounded hover:bg-muted">
              {s.name} <span className="text-muted-foreground">({s.rif})</span>
            </button>
          ))}
          {showCreate && (
            <SupplierCreateButton inlineQuery={query} onCreate={(s) => { setSuppliers((prev) => [...prev, s]); onChange(s) }} />
          )}
          {!showCreate && matches.length === 0 && (
            <div className="text-sm text-muted-foreground px-2">Escribe para buscar o crear</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SupplierCreateButton({ onCreate, inlineQuery }) {
  const [open, setOpen] = useState(false)
  const [rif, setRif] = useState("")
  const [name, setName] = useState(inlineQuery || "")
  const [address, setAddress] = useState("")
  const [taxpayerType, setTaxpayerType] = useState("Ordinario")
  const [vatRetention, setVatRetention] = useState(75)
  const [defaultAccountId, setDefaultAccountId] = useState("")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [rifValid, setRifValid] = useState(null)

  function handleCreate() {
    if (!name || !rif) return toast.error("RIF y Nombre son obligatorios")
    const newSupplier = { id: crypto.randomUUID(), rif, name, address, taxpayerType, vatRetention, defaultAccountId }
    onCreate?.(newSupplier)
    setOpen(false)
  }

  async function handleLookupSENIAT() {
    const rifRegex = /^[VJEGP][0-9]{9}$/
    if (!rifRegex.test(rif)) { setRifValid(false); toast.error("Formato de RIF inválido. Ej: J000000001"); return }
    setIsLookingUp(true); setRifValid(null)
    try {
      // Simulación de búsqueda SENIAT: reemplazar por fetch real
      await new Promise((res) => setTimeout(res, 1500))
      setName(name || "Proveedor de Ejemplo C.A.")
      setTaxpayerType("Especial")
      setAddress(address || "Av. Principal #123, Caracas")
      setRifValid(true)
      toast.success("Datos obtenidos del SENIAT correctamente")
    } catch (err) {
      setRifValid(false)
      toast.error("No se pudo obtener la información del SENIAT")
    } finally { setIsLookingUp(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4"/> Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
          <DialogDescription>Registra los datos básicos del proveedor</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="RIF">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input id="rif" placeholder="Ej: J000000001" value={rif} onChange={(e) => setRif(e.target.value.toUpperCase())} className="pr-10" />
                {isLookingUp && (<Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />)}
                {!isLookingUp && rifValid === true && (<Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />)}
                {!isLookingUp && rifValid === false && (<X className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />)}
              </div>
              <Button type="button" onClick={handleLookupSENIAT} disabled={isLookingUp} variant="secondary">Buscar</Button>
            </div>
          </Field>
          <Field label="Nombre" ><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre o Razón Social" /></Field>
          <Field label="Dirección" >
            <Textarea id="direccion" rows={2} className="min-h-[72px] resize-y" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección completa del proveedor" />
          </Field>
          <Field label="Tipo de contribuyente">
            <Select value={taxpayerType} onValueChange={setTaxpayerType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ordinario">Ordinario</SelectItem>
                <SelectItem value="Especial">Especial</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Retención de IVA">
            <Select value={String(vatRetention)} onValueChange={(v) => setVatRetention(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cuenta de gasto predeterminada">
            <AccountPicker typeFilter="expense" value={defaultAccountId} onChange={setDefaultAccountId} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AccountPicker({ value, onChange, typeFilter }) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => { const byType = typeFilter ? COA.filter((a) => a.type === typeFilter) : COA; if (!q) return byType; const s = q.toLowerCase(); return byType.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) }, [q, typeFilter])
  const selected = findAccountById(value)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex w-full items-center gap-2">
          <Input value={selected ? accountLabel(selected) : q} onChange={(e) => { setQ(e.target.value); onChange("") }} placeholder="Código o nombre de cuenta" />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
        <div className="flex flex-col max-h-64 overflow-auto">
          {filtered.map((a) => (
            <button key={a.id} onClick={() => onChange(a.id)} className="text-left px-2 py-1 rounded hover:bg-muted">
              {a.code} — {a.name}
            </button>
          ))}
          {filtered.length === 0 && <div className="text-sm text-muted-foreground px-2">Sin resultados</div>}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }) { return (<div className="flex flex-col gap-1"><Label>{label}</Label>{children}</div>) }

// Helpers de GL
function makeLine(init = {}) { return { id: crypto.randomUUID(), accountId: init.accountId || "", amount: init.amount || "" } }

function ensureSystemLines(lines, { tax, total, noCreditoFiscal }) {
  const vatAcc = noCreditoFiscal ? COA.find((a) => a.type === "expense_nd_vat") : COA.find((a) => a.type === "tax_credit")
  const payAcc = COA.find((a) => a.type === "payable")
  const newLines = [...lines]
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)) newLines.push(makeLine({ accountId: vatAcc?.id, amount: fix2(tax || 0) }))
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === payAcc?.id)) newLines.push(makeLine({ accountId: payAcc?.id, amount: fix2(total || 0) }))
  return syncSystemLines(newLines, { tax, total, noCreditoFiscal })
}

function syncSystemLines(lines, { tax, total, noCreditoFiscal }) {
  const vatAcc = noCreditoFiscal ? COA.find((a) => a.type === "expense_nd_vat") : COA.find((a) => a.type === "tax_credit")
  const payAcc = COA.find((a) => a.type === "payable")
  let changed = lines.map((l) => { const acc = findAccountById(l.accountId); if (!acc) return l; if (acc.id === vatAcc?.id) return { ...l, amount: fix2(tax) }; if (acc.id === payAcc?.id) return { ...l, amount: fix2(total) }; return l })
  const hasVat = changed.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)
  if (!hasVat) { changed = changed.filter((l) => { const t = findAccountById(l.accountId)?.type; return t !== "tax_credit" && t !== "expense_nd_vat" }); changed.push(makeLine({ accountId: vatAcc?.id, amount: fix2(tax) })) }
  return changed
}

function autoFillFirstExpense(lines, accountId) { const idx = lines.findIndex((l) => !l.accountId || !findAccountById(l.accountId)); if (idx === -1) return lines; const acc = findAccountById(accountId); if (!acc || acc.type !== "expense") return lines; const copy = [...lines]; copy[idx] = { ...copy[idx], accountId }; return copy }

function computeBalance(lines) { return lines.reduce((acc, l) => { const a = findAccountById(l.accountId); const amt = Number(l.amount) || 0; if (!a) return acc; if (a.nature === "debit") acc.debit += amt; else acc.credit += amt; return acc }, { debit: 0, credit: 0 }) }

// Mock de consulta SENIAT (reemplazar por integración real)
async function mockSeniatLookup(rif) {
  // Simula latencia
  await new Promise((r) => setTimeout(r, 700))
  const clean = String(rif).replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  if (!clean) return null
  return {
    name: `Proveedor ${clean.substring(0, 4)}`,
    taxpayerType: clean.endsWith("0") ? "Especial" : "Ordinario",
    activity: "Comercio al por mayor (mock)",
    address: "Dirección SENIAT simulada (mock)",
  }
}
