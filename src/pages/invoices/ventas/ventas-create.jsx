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
import { Calendar } from "@/components/ui/calendar"
import { Toaster, toast } from "sonner"
import { ArrowLeft, Save, FilePlus2, UserPlus, Trash2, Plus, Search, Loader2, Check, X, CalendarIcon } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

/**
 * Ventas - Crear factura
 * - Campo único Código/Descripción con Command (teclado completo).
 * - Cantidad con stepper compacto.
 * - Al seleccionar ítem: Distribución contable agrega ingresos por defecto (base sin IVA),
 *   y se sincronizan IVA DF y CxC.
 */

// Plan de Cuentas (mock)
const COA = [
  { id: "4101", code: "4.1.1.01", name: "Ventas de productos", type: "income", nature: "credit" },
  { id: "4102", code: "4.1.1.02", name: "Ingresos por servicios", type: "income", nature: "credit" },
  { id: "2101", code: "2.1.01", name: "IVA Débito Fiscal", type: "tax_debit", nature: "credit" },
  { id: "1102", code: "1.1.02", name: "Cuentas por cobrar - Clientes", type: "receivable", nature: "debit" },
]
function findAccountById(id) { return COA.find((a) => a.id === id) }
function accountLabel(a) { return a ? `${a.code} — ${a.name}` : "" }
function fix2(n) { return (Number(n) || 0).toFixed(2) }
function norm(v) { return v.replace(/,/g, ".").replace(/[^0-9.]/g, "") }

// Productos/Servicios (mock) con stock e incomeAccountId
const PRODUCTS = [
  { id: "p-001", code: "SKU-001", name: "Cinta adhesiva 48mm", type: "product", unitPrice: 2.5, taxRate: 0.16, incomeAccountId: "4101", stock: 28 },
  { id: "p-002", code: "SKU-002", name: "Resma papel carta", type: "product", unitPrice: 6.0, taxRate: 0.16, incomeAccountId: "4101", stock: 12 },
  { id: "s-101", code: "SRV-101", name: "Servicio de consultoría", type: "service", unitPrice: 50.0, taxRate: 0.16, incomeAccountId: "4102" },
  { id: "s-200", code: "SRV-200", name: "Capacitación corporativa (E)", type: "service", unitPrice: 120.0, taxRate: 0.00, incomeAccountId: "4102" },
]

// Clientes (mock)
const CLIENTS_INIT = [
  { id: "cli-1", name: "Cliente Alfa, C.A.", rif: "J000000011", address: "", taxpayerType: "Ordinario" },
  { id: "cli-2", name: "Cliente Beta, S.R.L.", rif: "J000000012", address: "", taxpayerType: "Especial" },
]

// Fechas
function toDDMMYYYYFromISO(iso) { const d = new Date(iso); const dd = String(d.getDate()).padStart(2, "0"); const mm = String(d.getMonth() + 1).padStart(2, "0"); const yyyy = d.getFullYear(); return `${dd}/${mm}/${yyyy}` }
function nextNumber(last = "000019") { return String((Number(last) || 0) + 1).padStart(6, "0") }

