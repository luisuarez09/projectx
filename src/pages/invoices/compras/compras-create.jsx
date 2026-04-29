import { useMemo, useState, useEffect, useRef } from "react"
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
import { ArrowLeft, Save, FilePlus2, UserPlus, Trash2, Plus, Search, Loader2, Check, X, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

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
function normalize(v) {
  if (!v) return "";
  let str = String(v);
  if (str.includes(',') && str.includes('.')) {
      str = str.replace(/\./g, "").replace(/,/g, ".");
  } else if (str.includes(',')) {
      str = str.replace(/,/g, ".");
  }
  let clean = str.replace(/[^0-9.]/g, "");
  let parts = clean.split(".");
  if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
  return clean;
}

function formatMoney(n) {
  const num = Number(n);
  if (isNaN(num)) return "0,00";
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function MoneyInput({ value, onChange, readOnly, ...props }) {
  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value ? formatMoney(value) : "");
    } else {
      setLocalValue(value ? String(value).replace(".", ",") : "");
    }
  }, [value, isFocused]);

  function handleChange(e) {
    const raw = e.target.value;
    setLocalValue(raw);
    if (onChange) onChange(normalize(raw));
  }

  return (
    <Input
      {...props}
      readOnly={readOnly}
      value={readOnly ? formatMoney(value) : (isFocused ? localValue : (value ? formatMoney(value) : ""))}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={handleChange}
    />
  );
}

