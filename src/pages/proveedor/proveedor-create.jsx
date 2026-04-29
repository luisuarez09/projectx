import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// icons
import { ArrowLeft, Building2, CheckCircle2, FileText, History, Loader2, Plus, RefreshCw, Save, Search, Tags } from "lucide-react"

const SENIAT_API = "/api/tools/seniat/lookup"

/**
 * Página de creación de PROVEEDORES (full-page, no modal)
 * - Inspirada en Odoo y CRMs modernos
 * - Sticky header con acciones principales
 * - Secciones en tabs: Básico, Fiscal, Contacto, Bancos, Configuración
 * - Búsqueda SENIAT con feedback visual (loading -> ok)
 * - Validaciones con zod/react-hook-form
 * - Listo para multi-empresa y multi-usuario
 */

const schema = z.object({
  empresaId: z.string().min(1, "Selecciona la empresa"),
  rif: z
    .string()
    .min(9, "RIF inválido")
    .max(12, "RIF inválido"),
  nombre: z.string().min(3, "El nombre es requerido"),
  tipoContribuyente: z.enum(["ordinario", "especial"], {
    required_error: "Selecciona el tipo de contribuyente",
  }),
  direccion: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
  contacto: z.string().optional(),
  monedaPreferida: z.enum(["USD", "VES", "EUR"]).default("USD"),
  plazoPago: z.enum(["contado", "7", "15", "30", "45", "60"]).default("30"),
  retencionIVA: z.enum(["0%", "75%", "100%"]).default("100%"),
  regimenISLR: z.enum(["no-aplica", "ordinario", "especial"]).default("no-aplica"),
  cuentaGasto: z.string().optional(),
  activo: z.boolean().default(true),
  esTransportista: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export default function ProveedorCreatePage() {
  const [seniatState, setSeniatState] = useState(/** @type {"idle"|"loading"|"ok"|"error"} */("idle"))

  // CAPTCHA dialog state
  const [captchaOpen, setCaptchaOpen] = useState(false)
  const [captchaSession, setCaptchaSession] = useState(/** @type {string|null} */(null))
  const [captchaEndpoint, setCaptchaEndpoint] = useState(/** @type {string|null} */(null))
  const [captchaInput, setCaptchaInput] = useState("")
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [captchaImgKey, setCaptchaImgKey] = useState(0) // force img reload
  const [tagInput, setTagInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      empresaId: "1",
      rif: "",
      nombre: "",
      tipoContribuyente: undefined,
      direccion: "",
      email: "",
      telefono: "",
      sitioWeb: "",
      contacto: "",
      monedaPreferida: "USD",
      plazoPago: "30",
      retencionIVA: "100%",
      regimenISLR: "no-aplica",
      cuentaGasto: "",
      activo: true,
      esTransportista: false,
      tags: [],
    },
  })

  const rif = watch("rif")
  const tags = watch("tags") || []
  const tipoContribuyente = watch("tipoContribuyente")
  const retencionIVA = watch("retencionIVA")

  // Normaliza RIF (sin guiones, mayúsculas)
  const onRifChange = (val) => {
    const clean = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    setValue("rif", clean, { shouldDirty: true })
  }

  // Paso 1: iniciar sesión SENIAT y mostrar diálogo de CAPTCHA
  const buscarEnSeniat = async () => {
    if (!rif || rif.length < 9) {
      toast.warning("Ingresa un RIF válido antes de buscar (ej: J012345678)")
      return
    }
    setSeniatState("loading")
    try {
      const resp = await fetch(SENIAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init: true }),
      })
      if (!resp.ok) throw new Error("Error al iniciar sesión con SENIAT")
      const { sessionId, captchaEndpoint: endpoint } = await resp.json()
      setCaptchaSession(sessionId)
      setCaptchaEndpoint(endpoint)
      setCaptchaInput("")
      setCaptchaImgKey((k) => k + 1)
      setSeniatState("idle")
      setCaptchaOpen(true)
    } catch (e) {
      setSeniatState("error")
      toast.error("No se pudo conectar con el servidor SENIAT. ¿Está corriendo 'npm run seniat'?")
    }
  }

  // Paso 2: enviar CAPTCHA y obtener datos del contribuyente
  const submitCaptcha = async () => {
    if (!captchaInput.trim()) {
      toast.warning("Ingresa el código del CAPTCHA")
      return
    }
    setCaptchaLoading(true)
    try {
      const resp = await fetch(SENIAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: captchaSession,
          rif,
          captcha: captchaInput.trim(),
        }),
      })
      const data = await resp.json()

      if (!resp.ok) {
        if (resp.status === 400) {
          // CAPTCHA incorrecto → refrescar imagen
          toast.error(data.error || "CAPTCHA incorrecto. Intenta de nuevo.")
          setCaptchaInput("")
          setCaptchaImgKey((k) => k + 1)
          return
        }
        if (resp.status === 410) {
          toast.error("La sesión expiró. Vuelve a hacer clic en Buscar.")
          setCaptchaOpen(false)
          return
        }
        if (resp.status === 404) {
          toast.error("RIF no encontrado en el SENIAT.")
          setCaptchaOpen(false)
          return
        }
        throw new Error(data.error || "Error desconocido")
      }

      // Éxito: poblar campos del formulario
      const { legalName, contribType, vatRetention } = data
      if (legalName) setValue("nombre", legalName, { shouldDirty: true })
      if (contribType) {
        const tipo = contribType.toLowerCase() === "especial" ? "especial" : "ordinario"
        setValue("tipoContribuyente", tipo, { shouldDirty: true })
      }
      if (vatRetention !== undefined) {
        // vatRetention viene como número: 75, 100, 0
        const pct = vatRetention === 75 ? "75%" : vatRetention === 0 ? "0%" : "100%"
        setValue("retencionIVA", pct, { shouldDirty: true })
      }

      setSeniatState("ok")
      setCaptchaOpen(false)
      toast.success("Consulta realizada al SENIAT exitosamente")
    } catch (e) {
      toast.error("Error al consultar el SENIAT: " + e.message)
      setSeniatState("error")
    } finally {
      setCaptchaLoading(false)
    }
  }

  const onSubmit = async (data) => {
    // aquí iría tu llamada a la API (POST /api/proveedores)
    await new Promise((r) => setTimeout(r, 900))
    toast.success("Proveedor creado correctamente")
    // redirigir a detalle, lista, o limpiar formulario
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (!t) return
    if (tags.includes(t)) return setTagInput("")
    setValue("tags", [...tags, t], { shouldDirty: true })
    setTagInput("")
  }

  const removeTag = (t) => setValue("tags", tags.filter((x) => x !== t), { shouldDirty: true })

  // Teclas rápidas (Ctrl+S para guardar)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSubmit(onSubmit)()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleSubmit])

  return (
    <div className="min-h-screen">
      {/* Diálogo de CAPTCHA SENIAT */}
      <Dialog open={captchaOpen} onOpenChange={(v) => { if (!captchaLoading) setCaptchaOpen(v) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación SENIAT</DialogTitle>
            <DialogDescription>
              Ingresa el código que aparece en la imagen para consultar el RIF{" "}
              <span className="font-semibold text-foreground">{rif}</span> en el portal del SENIAT.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Imagen del CAPTCHA */}
            <div className="flex items-center justify-center rounded-lg border bg-muted p-3">
              {captchaEndpoint ? (
                <img
                  key={captchaImgKey}
                  src={`${captchaEndpoint}?t=${captchaImgKey}`}
                  alt="CAPTCHA SENIAT"
                  className="max-h-20 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="self-end gap-1 text-xs text-muted-foreground"
              onClick={() => setCaptchaImgKey((k) => k + 1)}
              disabled={captchaLoading}
            >
              <RefreshCw className="h-3 w-3" /> No veo bien la imagen
            </Button>

            <div className="flex flex-col gap-1">
              <Label htmlFor="captcha-input">Código del CAPTCHA</Label>
              <Input
                id="captcha-input"
                autoFocus
                autoComplete="off"
                placeholder="Escribe el código aquí"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCaptcha()}
                disabled={captchaLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCaptchaOpen(false)} disabled={captchaLoading}>
              Cancelar
            </Button>
            <Button onClick={submitCaptcha} disabled={captchaLoading || !captchaInput.trim()}>
              {captchaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Consultar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Encabezado pegajoso */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => history.back()} aria-label="Volver">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-xl font-semibold leading-tight">Nuevo proveedor</h1>
              <p className="text-sm text-muted-foreground">Crea un proveedor para tus compras y gastos</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Descartar</Button>
              <Button disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Empresa</span>
          <Select defaultValue="1" {...register("empresaId")}
            onValueChange={(v) => setValue("empresaId", v, { shouldDirty: true })}>
            <SelectTrigger className="h-8 w-56">
              <SelectValue placeholder="Selecciona empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Matriz</SelectItem>
              <SelectItem value="2">Sucursal Caracas</SelectItem>
            </SelectContent>
          </Select>
          {errors.empresaId && <span className="text-destructive">· {errors.empresaId.message}</span>}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Columna principal */}
          <div className="xl:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <Label>RIF</Label>
                    <div className="mt-2 flex gap-2">
                      <Input placeholder="J012345678" {...register("rif")}
                        value={rif}
                        onChange={(e) => onRifChange(e.target.value)}
                      />
                      <Button type="button" onClick={buscarEnSeniat} variant="secondary" disabled={seniatState === "loading"}>
                        {seniatState === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {seniatState === "ok" && <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />}
                        {seniatState === "idle" && <Search className="mr-2 h-4 w-4" />}
                        Buscar
                      </Button>
                    </div>
                    {errors.rif && <p className="mt-1 text-xs text-destructive">{errors.rif.message}</p>}
                  </div>

                  <div className="sm:col-span-7">
                    <Label>Nombre o Razón Social</Label>
                    <Input className="mt-2" placeholder="Proveedor de Ejemplo C.A." {...register("nombre")} />
                    {errors.nombre && <p className="mt-1 text-xs text-destructive">{errors.nombre.message}</p>}
                  </div>

                  <div className="sm:col-span-6">
                    <Label>Tipo de contribuyente</Label>
                    <Select
                      value={tipoContribuyente}
                      onValueChange={(v) => setValue("tipoContribuyente", v, { shouldDirty: true })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ordinario">Ordinario</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoContribuyente && (
                      <p className="mt-1 text-xs text-destructive">{errors.tipoContribuyente.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <Label>Dirección fiscal</Label>
                    <Textarea rows={3} className="mt-2" placeholder="Av. Principal #123, Ciudad" {...register("direccion")} />
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="contacto" className="w-full">
                  <TabsList>
                    <TabsTrigger value="contacto">Contacto</TabsTrigger>
                    <TabsTrigger value="bancos">Bancos</TabsTrigger>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contacto" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <Label>Email</Label>
                        <Input className="mt-2" placeholder="correo@proveedor.com" {...register("email")} />
                        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input className="mt-2" placeholder="+58 412 000 0000" {...register("telefono")} />
                      </div>
                      <div>
                        <Label>Sitio web</Label>
                        <Input className="mt-2" placeholder="https://" {...register("sitioWeb")} />
                        {errors.sitioWeb && <p className="mt-1 text-xs text-destructive">{errors.sitioWeb.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label>Persona de contacto</Label>
                      <Input className="mt-2" placeholder="Nombre y apellido" {...register("contacto")} />
                    </div>
                  </TabsContent>

                  <TabsContent value="bancos" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">Puedes registrar varias cuentas luego en la ficha del proveedor. Aquí define la preferida para pagos rápidos.</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <Label>Banco</Label>
                        <Input className="mt-2" placeholder="Nombre del banco" />
                      </div>
                      <div>
                        <Label>Número de cuenta</Label>
                        <Input className="mt-2" placeholder="0000-0000-00-0000000000" />
                      </div>
                      <div>
                        <Label>Titular</Label>
                        <Input className="mt-2" placeholder="Razon social / Persona" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <Label>Moneda preferida</Label>
                        <Select defaultValue="USD" onValueChange={(v) => setValue("monedaPreferida", v, { shouldDirty: true })}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="VES">VES</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Plazo de pago</Label>
                        <Select defaultValue="30" onValueChange={(v) => setValue("plazoPago", v, { shouldDirty: true })}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contado">Contado</SelectItem>
                            <SelectItem value="7">7 días</SelectItem>
                            <SelectItem value="15">15 días</SelectItem>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="45">45 días</SelectItem>
                            <SelectItem value="60">60 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Retención de IVA</Label>
                        <Select value={retencionIVA} onValueChange={(v) => setValue("retencionIVA", v, { shouldDirty: true })}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100%">100%</SelectItem>
                            <SelectItem value="75%">75%</SelectItem>
                            <SelectItem value="0%">0%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Régimen ISLR</Label>
                        <Select defaultValue="no-aplica" onValueChange={(v) => setValue("regimenISLR", v, { shouldDirty: true })}>
                          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-aplica">No aplica</SelectItem>
                            <SelectItem value="ordinario">Ordinario</SelectItem>
                            <SelectItem value="especial">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Cuenta de gasto predeterminada</Label>
                        <Input className="mt-2" placeholder="Buscar o pegar código contable" {...register("cuentaGasto")} />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch id="activo" defaultChecked {...register("activo")} />
                        <Label htmlFor="activo">Proveedor activo</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch id="transportista" {...register("esTransportista")} />
                        <Label htmlFor="transportista">Es transportista</Label>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Label className="flex items-center gap-2"><Tags className="h-4 w-4" />Etiquetas</Label>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {tags.map((t) => (
                          <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeTag(t)}>
                            {t} ×
                          </Badge>
                        ))}
                        <Input
                          className="w-40"
                          placeholder="Añadir etiqueta"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas internas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea rows={4} placeholder="Notas visibles solo para tu equipo (acuerdos, particularidades, etc.)" />
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral: smart buttons + timeline */}
          <div className="xl:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accesos rápidos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Compras</Button>
                <Button variant="outline"><History className="mr-2 h-4 w-4" />Historial</Button>
                <Button variant="outline">Documentos</Button>
                <Button variant="outline">Conciliaciones</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seguimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-56 pr-4">
                  <ul className="space-y-4 text-sm">
                    <li>
                      <div className="font-medium">Creación</div>
                      <div className="text-muted-foreground">Se creará el proveedor al guardar</div>
                    </li>
                    <li>
                      <div className="font-medium">Eventos</div>
                      <div className="text-muted-foreground">Los cambios importantes aparecerán aquí</div>
                    </li>
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barra de estado sujeta a cambios */}
        <div className={cn("mt-8 rounded-lg border p-4 text-sm", isDirty ? "border-yellow-500/50 bg-yellow-500/10" : "border-muted")}> 
          {isDirty ? "Hay cambios sin guardar (Ctrl+S para guardar rápidamente)." : "Todo al día."}
        </div>
      </div>
    </div>
  )
}