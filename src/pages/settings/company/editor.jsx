import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import CompanyBasic from "@/components/company/basic"
import CompanyServices from "@/components/company/services"
import CompanyBoard from "@/components/company/board"
import CompanyUsers from "@/components/company/users"

const API = "/api/companies"

export default function CompanySettings() {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [ok, setOk] = useState(false)

    // Estado maestro del formulario (secciones)
    const [company, setCompany] = useState({
        basic: {
            logoDataUrl: "",
            tradeName: "",
            legalName: "",
            rif: "",
            fiscalAddress: "",
            socials: { website: "", instagram: "", x: "", linkedin: "" },
            mapsUrl: "",
            contact: { name: "", role: "", phone: "" },
        },
        services: {
            accounting: false,
            taxes: true,
            parafiscales: true,
            payroll: true,
        },
        board: {
            registryTome: "",
            registryDate: "",
            validityUntil: "",
            legalRep: "",
            contactName: "",
            shareCapital: "",
            shareholders: [],      // { name, id, percent, amount }
            movements: [],         // { date, type, note }
        },
        users: [],               // { email, role, modules[] }
    })

    function updateSection(section, patch) {
        setCompany(prev => ({ ...prev, [section]: { ...prev[section], ...patch } }))
    }

    async function onSave() {
        setSaving(true)
        setError("")
        setOk(false)
        try {
            const resp = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(company),
            })
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
            setOk(true)
            // opcional: redirigir o limpiar
        } catch (e) {
            setError("No se pudo guardar la empresa. Revisa los campos obligatorios.")
        } finally {
            setSaving(false)
            setTimeout(() => setOk(false), 3500)
        }
    }

    return (
        <div className="mx-auto max-w-6xl space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Empresa</CardTitle>
                    <CardDescription>Configura los datos de tu empresa y los módulos habilitados.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                        <ScrollArea orientation="horizontal" className="-mx-3 mb-2 w-[calc(100%+1.5rem)] px-3 sm:mx-0 sm:w-full">
                            <div className="pb-1">
                                <TabsList className="w-max rounded-md bg-muted p-1 sm:w-auto">
                                    <TabsTrigger className="shrink-0 px-3 py-1 text-sm sm:px-3 sm:py-1.5" value="basic">
                                        Información básica
                                    </TabsTrigger>
                                    <TabsTrigger className="shrink-0 px-3 py-1 text-sm sm:px-3 sm:py-1.5" value="services">
                                        Servicios contratados
                                    </TabsTrigger>
                                    <TabsTrigger className="shrink-0 px-3 py-1 text-sm sm:px-3 sm:py-1.5" value="board">
                                        Junta y accionistas
                                    </TabsTrigger>
                                    <TabsTrigger className="shrink-0 px-3 py-1 text-sm sm:px-3 sm:py-1.5" value="users">
                                        Usuarios y permisos
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        <Separator className="my-4" />

                        <TabsContent value="basic">
                            <CompanyBasic value={company.basic} onChange={(patch) => updateSection("basic", patch)} />
                        </TabsContent>

                        <TabsContent value="services">
                            <CompanyServices value={company.services} onChange={(patch) => updateSection("services", patch)} />
                        </TabsContent>

                        <TabsContent value="board">
                            <CompanyBoard value={company.board} onChange={(patch) => updateSection("board", patch)} />
                        </TabsContent>

                        <TabsContent value="users">
                            <CompanyUsers value={company.users} onChange={(list) => setCompany(prev => ({ ...prev, users: list }))} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Barra de acciones fija */}
            <div className="sticky bottom-3 z-40">
                <div className="mx-auto max-w-6xl rounded-xl border bg-background/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-end gap-2">
                        {error && <span className="mr-auto text-sm text-red-500">{error}</span>}
                        {ok && <span className="mr-auto text-sm text-emerald-600">¡Guardado!</span>}
                        <Button variant="secondary">Cancelar</Button>
                        <Button onClick={onSave} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}