// Conversión de fechas
function toISOFromDDMMYYYY(s) { const [dd, mm, yyyy] = (s || "").split("/"); if (!dd || !mm || !yyyy || yyyy.length !== 4) return new Date().toISOString().slice(0, 10); return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` }
function toDDMMYYYYFromISO(iso) { const d = new Date(iso); const dd = String(d.getDate()).padStart(2, "0"); const mm = String(d.getMonth() + 1).padStart(2, "0"); const yyyy = d.getFullYear(); return `${dd}/${mm}/${yyyy}` }
function parseDateForCalendar(iso) { const [yyyy, mm, dd] = iso.split("-"); return new Date(yyyy, mm - 1, dd) }

function handleDateTextChange(e, setDisplay, setISO) {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 8) val = val.slice(0, 8);
  
  let formatted = val;
  if (val.length > 2) formatted = val.slice(0, 2) + "/" + val.slice(2);
  if (val.length > 4) formatted = formatted.slice(0, 5) + "/" + val.slice(4);
  
  setDisplay(formatted);
  if (formatted.length === 10) {
    const iso = toISOFromDDMMYYYY(formatted);
    setISO(iso);
  }
}

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
                <Popover>
                  <div className="relative">
                    <Input 
                      value={dateDisplay} 
                      onChange={(e) => handleDateTextChange(e, setDateDisplay, setDateISO)} 
                      placeholder="DD/MM/AAAA" 
                    />
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" tabIndex="-1">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </div>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDateForCalendar(dateISO)}
                      onSelect={(date) => {
                        if (date) {
                          const iso = date.toISOString().slice(0, 10);
                          setDateISO(iso);
                          setDateDisplay(toDDMMYYYYFromISO(iso));
                        }
                      }}
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Totales</CardTitle>
              <CardDescription>Calculo automático de IVA 16%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <Field label="Base imponible">
                  <MoneyInput inputMode="decimal" value={base} onChange={(v) => setBase(v)} placeholder="0,00" />
                </Field>
                <Field label="Exento">
                  <MoneyInput inputMode="decimal" value={exempt} onChange={(v) => setExempt(v)} placeholder="0,00" />
                </Field>
                <Field label="IVA (16%)">
                  <MoneyInput value={tax} readOnly />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2">
                    <input id="nocf" type="checkbox" className="h-4 w-4" checked={noCreditoFiscal} onChange={(e) => setNoCreditoFiscal(e.target.checked)} />
                    <Label htmlFor="nocf">Sin derecho a crédito fiscal</Label>
                  </div>
                </div>
                <Field label="Total factura">
                  <MoneyInput value={total} readOnly />
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
                      <MoneyInput inputMode="decimal" className="text-right" value={l.amount} onChange={(v) => updateLine(l.id, { amount: v })} placeholder="0,00" />
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
                  <div>Débitos: <strong>{formatMoney(balance.debit)}</strong></div>
                  <div>Créditos: <strong>{formatMoney(balance.credit)}</strong></div>
                  <div className="sm:col-span-2 text-right">
                    {unbalanced ? (
                      <span className="text-amber-700">Descuadre: {formatMoney(balance.debit - balance.credit)}</span>
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
              <div><strong>Total:</strong> {formatMoney(total)}</div>
              <div className="text-muted-foreground">Base: {formatMoney(baseNum)} · Exento: {formatMoney(exemptNum)}</div>
              <div className="text-muted-foreground">IVA 16%: {formatMoney(tax)} {noCreditoFiscal ? "(no deducible)" : "(crédito fiscal)"}</div>
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
  const [open, setOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [rifValid, setRifValid] = useState(null)
  const containerRef = useRef(null)

  const matches = useMemo(() => {
    const list = suppliers || []
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter((s) => s.name.toLowerCase().includes(q) || s.rif.toLowerCase().includes(q))
  }, [query, suppliers])

  const showCreate = query && matches.length === 0

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(s) {
    onChange(s)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="flex gap-2 items-center">
      {/* Input con dropdown alineado */}
      <div className="relative flex-1">
        <Input
          className="pr-10"
          value={value ? `${value.name} (${value.rif})` : query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { onChange(null); setQuery(e.target.value); setOpen(true) }}
          placeholder="Buscar por nombre o RIF (ej.: J000000001)"
          autoComplete="off"
        />
        {isSearching && (<Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />)}
        {!isSearching && rifValid === true && (<Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />)}
        {!isSearching && rifValid === false && (<X className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />)}

        {/* Dropdown alineado al input */}
        {open && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-md p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {matches.map((s) => (
              <button
                key={s.id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
                className="text-left px-3 py-2 rounded text-sm hover:bg-muted transition-colors"
              >
                {s.name} <span className="text-muted-foreground text-xs">({s.rif})</span>
              </button>
            ))}
            {showCreate && (
              <div onMouseDown={(e) => e.preventDefault()}>
                <SupplierCreateButton
                  inlineQuery={query}
                  onCreate={(s) => { setSuppliers((prev) => [...prev, s]); handleSelect(s) }}
                />
              </div>
            )}
            {!showCreate && matches.length === 0 && (
              <div className="text-sm text-muted-foreground px-3 py-2">Escribe para buscar o crear</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const SENIAT_API = "/api/tools/seniat"

function SupplierCreateButton({ onCreate, inlineQuery }) {
  const [open, setOpen] = useState(false)
  const [rif, setRif] = useState("")
  const [name, setName] = useState(inlineQuery || "")
  const [address, setAddress] = useState("")
  const [taxpayerType, setTaxpayerType] = useState("Ordinario")
  const [vatRetention, setVatRetention] = useState(75)
  const [defaultAccountId, setDefaultAccountId] = useState("")

  // SENIAT CAPTCHA flow
  const [seniatStep, setSeniatStep] = useState("idle") // idle | loading-captcha | awaiting-captcha | looking-up | done | error
  const [sessionId, setSessionId] = useState(null)
  const [captchaUrl, setCaptchaUrl] = useState(null)
  const [captchaCode, setCaptchaCode] = useState("")
  const [captchaError, setCaptchaError] = useState("")
  const [rifValid, setRifValid] = useState(null) // null | true | false

  function resetSeniat() {
    setSeniatStep("idle"); setSessionId(null); setCaptchaUrl(null)
    setCaptchaCode(""); setCaptchaError(""); setRifValid(null)
  }

  // Paso 1: pedir sesión + captcha al backend
  async function startSeniatLookup() {
    const rifRegex = /^[VJEGP][0-9]{9}$/
    const clean = rif.toUpperCase().replace(/[^A-Z0-9]/g, "")
    if (!rifRegex.test(clean)) {
      setRifValid(false)
      toast.error("Formato de RIF inválido. Ej: J000000001")
      return
    }
    setRifValid(null)
    setSeniatStep("loading-captcha")
    setCaptchaError("")
    try {
      const r = await fetch(`${SENIAT_API}/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      setSessionId(data.sessionId)
      // Usar el proxy de Vite para la imagen del captcha
      setCaptchaUrl(data.captchaEndpoint)
      setSeniatStep("awaiting-captcha")
    } catch (e) {
      console.error(e)
      setCaptchaError("No se pudo conectar con la API. ¿Está corriendo el servidor?")
      setSeniatStep("error")
    }
  }

  // Paso 2: enviar RIF + captcha y recibir datos
  async function submitCaptcha() {
    if (!captchaCode.trim()) { setCaptchaError("Ingresa el código de seguridad"); return }
    setSeniatStep("looking-up")
    setCaptchaError("")
    try {
      const clean = rif.toUpperCase().replace(/[^A-Z0-9]/g, "")
      const r = await fetch(`${SENIAT_API}/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, rif: clean, captcha: captchaCode.trim() }),
      })
      const data = await r.json()
      if (!r.ok) {
        const msg = data?.error || "Error consultando SENIAT"
        if (/captcha/i.test(msg)) {
          setCaptchaError("Código incorrecto. Vuelve a intentarlo.")
          setCaptchaUrl(`${data.captchaEndpoint}?t=${Date.now()}`)
          setCaptchaCode("")
          setSeniatStep("awaiting-captcha")
        } else if (r.status === 404) {
          setCaptchaError("RIF no encontrado en SENIAT.")
          setSeniatStep("error")
          setRifValid(false)
        } else {
          setCaptchaError(msg)
          setSeniatStep("error")
        }
        return
      }
      // DEBUG: ver respuesta completa en consola del navegador
      console.log("[SENIAT response]", data)

      // Exito: aplicar SIEMPRE todos los campos (sin if-guards que puedan omitirlos)
      setName(data.legalName || "")
      setTaxpayerType(data.contribType === "Especial" ? "Especial" : "Ordinario")
      setVatRetention(data.vatRetention ?? 100)
      setRifValid(true)
      setSeniatStep("done")

      toast.success("Consulta realizada al SENIAT exitosamente")
    } catch (e) {
      console.error(e)
      setCaptchaError("Error de red. Intenta de nuevo.")
      setSeniatStep("error")
    }
  }

  function handleCreate() {
    if (!name || !rif) return toast.error("RIF y Nombre son obligatorios")
    const newSupplier = {
      id: crypto.randomUUID(),
      rif: rif.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      name, address, taxpayerType, vatRetention, defaultAccountId
    }
    onCreate?.(newSupplier)
    setOpen(false)
  }

  function handleOpenChange(v) {
    setOpen(v)
    if (!v) resetSeniat()
  }

  const isLoadingCaptcha = seniatStep === "loading-captcha"
  const isLookingUp = seniatStep === "looking-up"
  const showCaptchaBox = seniatStep === "awaiting-captcha" || isLookingUp

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4"/> Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
          <DialogDescription>
            Ingresa el RIF y consulta el SENIAT para autocompletar el nombre legal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* RIF + botón SENIAT */}
          <Field label="RIF">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="rif"
                  placeholder="Ej: J000000001"
                  value={rif}
                  onChange={(e) => { setRif(e.target.value.toUpperCase()); resetSeniat() }}
                  className="pr-10"
                  disabled={isLoadingCaptcha || isLookingUp}
                />
                {(isLoadingCaptcha || isLookingUp) && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!isLoadingCaptcha && !isLookingUp && rifValid === true && (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {!isLoadingCaptcha && !isLookingUp && rifValid === false && (
                  <X className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              <Button
                type="button"
                onClick={seniatStep === "idle" || seniatStep === "done" || seniatStep === "error" ? startSeniatLookup : undefined}
                disabled={isLoadingCaptcha || isLookingUp}
                variant="secondary"
                className="gap-1 whitespace-nowrap"
              >
                {isLoadingCaptcha ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar SENIAT
              </Button>
            </div>
          </Field>

          {/* Nombre */}
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre o Razón Social" />
          </Field>

          {/* CAPTCHA inline — ocupa las 2 columnas */}
          {showCaptchaBox && (
            <div className="sm:col-span-2 rounded-lg border bg-muted/40 p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">
                🔐 Verificación SENIAT — ingresa el código de la imagen:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Imagen del captcha */}
                <div className="flex flex-col items-center gap-1">
                  {captchaUrl && (
                    <img
                      src={captchaUrl}
                      alt="Código de seguridad SENIAT"
                      className="h-14 rounded border bg-white object-contain"
                      onError={() => setCaptchaError("No se pudo cargar la imagen del SENIAT.")}
                    />
                  )}
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                    onClick={startSeniatLookup}
                  >
                    ↻ Nuevo código
                  </button>
                </div>
                {/* Input del código */}
                <div className="flex flex-1 gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Código de seguridad"
                    value={captchaCode}
                    onChange={(e) => { setCaptchaCode(e.target.value); setCaptchaError("") }}
                    onKeyDown={(e) => { if (e.key === "Enter") submitCaptcha() }}
                    disabled={isLookingUp}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={submitCaptcha}
                    disabled={isLookingUp || !captchaCode.trim()}
                    className="gap-1"
                  >
                    {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Verificar
                  </Button>
                </div>
              </div>
              {captchaError && (
                <p className="text-sm text-destructive">{captchaError}</p>
              )}
            </div>
          )}

          {/* Error sin captcha */}
          {seniatStep === "error" && !showCaptchaBox && captchaError && (
            <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              {captchaError}{" "}
              <button className="underline" onClick={startSeniatLookup}>Reintentar</button>
            </div>
          )}

          {/* Resto de campos */}
          <Field label="Dirección">
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
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate}>Crear proveedor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AccountPicker({ value, onChange, typeFilter }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const filtered = useMemo(() => {
    const byType = typeFilter ? COA.filter((a) => a.type === typeFilter) : COA;
    if (!q) return byType;
    const s = q.toLowerCase();
    // Búsqueda por nombre o código de cuenta
    return byType.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
  }, [q, typeFilter]);

  const selected = findAccountById(value)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQ("")
        setFocusedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [q])

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[focusedIndex]
      if (el) {
        el.scrollIntoView({ block: "nearest" })
      }
    }
  }, [focusedIndex])

  function handleSelect(id) {
    onChange(id)
    setQ("")
    setOpen(false)
    setFocusedIndex(-1)
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        handleSelect(filtered[focusedIndex].id)
      } else if (filtered.length === 1) {
        handleSelect(filtered[0].id)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input 
          value={open ? q : (selected ? accountLabel(selected) : q)} 
          onFocus={() => { setOpen(true); setQ(""); }}
          onKeyDown={handleKeyDown}
          onChange={(e) => { 
            setQ(e.target.value); 
            setOpen(true); 
            if (selected) onChange(""); 
          }} 
          placeholder={selected ? accountLabel(selected) : "Código o nombre de cuenta"}
          className="pr-8" 
          autoComplete="off"
        />
        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      
      {open && (
        <div ref={listRef} className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-md p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
          {filtered.map((a, i) => (
            <button 
              key={a.id} 
              onMouseDown={(e) => { e.preventDefault(); handleSelect(a.id) }} 
              className={`text-left px-3 py-2 rounded text-sm transition-colors flex flex-col sm:flex-row sm:items-center sm:gap-2 ${i === focusedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            >
              <span className="font-medium whitespace-nowrap">{a.code}</span>
              <span className="text-muted-foreground sm:border-l sm:pl-2">{a.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground px-3 py-2">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) { return (<div className="flex flex-col gap-1"><Label>{label}</Label>{children}</div>) }

// Helpers de GL
function makeLine(init = {}) { return { id: crypto.randomUUID(), accountId: init.accountId || "", amount: init.amount || "" } }

function ensureSystemLines(lines, { tax, total, noCreditoFiscal }) {
  const vatAcc = noCreditoFiscal ? COA.find((a) => a.type === "expense_nd_vat") : COA.find((a) => a.type === "tax_credit")
  const payAcc = COA.find((a) => a.type === "payable")
  const newLines = [...lines]
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)) newLines.push(makeLine({ accountId: vatAcc?.id, amount: (Number(tax) || 0).toFixed(2) }))
  if (!newLines.some((l) => findAccountById(l.accountId)?.id === payAcc?.id)) newLines.push(makeLine({ accountId: payAcc?.id, amount: (Number(total) || 0).toFixed(2) }))
  return syncSystemLines(newLines, { tax, total, noCreditoFiscal })
}

function syncSystemLines(lines, { tax, total, noCreditoFiscal }) {
  const vatAcc = noCreditoFiscal ? COA.find((a) => a.type === "expense_nd_vat") : COA.find((a) => a.type === "tax_credit")
  const payAcc = COA.find((a) => a.type === "payable")
  let changed = lines.map((l) => { const acc = findAccountById(l.accountId); if (!acc) return l; if (acc.id === vatAcc?.id) return { ...l, amount: (Number(tax) || 0).toFixed(2) }; if (acc.id === payAcc?.id) return { ...l, amount: (Number(total) || 0).toFixed(2) }; return l })
  const hasVat = changed.some((l) => findAccountById(l.accountId)?.id === vatAcc?.id)
  if (!hasVat) { changed = changed.filter((l) => { const t = findAccountById(l.accountId)?.type; return t !== "tax_credit" && t !== "expense_nd_vat" }); changed.push(makeLine({ accountId: vatAcc?.id, amount: (Number(tax) || 0).toFixed(2) })) }
  return changed
}

function autoFillFirstExpense(lines, accountId) { const idx = lines.findIndex((l) => !l.accountId || !findAccountById(l.accountId)); if (idx === -1) return lines; const acc = findAccountById(accountId); if (!acc || acc.type !== "expense") return lines; const copy = [...lines]; copy[idx] = { ...copy[idx], accountId }; return copy }

function computeBalance(lines) { return lines.reduce((acc, l) => { const a = findAccountById(l.accountId); const amt = Number(l.amount) || 0; if (!a) return acc; if (a.nature === "debit") acc.debit += amt; else acc.credit += amt; return acc }, { debit: 0, credit: 0 }) }

// Funciones de utilidad eliminadas
