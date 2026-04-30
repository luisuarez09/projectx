import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft, Building2, Edit3, Power, Trash2, Plus, MoreHorizontal,
  ShieldCheck, CalendarDays, Mail, Phone, StickyNote, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  MOCK_USERS, MOCK_COMPANIES, MODULE_LIST, COMPANY_PROFILES,
  PROFILE_DEFAULT_MODULES, PROFILE_META, ROLE_META, USER_ROLES,
} from "./_mock"
import { UserAvatar } from "@/components/users/table/columns"

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    const found = MOCK_USERS.find((u) => u.id === id)
    return found ? { ...found, companies: [...found.companies] } : null
  })

  const [profileEdit, setProfileEdit] = useState(false)
  const [profileDraft, setProfileDraft] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [accessDialog, setAccessDialog] = useState({ open: false, mode: "add", companyId: null })
  const [accessForm, setAccessForm] = useState({ companyId: "", profile: "contador_firma", modules: [] })
  const [removeConfirm, setRemoveConfirm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Usuario no encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/settings/users")}>
          Volver a usuarios
        </Button>
      </div>
    )
  }

  const roleMeta = ROLE_META[user.role] || { label: user.role, color: "" }
  const availableCompanies = MOCK_COMPANIES.filter(
    (c) => !user.companies.some((uc) => uc.id === c.id) || accessDialog.companyId === c.id
  )
  const moduleCount = new Set(user.companies.flatMap((c) => c.modules)).size

  // Profile tab helpers
  function startProfileEdit() {
    setProfileDraft({ name: user.name, email: user.email, phone: user.phone || "", notes: user.notes || "", role: user.role })
    setProfileEdit(true)
  }
  async function saveProfile() {
    setSavingProfile(true)
    await new Promise((r) => setTimeout(r, 600))
    setUser((prev) => ({ ...prev, ...profileDraft }))
    setSavingProfile(false)
    setProfileEdit(false)
    toast.success("Perfil actualizado")
  }

  // Company access helpers
  function openAddDialog() {
    const firstAvailable = MOCK_COMPANIES.find((c) => !user.companies.some((uc) => uc.id === c.id))
    setAccessForm({
      companyId: firstAvailable?.id || "",
      profile: "contador_firma",
      modules: PROFILE_DEFAULT_MODULES["contador_firma"] || [],
    })
    setAccessDialog({ open: true, mode: "add", companyId: null })
  }

  function openEditDialog(companyId) {
    const ca = user.companies.find((c) => c.id === companyId)
    if (!ca) return
    setAccessForm({ companyId: ca.id, profile: ca.profile, modules: [...ca.modules] })
    setAccessDialog({ open: true, mode: "edit", companyId })
  }

  function handleProfileChange(profile) {
    setAccessForm((prev) => ({
      ...prev,
      profile,
      modules: PROFILE_DEFAULT_MODULES[profile] || [],
    }))
  }

  function toggleModule(key) {
    setAccessForm((prev) => ({
      ...prev,
      modules: prev.modules.includes(key)
        ? prev.modules.filter((m) => m !== key)
        : [...prev.modules, key],
    }))
  }

  function saveAccess() {
    if (!accessForm.companyId) return
    const company = MOCK_COMPANIES.find((c) => c.id === accessForm.companyId)
    if (!company) return

    setUser((prev) => {
      if (accessDialog.mode === "add") {
        return {
          ...prev,
          companies: [
            ...prev.companies,
            { id: company.id, tradeName: company.tradeName, rif: company.rif, profile: accessForm.profile, modules: accessForm.modules },
          ],
        }
      } else {
        return {
          ...prev,
          companies: prev.companies.map((c) =>
            c.id === accessDialog.companyId
              ? { ...c, profile: accessForm.profile, modules: accessForm.modules }
              : c
          ),
        }
      }
    })
    setAccessDialog({ open: false, mode: "add", companyId: null })
    toast.success(accessDialog.mode === "add" ? "Empresa agregada" : "Acceso actualizado")
  }

  function removeCompanyAccess(companyId) {
    setUser((prev) => ({ ...prev, companies: prev.companies.filter((c) => c.id !== companyId) }))
    setRemoveConfirm(null)
    toast.success("Acceso eliminado")
  }

  function toggleUserStatus() {
    setUser((prev) => ({ ...prev, isActive: !prev.isActive }))
    toast.success(user.isActive ? "Usuario desactivado" : "Usuario activado")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <button onClick={() => navigate("/settings/users")} className="hover:text-foreground transition-colors">
          Usuarios
        </button>
        <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        <span className="text-foreground font-medium">{user.name}</span>
      </div>

      {/* User header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <UserAvatar name={user.name} size="lg" />

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{user.name}</h1>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
                {user.isActive ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Inactivo
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Desde {user.createdAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/settings/users/${id}/edit`)}>
                <Edit3 className="h-3.5 w-3.5" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onClick={toggleUserStatus}>
                    <Power className="h-4 w-4" />
                    {user.isActive ? "Desactivar usuario" : "Activar usuario"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-semibold">{user.companies.length}</div>
              <div className="text-xs text-muted-foreground">Empresa{user.companies.length !== 1 ? "s" : ""}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xl font-semibold">{moduleCount}</div>
              <div className="text-xs text-muted-foreground">Módulo{moduleCount !== 1 ? "s" : ""} activos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hidden sm:block">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">{user.createdAt}</div>
              <div className="text-xs text-muted-foreground">Fecha de alta</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="empresas">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="empresas">
            Acceso a empresas
            {user.companies.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                {user.companies.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        {/* Tab: Perfil */}
        <TabsContent value="perfil" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Información del usuario</h2>
                  <p className="text-sm text-muted-foreground">Datos personales y configuración de rol</p>
                </div>
                {!profileEdit ? (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={startProfileEdit}>
                    <Edit3 className="h-3.5 w-3.5" /> Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setProfileEdit(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" disabled={savingProfile} onClick={saveProfile}>
                      {savingProfile ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {!profileEdit ? (
                <dl className="grid gap-5 sm:grid-cols-2">
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Correo electrónico" value={user.email} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={user.phone || "—"} />
                  <InfoRow
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Rol en la firma"
                    value={
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleMeta.color}`}>
                        {roleMeta.label}
                      </span>
                    }
                  />
                  <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Alta en el sistema" value={user.createdAt} />
                  {user.notes && (
                    <div className="sm:col-span-2">
                      <InfoRow icon={<StickyNote className="h-4 w-4" />} label="Notas internas" value={user.notes} />
                    </div>
                  )}
                </dl>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Nombre completo</Label>
                    <Input value={profileDraft.name} onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Teléfono</Label>
                    <Input value={profileDraft.phone} onChange={(e) => setProfileDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="+58 412-000-0000" />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Correo electrónico</Label>
                    <Input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Rol en la firma</Label>
                    <Select value={profileDraft.role} onValueChange={(v) => setProfileDraft((p) => ({ ...p, role: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label>Notas internas</Label>
                    <Textarea rows={3} value={profileDraft.notes} onChange={(e) => setProfileDraft((p) => ({ ...p, notes: e.target.value }))} placeholder="Observaciones sobre este usuario…" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Acceso a empresas */}
        <TabsContent value="empresas" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Acceso a empresas</h2>
                  <p className="text-sm text-muted-foreground">
                    Define en qué empresas tiene acceso y con qué perfil y módulos.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 self-start sm:self-auto"
                  onClick={openAddDialog}
                  disabled={availableCompanies.filter((c) => !user.companies.some((uc) => uc.id === c.id)).length === 0}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar empresa
                </Button>
              </div>

              <Separator />

              {user.companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Sin acceso a empresas</p>
                    <p className="text-sm text-muted-foreground">Agrega una empresa para definir el perfil y módulos del usuario.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={openAddDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Agregar empresa
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b h-10">
                        <th className="px-3 text-left font-medium">Empresa</th>
                        <th className="px-3 text-left font-medium">RIF</th>
                        <th className="px-3 text-left font-medium">Perfil</th>
                        <th className="px-3 text-left font-medium">Módulos</th>
                        <th className="px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.companies.map((ca) => {
                        const pm = PROFILE_META[ca.profile] || { label: ca.profile, color: "" }
                        return (
                          <tr key={ca.id} className="border-b last:border-0">
                            <td className="px-3 py-3 font-medium">{ca.tradeName}</td>
                            <td className="px-3 py-3 text-muted-foreground">{ca.rif}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${pm.color}`}>
                                {pm.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {ca.modules.map((m) => {
                                  const ml = MODULE_LIST.find((mod) => mod.key === m)
                                  return (
                                    <span key={m} className="inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-xs">
                                      {ml?.label || m}
                                    </span>
                                  )
                                })}
                                {ca.modules.length === 0 && <span className="text-muted-foreground text-xs">Sin módulos</span>}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(ca.id)}>
                                    Editar acceso
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => setRemoveConfirm(ca.id)}>
                                    Quitar empresa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="actividad" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Registro de actividad</p>
                  <p className="text-sm text-muted-foreground">El historial de acciones del usuario estará disponible próximamente.</p>
                </div>
                <Badge variant="outline">Próximamente</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Agregar / Editar acceso a empresa */}
      <Dialog open={accessDialog.open} onOpenChange={(open) => !open && setAccessDialog((p) => ({ ...p, open: false }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {accessDialog.mode === "add" ? "Agregar acceso a empresa" : "Editar acceso a empresa"}
            </DialogTitle>
            <DialogDescription>
              {accessDialog.mode === "add"
                ? "Selecciona la empresa y define el perfil y módulos del usuario."
                : "Modifica el perfil y los módulos de acceso de esta empresa."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Empresa */}
            <div className="grid gap-1.5">
              <Label>Empresa <span className="text-destructive">*</span></Label>
              {accessDialog.mode === "add" ? (
                <Select
                  value={accessForm.companyId}
                  onValueChange={(v) => setAccessForm((p) => ({ ...p, companyId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_COMPANIES.filter((c) => !user.companies.some((uc) => uc.id === c.id)).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.tradeName} <span className="text-muted-foreground">· {c.rif}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border px-3 py-2 text-sm bg-muted/50">
                  {user.companies.find((c) => c.id === accessDialog.companyId)?.tradeName}
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="grid gap-1.5">
              <Label>Perfil de acceso <span className="text-destructive">*</span></Label>
              <div className="grid gap-2">
                {COMPANY_PROFILES.map((p) => {
                  const pm = PROFILE_META[p.value]
                  const selected = accessForm.profile === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleProfileChange(p.value)}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                      <div>
                        <div className="text-sm font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Módulos */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Módulos con acceso</Label>
                <span className="text-xs text-muted-foreground">{accessForm.modules.length} seleccionado{accessForm.modules.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MODULE_LIST.map((m) => (
                  <label key={m.key} className="flex cursor-pointer items-center gap-2.5 rounded-md border p-2.5 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={accessForm.modules.includes(m.key)}
                      onCheckedChange={() => toggleModule(m.key)}
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccessDialog((p) => ({ ...p, open: false }))}>
              Cancelar
            </Button>
            <Button
              onClick={saveAccess}
              disabled={!accessForm.companyId}
            >
              {accessDialog.mode === "add" ? "Agregar empresa" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm remove company */}
      <AlertDialog open={!!removeConfirm} onOpenChange={(open) => !open && setRemoveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar acceso a esta empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{user.name}</strong> perderá todo el acceso a{" "}
              <strong>{user.companies.find((c) => c.id === removeConfirm)?.tradeName}</strong>.
              Esta acción se puede revertir volviendo a agregar la empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeCompanyAccess(removeConfirm)}
            >
              Quitar acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete user */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{user.name}</strong> permanentemente. Perderá acceso a todas las empresas y esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.success("Usuario eliminado")
                navigate("/settings/users")
              }}
            >
              Eliminar usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div>
        <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}
