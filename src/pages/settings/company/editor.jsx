import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Settings2,
  Users,
  UsersRound,
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react"

import CompanyBasic from "@/components/company/basic"
import CompanyServices from "@/components/company/services"
import CompanyBoard from "@/components/company/board"
import CompanyUsers from "@/components/company/users"

const API = "/api/companies"

const STEPS = [
  {
    id: "basic",
    label: "Información básica",
    shortLabel: "Básica",
    description: "Identidad, domicilio fiscal y datos de contacto",
    icon: Building2,
  },
  {
    id: "services",
    label: "Servicios contratados",
    shortLabel: "Servicios",
    description: "Módulos y alcance de los servicios habilitados",
    icon: Settings2,
  },
  {
    id: "board",
    label: "Junta y accionistas",
    shortLabel: "Junta",
    description: "Directivos, accionistas y actas mercantiles",
    icon: UsersRound,
  },
  {
    id: "users",
    label: "Usuarios y permisos",
    shortLabel: "Usuarios",
    description: "Accesos y roles del equipo de trabajo",
    icon: Users,
  },
]

export default function CompanyEditor() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

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
      contribType: "",
      economicActivity: "",
    },
    services: {
      accounting: false,
      taxes: true,
      taxDetails: {
        iva: true,
        ivaRetenciones: false,
        islrRetenciones: false,
        igtf: false,
        municipales: false,
      },
      parafiscales: true,
      payroll: true,
      payrollDetails: {
        frequency: "quincenal",
        txtFaov: true,
        recibos: true,
        liquidaciones: false,
        vacaciones: false,
        utilidades: false,
      },
    },
    board: {
      registryTome: "",
      registryDate: "",
      validityUntil: "",
      legalRep: "",
      contactName: "",
      shareCapital: "",
      shareholders: [],
      movements: [],
    },
    users: [],
  })

  function updateSection(section, patch) {
    setCompany((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }))
  }

  function goToStep(idx) {
    setCurrentStep(idx)
    setVisitedSteps((prev) => new Set([...prev, idx]))
  }

  function handleNext() {
    if (currentStep < STEPS.length - 1) goToStep(currentStep + 1)
  }

  function handleBack() {
    if (currentStep > 0) goToStep(currentStep - 1)
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
      setTimeout(() => navigate("/settings/company"), 1200)
    } catch {
      setError("No se pudo guardar la empresa. Revisa los campos obligatorios.")
    } finally {
      setSaving(false)
      setTimeout(() => setOk(false), 3500)
    }
  }

  const step = STEPS[currentStep]
  const StepIcon = step.icon
  const activeServices = Object.entries(company.services)
    .filter(([k, v]) => ["accounting", "taxes", "parafiscales", "payroll"].includes(k) && v === true)
    .length

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {company.basic.tradeName || "Nueva empresa"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {company.basic.rif ? `RIF: ${company.basic.rif}` : "Completa los datos de la empresa para comenzar"}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Sidebar de pasos */}
        <aside className="lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-3">
              <nav className="flex flex-row gap-1 lg:flex-col">
                {STEPS.map((s, idx) => {
                  const Icon = s.icon
                  const isActive = idx === currentStep
                  const isVisited = visitedSteps.has(idx) && idx !== currentStep
                  const isAccessible = idx <= Math.max(...visitedSteps) + 1

                  return (
                    <button
                      key={s.id}
                      onClick={() => isAccessible && goToStep(idx)}
                      disabled={!isAccessible}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors w-full",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isVisited
                          ? "text-foreground hover:bg-muted"
                          : isAccessible
                          ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                          : "text-muted-foreground/40 cursor-not-allowed",
                      )}
                    >
                      {/* Step number / check */}
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                          isActive
                            ? "border-primary-foreground bg-primary-foreground/20 text-primary-foreground"
                            : isVisited
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-current bg-transparent",
                        )}
                      >
                        {isVisited ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </span>
                      <span className="hidden lg:block">
                        <span className="block text-sm font-medium leading-none">{s.label}</span>
                        {isActive && (
                          <span
                            className={cn(
                              "mt-1 block text-xs leading-tight",
                              isActive ? "text-primary-foreground/75" : "text-muted-foreground",
                            )}
                          >
                            {s.description}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs font-medium lg:hidden">{s.shortLabel}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Resumen servicios (solo desktop) */}
              {activeServices > 0 && (
                <div className="mt-4 hidden lg:block">
                  <Separator className="mb-3" />
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Servicios activos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {company.services.accounting && <Badge variant="secondary">Contabilidad</Badge>}
                    {company.services.taxes && <Badge variant="secondary">Impuestos</Badge>}
                    {company.services.parafiscales && <Badge variant="secondary">Parafiscales</Badge>}
                    {company.services.payroll && <Badge variant="secondary">Nómina</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-6">
              {/* Step header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <StepIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-none">{step.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                  {currentStep + 1} / {STEPS.length}
                </Badge>
              </div>

              <Separator className="mb-6" />

              {/* Contenido de cada paso */}
              {currentStep === 0 && (
                <CompanyBasic
                  value={company.basic}
                  onChange={(patch) => updateSection("basic", patch)}
                />
              )}
              {currentStep === 1 && (
                <CompanyServices
                  value={company.services}
                  onChange={(patch) => updateSection("services", patch)}
                />
              )}
              {currentStep === 2 && (
                <CompanyBoard
                  value={company.board}
                  onChange={(patch) => updateSection("board", patch)}
                />
              )}
              {currentStep === 3 && (
                <CompanyUsers
                  value={company.users}
                  onChange={(list) => setCompany((prev) => ({ ...prev, users: list }))}
                />
              )}
            </CardContent>
          </Card>

          {/* Barra de navegación entre pasos */}
          <div className="mt-3 flex items-center justify-between rounded-xl border bg-background/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {error && <span className="text-sm text-red-500">{error}</span>}
              {ok && <span className="text-sm text-emerald-600">¡Empresa guardada!</span>}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => navigate("/settings/company")}>
                Cancelar
              </Button>
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} className="gap-1.5">
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={onSave} disabled={saving} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar empresa"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