export default function VentasInvoiceCreate({ onSaved, onCancel, lastNumber = "000019" }) {
  const [clients, setClients] = useState(CLIENTS_INIT)
  const [clientQuery, setClientQuery] = useState("")
  const [client, setClient] = useState(null)

  const [number] = useState(() => nextNumber(lastNumber))
  const [dateISO, setDateISO] = useState(() => new Date().toISOString().slice(0, 10))
  const [dateOpen, setDateOpen] = useState(false)
  const [currency, setCurrency] = useState("VEF")
  const [status] = useState("Borrador")

  const [items, setItems] = useState(() => [makeItem()])

  const totals = useMemo(() => computeTotals(items), [items])
  const { subtotal, taxableBase, exemptBase, taxTotal, grandTotal } = totals

  // GL lines = ingresos por defecto + IVA DF + CxC
  const [glLines, setGlLines] = useState(() => ensureSystemLines([], { tax: taxTotal, total: grandTotal }))

  // Sync IVA/CxC cuando cambien totales
  useEffect(() => { setGlLines((prev) => syncSystemLines(prev, { tax: taxTotal, total: grandTotal })) }, [taxTotal, grandTotal])

  // Recalcular líneas de ingreso al cambiar items
  useEffect(() => {
    setGlLines((prev) => {
      const others = prev.filter((l) => {
        const acc = findAccountById(l.accountId); return acc && acc.type !== "income"
      })
      const incomeLines = deriveIncomeLinesFromItems(items)
      return ensureSystemLines([...incomeLines, ...others], { tax: taxTotal, total: grandTotal })
    })
  }, [items])

  // Atajos
  useEffect(() => {
    function handler(e) { if (e.altKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); handleSave() } if (e.altKey && (e.key === "n" || e.key === "N")) { e.preventDefault(); handleSaveAndNew() } }
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler)
  })

  const balance = useMemo(() => computeBalance(glLines), [glLines])
  const unbalanced = Math.abs(balance.debit - balance.credit) > 0.009

  function handleSave() {
    if (!client) return toast.error("Selecciona o crea un cliente")
    if (items.length === 0 || items.every(i => !i.productId && !i.description)) return toast.error("Agrega al menos un renglón")
    if (unbalanced) return toast.error("La partida doble no cuadra")
    const payload = { type: "Factura Venta", number, date: dateISO, currency, client, items, totals, glLines: glLines.map((l) => ({ id: l.id, accountId: l.accountId, amount: Number(l.amount) || 0 })), status: "Pendiente" }
    toast.success("Factura de venta guardada")
    onSaved?.(payload)
  }
  function resetForm() { setClientQuery(""); setClient(null); setItems([makeItem()]); setGlLines(ensureSystemLines([], { tax: 0, total: 0 })) }
  function handleSaveAndNew() { handleSave(); resetForm() }

  // Items handlers
  function addItem() { setItems((prev) => [...prev, makeItem()]) }
  function removeItem(id) { setItems((prev) => prev.filter((i) => i.id !== id)) }
  function patchItem(id, patch) { setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i)) }
  function selectProduct(id, itemId) {
    const p = PRODUCTS.find(x => x.id === id)
    if (!p) return
    patchItem(itemId, { productId: p.id, code: p.code, description: p.name, unitPrice: String(p.unitPrice), taxRate: p.taxRate, incomeAccountId: p.incomeAccountId })
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
      <Toaster richColors position="bottom-right" />

      {/* Encabezado */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Ventas</span><span>/</span><span className="text-foreground">Registrar factura</span>
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
              <CardTitle className="text-base mb-1.5">Datos de la factura</CardTitle>
              <CardDescription>Completa los campos esenciales</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <Label>Cliente</Label>
                  <ClientCombo clients={clients} setClients={setClients} query={clientQuery} setQuery={setClientQuery} value={client} onChange={setClient} />
                </div>
                <ClientCreateButton onCreate={(c) => { setClients((prev) => [...prev, c]); setClient(c); toast.success("Cliente creado") }} />
              </div>
              <Field label="N° factura (correlativo)"><Input value={number} readOnly className="cursor-not-allowed" /></Field>
              <Field label="Fecha">
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between w-full">
                      {toDDMMYYYYFromISO(dateISO)}
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(dateISO)}
                      onSelect={(d) => { if (!d) return; const iso = d.toISOString().slice(0,10); setDateISO(iso); setDateOpen(false) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

          {/* Renglones de productos/servicios */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base mb-1.5">Detalle de ítems</CardTitle>
              <CardDescription>Selecciona productos/servicios. Los impuestos se aplican desde el inventario.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2">
                <div className="col-span-5">Código / Descripción</div>
                <div className="col-span-2 text-right">Cantidad</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-1 text-right">Impto</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1 text-right"> </div>
              </div>

              <div className="flex flex-col gap-2">
                {items.map((it) => {
                  const qty = Number(it.qty) || 0; const price = Number(it.unitPrice) || 0
                  const lineNet = qty * price
                  const taxAmt = +(lineNet * (Number(it.taxRate)||0)).toFixed(2)
                  const lineTotal = +(lineNet + taxAmt).toFixed(2)
                  return (
                    <div key={it.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <ProductCombo
                          value={it.productId}
                          onSelect={(pid) => selectProduct(pid, it.id)}
                          onFreeText={(txt) => patchItem(it.id,{ productId: "", code: "", description: txt })}
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <Input type="number" min="0" step="1" className="text-right w-20 sm:w-24 h-9 px-2" placeholder="0" value={it.qty}
                          onChange={(e)=>patchItem(it.id,{ qty: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input inputMode="decimal" className="text-right" placeholder="0.00" value={it.unitPrice} onChange={(e)=>patchItem(it.id,{ unitPrice: norm(e.target.value) })} />
                      </div>
                      <div className="sm:col-span-1 text-right text-sm">{((Number(it.taxRate)||0)*100).toFixed(0)}%</div>
                      <div className="sm:col-span-1 text-right text-sm">{fix2(lineTotal)}</div>
                      <div className="sm:col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={()=>removeItem(it.id)} title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                <div className="flex justify-between mt-2">
                  <Button variant="outline" className="gap-2" onClick={addItem}><Plus className="h-4 w-4"/> Agregar ítem</Button>
                  <div className="text-xs text-muted-foreground hidden sm:block">Los impuestos se traen del producto/servicio.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribución contable */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base mb-1.5">Distribución contable</CardTitle>
              <CardDescription>Ingresos por defecto desde los ítems. IVA DF (crédito) y CxC (débito) se ajustan automáticamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2">
                <div className="col-span-8">Cuenta</div>
                <div className="col-span-3 text-right">Monto</div>
                <div className="col-span-1 text-right"> </div>
              </div>

              <div className="flex flex-col gap-2">
                {glLines.map((l) => (
                  <div key={l.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-8">
                      <AccountPicker value={l.accountId} onChange={(val) => setGlLines((prev)=>prev.map(x=>x.id===l.id?{...x,accountId:val}:x))} />
                    </div>
                    <div className="sm:col-span-3">
                      <Input inputMode="decimal" className="text-right" value={l.amount} onChange={(e) => setGlLines((prev)=>prev.map(x=>x.id===l.id?{...x,amount:norm(e.target.value)}:x))} placeholder="0.00" />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setGlLines((prev)=>prev.filter(x=>x.id!==l.id))} title="Eliminar línea">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between mt-2">
                  <Button variant="outline" className="gap-2" onClick={()=>setGlLines(prev=>ensureSystemLines([...prev, makeLine()], { tax: taxTotal, total: grandTotal }))}><Plus className="h-4 w-4"/> Agregar línea</Button>
                  <div className="text-xs text-muted-foreground hidden sm:block">IVA DF (crédito) y CxC (débito) se ajustan al impuesto/total.</div>
                </div>

                <Separator className="my-3" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>Débitos: <strong>{fix2(balance.debit)}</strong></div>
                  <div>Créditos: <strong>{fix2(balance.credit)}</strong></div>
                  <div className="sm:col-span-2 text-right">{unbalanced ? (<span className="text-amber-700">Descuadre: {fix2(balance.debit - balance.credit)}</span>) : (<span className="text-emerald-700">Cuadrado</span>)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: resumen */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base mb-1.5">Resumen</CardTitle>
              <CardDescription>Revisa antes de guardar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="text-muted-foreground"><strong>Cliente:</strong> {client ? `${client.name} (${client.rif})` : "—"}</div>
              <div className="text-muted-foreground"><strong>N° Factura:</strong> {number}</div>
              <div className="text-muted-foreground"><strong>Fecha:</strong> {toDDMMYYYYFromISO(dateISO)}</div>
              <div className="text-muted-foreground"><strong>Moneda:</strong> {currency}</div>
              <Separator className="my-2" />
              <div><strong>Total:</strong> {fix2(grandTotal)}</div>
              <div className="text-muted-foreground">Subtotal: {fix2(subtotal)}</div>
              <div className="text-muted-foreground">Base gravable: {fix2(taxableBase)} · Exento: {fix2(exemptBase)}</div>
              <div className="text-muted-foreground">IVA: {fix2(taxTotal)}</div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base mb-1.5">Notas y adjuntos</CardTitle>
              <CardDescription>Opcional</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notas">
                <TabsList>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
                </TabsList>
                <TabsContent value="notas" className="pt-3"><Input placeholder="Observaciones (opcional)" /></TabsContent>
                <TabsContent value="adjuntos" className="pt-3 text-sm text-muted-foreground">Arrastra y suelta archivos aquí (placeholder)</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer móvil */}
      <div className="sm:hidden sticky bottom-0 z-20 bg-background border-t p-2 flex gap-2">
        <Button variant="outline" className="w-1/3" onClick={() => onCancel?.()}><ArrowLeft className="h-4 w-4 mr-1"/>Volver</Button>
        <Button variant="outline" className="w-1/3" onClick={handleSave}><Save className="h-4 w-4 mr-1"/>Guardar</Button>
        <Button className="w-1/3" onClick={handleSaveAndNew}><FilePlus2 className="h-4 w-4 mr-1"/>Nuevo</Button>
      </div>
    </div>
  )
}

// ——— Componentes auxiliares ———

function ClientCombo({ clients, setClients, query, setQuery, value, onChange }) {
  const [open, setOpen] = useState(false)
  const filtered = useMemo(() => {
    const s = (query || "").toLowerCase()
    return (clients || []).filter(
      c => c.name.toLowerCase().includes(s) || c.rif.toLowerCase().includes(s)
    )
  }, [query, clients])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            value={value ? `${value.name} (${value.rif})` : query}
            onChange={(e) => { onChange(null); setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
            placeholder="Nombre o RIF"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[--radix-popover-trigger-width]">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={(v) => setQuery(v)}
            placeholder="Escribe para buscar…"
          />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {filtered.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} (${c.rif})`}
                  onSelect={() => { onChange(c); setQuery(""); setOpen(false) }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium leading-tight">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.rif} · {c.taxpayerType}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ClientCreateButton({ onCreate, inlineQuery }) {
  const [open, setOpen] = useState(false)
  const [rif, setRif] = useState("")
  const [name, setName] = useState(inlineQuery || "")
  const [address, setAddress] = useState("")
  const [taxpayerType, setTaxpayerType] = useState("Ordinario")
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [rifValid, setRifValid] = useState(null)

  function handleCreate() {
    if (!name || !rif) return toast.error("RIF y Nombre son obligatorios")
    const newClient = { id: crypto.randomUUID(), rif, name, address, taxpayerType }
    onCreate?.(newClient)
    setOpen(false)
  }

  async function handleLookupSENIAT() {
    const rifRegex = /^[VJEGP][0-9]{9}$/
    if (!rifRegex.test(rif)) { setRifValid(false); toast.error("Formato de RIF inválido. Ej: J000000001"); return }
    setIsLookingUp(true); setRifValid(null)
    try {
      await new Promise((res) => setTimeout(res, 1200))
      setName(name || "Cliente de Ejemplo C.A.")
      setTaxpayerType("Especial")
      setAddress(address || "Av. Principal #456, Caracas")
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
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registra los datos básicos del cliente</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="RIF">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input id="rif" placeholder="Ej: J000000011" value={rif} onChange={(e) => setRif(e.target.value.toUpperCase())} className="pr-10" />
                {isLookingUp && (<Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />)}
                {!isLookingUp && rifValid === true && (<Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />)}
                {!isLookingUp && rifValid === false && (<X className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />)}
              </div>
              <Button type="button" onClick={handleLookupSENIAT} disabled={isLookingUp} variant="secondary">Buscar</Button>
            </div>
          </Field>
          <Field label="Nombre" ><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre o Razón Social" /></Field>
          <Field label="Dirección" >
            <Textarea id="direccion" rows={2} className="min-h-[72px] resize-y" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección completa del cliente" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Combo de productos con teclado + existencias
function ProductCombo({ value, onSelect, onFreeText }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const selected = PRODUCTS.find((p) => p.id === value)
  const filtered = useMemo(() => {
    const s = (input || "").toLowerCase()
    return PRODUCTS.filter((p) => p.code.toLowerCase().includes(s) || p.name.toLowerCase().includes(s))
  }, [input])

  const selectedStock = selected?.type === "product"
    ? PRODUCTS.find(p => p.id === selected.id)?.stock
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full relative">
          <Input
            value={selected ? `${selected.code} — ${selected.name}` : input}
            onChange={(e) => { const v = e.target.value; if (selected) { onSelect("") } setInput(v); onFreeText?.(v); setOpen(true) }}
            onFocus={() => input && setOpen(true)}
            placeholder="Código o descripción"
          />
          {selectedStock != null && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">
              Exist: {selectedStock}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[--radix-popover-trigger-width]">
        <Command shouldFilter={false}>
          <CommandInput value={input} onValueChange={(v) => { setInput(v); onFreeText?.(v) }} placeholder="Escribe para buscar…" />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {filtered.map((p) => (
                <CommandItem key={p.id} value={`${p.code} — ${p.name}`} onSelect={() => { onSelect(p.id); setInput(""); setOpen(false) }}>
                  <div className="flex w-full items-center justify-between">
                    <span>{p.code} — {p.name}</span>
                    {p.type === "product" && (
                      <span className="text-xs text-muted-foreground">Exist: {p.stock ?? 0}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function AccountPicker({ value, onChange }) {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => { if (!q) return COA; const s = q.toLowerCase(); return COA.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) }, [q])
  const selected = findAccountById(value)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 w-full">
          <Input value={selected ? accountLabel(selected) : q} onChange={(e) => { setQ(e.target.value); onChange("") }} placeholder="Cuenta contable" />
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        {filtered.map((a) => (
          <button key={a.id} onClick={() => onChange(a.id)} className="w-full text-left px-2 py-1 hover:bg-muted rounded">{a.code} — {a.name}</button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }) { return (<div className="flex flex-col gap-1"><Label>{label}</Label>{children}</div>) }

// Helpers
function makeItem() { return { id: crypto.randomUUID(), productId: "", code: "", description: "", qty: "1", unitPrice: "", taxRate: 0, incomeAccountId: "" } }

function computeTotals(items) {
  let subtotal = 0; let taxableBase = 0; let exemptBase = 0; let taxTotal = 0
  for (const it of items) {
    const qty = Number(it.qty) || 0
    const price = Number(it.unitPrice) || 0
    const net = qty * price
    const rate = Number(it.taxRate) || 0
    subtotal += net
    if (rate > 0) { taxableBase += net; taxTotal += +(net * rate).toFixed(2) } else { exemptBase += net }
  }
  const grandTotal = +(subtotal + taxTotal).toFixed(2)
  return { subtotal: +subtotal.toFixed(2), taxableBase: +taxableBase.toFixed(2), exemptBase: +exemptBase.toFixed(2), taxTotal: +taxTotal.toFixed(2), grandTotal }
}

function makeLine(init = {}) { return { id: crypto.randomUUID(), accountId: init.accountId || "", amount: init.amount || "" } }
function ensureSystemLines(lines, { tax, total }) {
  const vatAcc = COA.find((a) => a.type === "tax_debit")
  const recAcc = COA.find((a) => a.type === "receivable")
  let newLines = [...lines]
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)) newLines.push(makeLine({ accountId: vatAcc?.id, amount: fix2(tax || 0) }))
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === recAcc?.id)) newLines.push(makeLine({ accountId: recAcc?.id, amount: fix2(total || 0) }))
  return syncSystemLines(newLines, { tax, total })
}
function syncSystemLines(lines, { tax, total }) {
  const vatAcc = COA.find((a) => a.type === "tax_debit")
  const recAcc = COA.find((a) => a.type === "receivable")
  let changed = lines.map((l) => { const acc = findAccountById(l.accountId); if (!acc) return l; if (acc?.id === vatAcc?.id) return { ...l, amount: fix2(tax) }; if (acc?.id === recAcc?.id) return { ...l, amount: fix2(total) }; return l })
  const hasVat = changed.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)
  if (!hasVat) { changed = changed.filter((l) => findAccountById(l.accountId)?.type !== "tax_debit"); changed.push(makeLine({ accountId: vatAcc?.id, amount: fix2(tax) })) }
  return changed
}
function deriveIncomeLinesFromItems(items) {
  const map = new Map()
  for (const it of items) {
    const qty = Number(it.qty) || 0
    const price = Number(it.unitPrice) || 0
    const net = qty * price
    const accId = it.incomeAccountId || PRODUCTS.find(p=>p.id===it.productId)?.incomeAccountId
    if (!accId || net <= 0) continue
    map.set(accId, (map.get(accId) || 0) + net)
  }
  return Array.from(map.entries()).map(([accountId, amount]) => makeLine({ accountId, amount: fix2(amount) }))
}
function computeBalance(lines) { return lines.reduce((acc, l) => { const a = findAccountById(l.accountId); const amt = Number(l.amount) || 0; if (!a) return acc; if (a.nature === "debit") acc.debit += amt; else acc.credit += amt; return acc }, { debit: 0, credit: 0 }) }

// Mock SENIAT
async function mockSeniatLookup(rif) { await new Promise((r) => setTimeout(r, 700)); const clean = String(rif).replace(/[^A-Za-z0-9]/g, "").toUpperCase(); if (!clean) return null; return { name: `Cliente ${clean.substring(0, 4)}`, taxpayerType: clean.endsWith("0") ? "Especial" : "Ordinario", activity: "Servicios profesionales (mock)", address: "Dirección SENIAT simulada (mock)" } }
