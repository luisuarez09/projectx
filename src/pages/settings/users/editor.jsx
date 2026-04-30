import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { ChevronLeft, User, ShieldCheck, Lock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { MOCK_USERS, USER_ROLES, ROLE_META } from "./_mock"

const baseSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Correo inválido"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["OWNER", "ADMIN_FIRMA", "CONTADOR_FIRMA", "AUDITOR", "CLIENTE"]),
  notes: z.string().optional().or(z.literal("")),
})

const createSchema = baseSchema.extend({
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

const editSchema = baseSchema

export default function UserEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const existingUser = isEdit ? MOCK_USERS.find((u) => u.id === id) : null

  const schema = isEdit ? editSchema : createSchema

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existingUser?.name || "",
      email: existingUser?.email || "",
      phone: existingUser?.phone || "",
      role: existingUser?.role || "CONTADOR_FIRMA",
      notes: existingUser?.notes || "",
      ...(isEdit ? {} : { password: "", confirmPassword: "" }),
    },
  })

  const [saving, setSaving] = useState(false)
  const selectedRole = form.watch("role")

  async function onSubmit() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    toast.success(isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente")
    navigate(isEdit ? `/settings/users/${id}` : "/settings/users")
  }

  if (isEdit && !existingUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Usuario no encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/settings/users")}>
          Volver a usuarios
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEdit ? `/settings/users/${id}` : "/settings/users")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? existingUser?.name : "Completa los datos del nuevo usuario de la firma"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Información personal */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Información personal</h2>
                <p className="text-xs text-muted-foreground">Datos de identificación del usuario</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nombre completo <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="Ej. María González" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+58 412-555-0000" {...form.register("phone")} />
              </div>

              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="email">Correo electrónico <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" placeholder="correo@dominio.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rol en la firma */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Rol en la firma</h2>
                <p className="text-xs text-muted-foreground">Define el nivel de acceso global del usuario</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-1.5">
              <Label>Rol <span className="text-destructive">*</span></Label>
              <Select
                value={form.watch("role")}
                onValueChange={(v) => form.setValue("role", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>

            {selectedRole && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${ROLE_META[selectedRole]?.color || ""}`}>
                <span className="font-medium">{ROLE_META[selectedRole]?.label}</span>
                <span className="mx-2">·</span>
                <span>{USER_ROLES.find((r) => r.value === selectedRole)?.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contraseña — solo al crear */}
        {!isEdit && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Contraseña de acceso</h2>
                  <p className="text-xs text-muted-foreground">El usuario podrá cambiarla desde su perfil</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Contraseña <span className="text-destructive">*</span></Label>
                  <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...form.register("password")} />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="confirmPassword">Confirmar contraseña <span className="text-destructive">*</span></Label>
                  <Input id="confirmPassword" type="password" placeholder="Repite la contraseña" {...form.register("confirmPassword")} />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notas */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Notas internas</h2>
                <p className="text-xs text-muted-foreground">Información adicional visible solo para administradores</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Ej. Cliente de Acme Inc, contactar por WhatsApp…"
                rows={3}
                {...form.register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-between rounded-xl border bg-background/80 p-3 backdrop-blur">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/settings/users/${id}` : "/settings/users")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </div>
  )
}
