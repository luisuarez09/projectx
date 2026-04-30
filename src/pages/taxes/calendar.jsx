import { useEffect, useMemo, useState } from "react"
import {
  IconAlertCircle,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendarDue,
  IconCheck,
  IconChecklist,
  IconClockHour4,
  IconCopy,
  IconMailForward,
  IconReceiptTax,
  IconRosetteDiscountCheck,
  IconUserCircle,
} from "@tabler/icons-react"
import { Toaster, toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const USERS = [
  { id: "luis", name: "Luis Suárez", role: "Socio fiscal" },
  { id: "paola", name: "Paola Méndez", role: "Analista tributaria" },
  { id: "andres", name: "Andrés Vera", role: "Coordinador de cartera" },
]

const COMPANIES = [
  { id: "ceres", name: "Agroinversiones Ceres, C.A.", rif: "J-504429562", special: false, manager: "Luis Suárez", sector: "Agroindustrial" },
  { id: "altos", name: "Centro Médico Altos, C.A.", rif: "J-403808880", special: true, manager: "Paola Méndez", sector: "Salud" },
  { id: "navis", name: "Grupo Navis Occidente, C.A.", rif: "J-309951440", special: false, manager: "Andrés Vera", sector: "Logística" },
  { id: "ferresum", name: "Construcciones Ferresum, C.A.", rif: "J-506236508", special: true, manager: "Paola Méndez", sector: "Construcción" },
  { id: "vision", name: "Óptica Visión de Águila, C.A.", rif: "J-506434377", special: false, manager: "Luis Suárez", sector: "Retail" },
]

const TAX_RULES = [
  {
    id: "iva", label: "IVA",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 15) }],
  },
  {
    id: "retislr", label: "Ret. ISLR",
    getPeriods: (company, year, month) =>
      company.special
        ? [{ id: "M", label: "Mensual", dueDate: dueSpecialRetention(company, year, month) }]
        : [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 10) }],
  },
  {
    id: "retiva", label: "Ret. IVA",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [],
  },
  {
    id: "igtf", label: "IGTF",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [],
  },
  {
    id: "municipal", label: "Municipal",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 10) }],
  },
  {
    id: "ivss", label: "IVSS",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueNthBusinessDayNextMonth(year, month, 5) }],
  },
  {
    id: "faov", label: "FAOV",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueNthBusinessDayNextMonth(year, month, 5) }],
  },
  {
    id: "inces", label: "INCES",
    getPeriods: (_, year, month) =>
      isQuarterDueMonth(month)
        ? [{ id: "T", label: `Trimestre Q${getQuarterFromDueMonth(month)}`, dueDate: nthBusinessDay(year, month, 5) }]
        : [],
  },
  {
    id: "rnet", label: "RNET",
    getPeriods: (_, year, month) =>
      isQuarterDueMonth(month)
        ? [{ id: "T", label: `Trimestre Q${getQuarterFromDueMonth(month)}`, dueDate: nthBusinessDay(year, month, 15) }]
        : [],
  },
]

const INITIAL_STATE = {
  "2026-04": {
    ceres: {
      iva: { declarations: [{ period: "M", date: "2026-04-14", amount: 1250, userId: "luis" }] },
      retislr: { declarations: [{ period: "M", date: "2026-04-09", amount: 320, userId: "luis" }], paid: true, paidDate: "2026-04-11", paidUserId: "luis" },
      municipal: { declarations: [{ period: "M", date: "2026-04-25", amount: 460, userId: "andres" }] },
      inces: { declarations: [{ period: "T", date: "2026-04-04", amount: 185, userId: "luis" }] },
      rnet: { declarations: [{ period: "T", date: "2026-04-12", amount: 0, userId: "luis" }] },
    },
    altos: {
      iva: { declarations: [{ period: "1Q", date: "2026-04-16", amount: 880, userId: "paola" }, { period: "2Q", date: "2026-04-29", amount: 910, userId: "paola" }] },
      retislr: { declarations: [{ period: "M", date: "2026-04-28", amount: 540, userId: "paola" }] },
      retiva: { declarations: [{ period: "1Q", date: "2026-04-16", amount: 300, userId: "paola" }, { period: "2Q", date: "2026-04-29", amount: 280, userId: "paola" }] },
      igtf: { declarations: [{ period: "1Q", date: "2026-04-16", amount: 120, userId: "paola" }, { period: "2Q", date: "2026-04-29", amount: 145, userId: "paola" }] },
      inces: { declarations: [{ period: "T", date: "2026-04-03", amount: 240, userId: "paola" }] },
      rnet: { declarations: [{ period: "T", date: "2026-04-15", amount: 0, userId: "paola" }] },
    },
    navis: {
      iva: { declarations: [{ period: "M", date: "2026-04-21", amount: 1960, userId: "andres" }] },
      municipal: { declarations: [{ period: "M", date: "2026-04-27", amount: 515, userId: "andres" }] },
      ivss: { declarations: [{ period: "M", date: "2026-04-30", amount: 230, userId: "andres" }] },
      inces: { declarations: [{ period: "T", date: "2026-04-05", amount: 310, userId: "andres" }], paid: true, paidDate: "2026-04-05", paidUserId: "andres" },
    },
    ferresum: {
      iva: { declarations: [{ period: "1Q", date: "2026-04-18", amount: 620, userId: "paola" }] },
      retislr: { declarations: [{ period: "M", date: "2026-04-20", amount: 190, userId: "paola" }] },
      retiva: { declarations: [{ period: "1Q", date: "2026-04-18", amount: 165, userId: "paola" }] },
      faov: { declarations: [{ period: "M", date: "2026-04-30", amount: 140, userId: "paola" }] },
    },
    vision: {
      iva: { declarations: [{ period: "M", date: "2026-04-12", amount: 780, userId: "luis" }], paid: true, paidDate: "2026-04-13", paidUserId: "luis" },
      retislr: { declarations: [{ period: "M", date: "2026-04-10", amount: 210, userId: "luis" }] },
    },
  },
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function lastDigit(rif) {
  const match = String(rif).match(/(\d)(?!.*\d)/)
  return match ? Number.parseInt(match[1], 10) : 0
}
function clampDay(year, month, day) {
  return Math.min(day, new Date(year, month, 0).getDate())
}
function nextMonth(year, month) {
  const next = month === 12 ? 1 : month + 1
  return [month === 12 ? year + 1 : year, next]
}
function dueFixedNextMonth(year, month, day) {
  const [ny, nm] = nextMonth(year, month)
  return new Date(ny, nm - 1, clampDay(ny, nm, day))
}
function nthBusinessDay(year, month, number) {
  let day = 1, counter = 0
  while (day <= 31) {
    const d = new Date(year, month - 1, day)
    if (d.getMonth() !== month - 1) break
    if (d.getDay() !== 0 && d.getDay() !== 6 && ++counter === number) return d
    day++
  }
  return new Date(year, month - 1, 1)
}
function dueNthBusinessDayNextMonth(year, month, number) {
  const [ny, nm] = nextMonth(year, month)
  return nthBusinessDay(ny, nm, number)
}
function getQuarterFromDueMonth(month) {
  return { 1: 4, 4: 1, 7: 2, 10: 3 }[month] || null
}
function isQuarterDueMonth(month) {
  return [1, 4, 7, 10].includes(month)
}
function dueSpecialFirstHalf(company, year, month) {
  return new Date(year, month - 1, clampDay(year, month, 17 + lastDigit(company.rif)))
}
function dueSpecialSecondHalf(company, year, month) {
  const [ny, nm] = nextMonth(year, month)
  return new Date(ny, nm - 1, clampDay(ny, nm, 2 + lastDigit(company.rif)))
}
function dueSpecialRetention(company, year, month) {
  const [ny, nm] = nextMonth(year, month)
  return new Date(ny, nm - 1, clampDay(ny, nm, 4 + lastDigit(company.rif)))
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatDate(date) {
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short" }).format(date)
}
function formatDateValue(dateString) {
  if (!dateString) return "—"
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${dateString}T00:00:00`))
}
function formatDateTime(date) {
  return new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)
}
function formatMoney(amount) {
  return new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES", minimumFractionDigits: 2 }).format(Number(amount || 0))
}

// ── Business logic ────────────────────────────────────────────────────────────

function getRuleResult(company, rule, year, month) {
  const periods = rule.getPeriods(company, year, month)
  return { applies: periods.length > 0, periods }
}
function isDeclared(state, periods) {
  if (!state?.declarations?.length) return false
  return periods.every((p) => state.declarations.some((d) => d.period === p.id))
}
function totalDeclared(state) {
  return (state?.declarations || []).reduce((sum, d) => sum + Number(d.amount || 0), 0)
}
function getCellStatus(state, periods, today) {
  if (isDeclared(state, periods) && state?.paid) return "done"
  const nextDue = periods.map((p) => p.dueDate).sort((a, b) => a - b)[0]
  if (!nextDue) return "pending"
  const diff = Math.ceil((nextDue - today) / 86400000)
  if (diff < 0 && !isDeclared(state, periods)) return "overdue"
  if (diff <= 7 && !state?.paid) return "upcoming"
  return "pending"
}
function getCompanyTypeLabel(company) {
  return company.special ? "Contribuyente especial" : "Contribuyente ordinario"
}
function buildCommitmentSummary(company, year, month, periodState) {
  const items = TAX_RULES.flatMap((rule) => {
    const result = getRuleResult(company, rule, year, month)
    if (!result.applies) return []
    const state = periodState?.[company.id]?.[rule.id]
    if (!state?.declarations?.length) return []
    return state.declarations
      .filter((d) => Number(d.amount || 0) > 0)
      .map((d) => {
        const meta = result.periods.find((p) => p.id === d.period)
        return {
          id: `${rule.id}-${d.period}`,
          obligation: rule.label,
          periodLabel: meta?.label || d.period,
          dueDate: meta?.dueDate || new Date(),
          declaredAt: d.date,
          amount: Number(d.amount || 0),
          paid: Boolean(state?.paid),
          paidDate: state?.paidDate || null,
        }
      })
  })
  const total = items.reduce((s, i) => s + i.amount, 0)
  const paid = items.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0)
  const pending = items.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0)
  return { company, items: items.sort((a, b) => a.dueDate - b.dueDate), total, paid, pending }
}

// ── WhatsApp text ─────────────────────────────────────────────────────────────

function buildCommitmentText(summary, periodLabel) {
  if (!summary) return ""
  const lines = [
    `*${summary.company.name}*`,
    `RIF: ${summary.company.rif}`,
    `${getCompanyTypeLabel(summary.company)}`,
    "",
    `📅 *Compromisos tributarios · ${periodLabel}*`,
    "",
  ]
  if (!summary.items.length) {
    lines.push("✅ Sin compromisos pendientes para este período.")
  } else {
    summary.items.forEach((item) => {
      const icon = item.paid ? "✅" : "🟡"
      lines.push(`${icon} *${item.obligation}* (${item.periodLabel}) — ${formatMoney(item.amount)} · vence ${formatDate(item.dueDate)}`)
    })
    lines.push("")
    lines.push("─────────────────────────")
    lines.push(`💼 *Total período:* ${formatMoney(summary.total)}`)
    if (summary.paid > 0) lines.push(`✅ *Pagado:* ${formatMoney(summary.paid)}`)
    lines.push(`🏦 *Por transferir:* *${formatMoney(summary.pending)}*`)
  }
  lines.push("")
  lines.push("_Al confirmar la transferencia procesamos el pago._")
  return lines.join("\n")
}

// ── SVG image ─────────────────────────────────────────────────────────────────

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;")
}

function buildCommitmentSvg(summary, periodLabel) {
  const width = 900
  const font = "Geist Variable, Geist, system-ui, -apple-system, sans-serif"
  const darkHeaderH = 90
  const titleAreaH = 56
  const headerHeight = darkHeaderH + titleAreaH
  const itemHeight = 52
  const footerHeight = 136
  const noteHeight = 40
  const bodyHeight = Math.max(summary.items.length, 1) * itemHeight
  const height = headerHeight + bodyHeight + footerHeight + noteHeight + 24

  const pendingLabel = summary.pending > 0 ? "Pendiente por transferir" : "Total cubierto"
  const generatedAt = formatDateTime(new Date())

  const itemsMarkup = summary.items.length
    ? summary.items.map((item, i) => {
        const y = headerHeight + i * itemHeight
        const fill = i % 2 === 0 ? "rgba(15,23,42,0.035)" : "transparent"
        return `
          <rect x="36" y="${y}" width="828" height="${itemHeight}" rx="8" fill="${fill}" />
          <text x="56" y="${y + 21}" font-size="15" font-weight="600" fill="#0f172a" font-family="${font}">${escapeXml(item.obligation)} · ${escapeXml(item.periodLabel)}</text>
          <text x="56" y="${y + 38}" font-size="12" fill="#64748b" font-family="${font}">Vence ${escapeXml(formatDate(item.dueDate))} · Declarado ${escapeXml(formatDateValue(item.declaredAt))}</text>
          <text x="844" y="${y + 30}" text-anchor="end" font-size="16" font-weight="700" fill="#0f172a" font-family="${font}">${escapeXml(formatMoney(item.amount))}</text>
        `
      }).join("")
    : `
      <rect x="36" y="${headerHeight}" width="828" height="${itemHeight}" rx="8" fill="rgba(15,23,42,0.035)" />
      <text x="450" y="${headerHeight + 30}" text-anchor="middle" font-size="14" fill="#64748b" font-family="${font}">Sin compromisos pendientes en este período.</text>
    `

  const footerY = headerHeight + bodyHeight + 20
  const noteY = footerY + footerHeight + 4

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#f8fafc" />
    <rect x="0" y="0" width="${width}" height="${darkHeaderH}" fill="#0f172a" />
    <text x="36" y="36" font-size="21" font-weight="700" fill="#ffffff" font-family="${font}">${escapeXml(summary.company.name)}</text>
    <text x="36" y="62" font-size="12" fill="#94a3b8" font-family="${font}">${escapeXml(summary.company.rif)} · ${escapeXml(getCompanyTypeLabel(summary.company))}</text>
    <text x="36" y="${darkHeaderH + 26}" font-size="17" font-weight="700" fill="#0f172a" font-family="${font}">Compromisos de pago</text>
    <text x="36" y="${darkHeaderH + 46}" font-size="12" fill="#64748b" font-family="${font}">${escapeXml(periodLabel)}</text>
    ${itemsMarkup}
    <rect x="36" y="${footerY}" width="828" height="${footerHeight - 4}" rx="12" fill="#ffffff" stroke="rgba(15,23,42,0.09)" stroke-width="1" />
    <text x="56" y="${footerY + 28}" font-size="12" fill="#64748b" font-family="${font}">Total del período</text>
    <text x="844" y="${footerY + 28}" text-anchor="end" font-size="15" font-weight="700" fill="#0f172a" font-family="${font}">${escapeXml(formatMoney(summary.total))}</text>
    <line x1="56" y1="${footerY + 40}" x2="844" y2="${footerY + 40}" stroke="rgba(15,23,42,0.07)" stroke-width="1" />
    <text x="56" y="${footerY + 60}" font-size="12" fill="#64748b" font-family="${font}">Pagado</text>
    <text x="844" y="${footerY + 60}" text-anchor="end" font-size="14" font-weight="600" fill="#16a34a" font-family="${font}">${escapeXml(formatMoney(summary.paid))}</text>
    <line x1="56" y1="${footerY + 72}" x2="844" y2="${footerY + 72}" stroke="rgba(15,23,42,0.07)" stroke-width="1" />
    <text x="56" y="${footerY + 98}" font-size="14" font-weight="700" fill="#0f172a" font-family="${font}">${escapeXml(pendingLabel)}</text>
    <text x="844" y="${footerY + 98}" text-anchor="end" font-size="19" font-weight="800" fill="#0f172a" font-family="${font}">${escapeXml(formatMoney(summary.pending))}</text>
    <text x="36" y="${noteY + 16}" font-size="11" fill="#94a3b8" font-family="${font}">Generado el ${escapeXml(generatedAt)} · Confirme la transferencia para procesar el pago</text>
  </svg>`

  return { svg, width, height }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaxCalendarPage() {
  const today = useMemo(() => new Date(), [])
  const currentUserId = USERS[0].id
  const initialPeriod = useMemo(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }, [])

  const [selectedYear, setSelectedYear] = useState(initialPeriod.year)
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month)
  const [cellState, setCellState] = useState(INITIAL_STATE)
  const [declarationDialog, setDeclarationDialog] = useState(null)
  const [declarationDraft, setDeclarationDraft] = useState([])
  const [commitmentCompanyId, setCommitmentCompanyId] = useState(COMPANIES[1].id)
  const [commitmentDialogOpen, setCommitmentDialogOpen] = useState(false)
  const [commitmentLoading, setCommitmentLoading] = useState(false)
  const [commitmentSort, setCommitmentSort] = useState("desc")

  const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
  const periodLabel = `${MONTHS_ES[selectedMonth - 1]} ${selectedYear}`
  const yearOptions = useMemo(() => {
    const b = initialPeriod.year
    return [b - 1, b, b + 1]
  }, [initialPeriod.year])

  const visibleRules = useMemo(
    () => TAX_RULES.filter((rule) => COMPANIES.some((c) => getRuleResult(c, rule, selectedYear, selectedMonth).applies)),
    [selectedYear, selectedMonth]
  )
  const currentPeriodState = useMemo(() => cellState[periodKey] || {}, [cellState, periodKey])

  const companyRows = useMemo(
    () =>
      COMPANIES.map((company) => ({
        company,
        cells: visibleRules.map((rule) => {
          const result = getRuleResult(company, rule, selectedYear, selectedMonth)
          const state = currentPeriodState?.[company.id]?.[rule.id] || {}
          return { company, rule, result, state, status: result.applies ? getCellStatus(state, result.periods, today) : "na" }
        }),
      })),
    [currentPeriodState, selectedMonth, selectedYear, today, visibleRules]
  )

  const dashboardMetrics = useMemo(() => {
    let tracked = 0, completed = 0, dueSoon = 0, overdue = 0, pendingAmount = 0
    companyRows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (!cell.result.applies) return
        tracked++
        if (cell.status === "done") completed++
        if (cell.status === "upcoming") dueSoon++
        if (cell.status === "overdue") overdue++
      })
      pendingAmount += buildCommitmentSummary(row.company, selectedYear, selectedMonth, currentPeriodState).pending
    })
    const completionRate = tracked ? Math.round((completed / tracked) * 100) : 0
    return { tracked, completed, dueSoon, overdue, pendingAmount, completionRate, pending: Math.max(0, tracked - completed - dueSoon - overdue) }
  }, [companyRows, currentPeriodState, selectedMonth, selectedYear])

  const commitmentSummaries = useMemo(
    () =>
      COMPANIES.map((c) => buildCommitmentSummary(c, selectedYear, selectedMonth, currentPeriodState))
        .sort((a, b) => commitmentSort === "desc" ? b.pending - a.pending : a.pending - b.pending),
    [commitmentSort, currentPeriodState, selectedMonth, selectedYear]
  )

  const selectedCommitmentSummary = useMemo(
    () => commitmentSummaries.find((s) => s.company.id === commitmentCompanyId) || commitmentSummaries[0],
    [commitmentCompanyId, commitmentSummaries]
  )

  const commitmentMessage = useMemo(
    () => buildCommitmentText(selectedCommitmentSummary, periodLabel),
    [periodLabel, selectedCommitmentSummary]
  )

  // Loading effect when company changes in dialog
  useEffect(() => {
    if (!commitmentDialogOpen) return
    setCommitmentLoading(true)
    const t = setTimeout(() => setCommitmentLoading(false), 350)
    return () => clearTimeout(t)
  }, [commitmentCompanyId, commitmentDialogOpen])

  useEffect(() => {
    if (!selectedCommitmentSummary && commitmentSummaries.length) {
      setCommitmentCompanyId(commitmentSummaries[0].company.id)
    }
  }, [commitmentSummaries, selectedCommitmentSummary])

  function updateState(companyId, ruleId, patch) {
    setCellState((cur) => ({
      ...cur,
      [periodKey]: {
        ...(cur[periodKey] || {}),
        [companyId]: {
          ...((cur[periodKey] || {})[companyId] || {}),
          [ruleId]: {
            ...(((cur[periodKey] || {})[companyId] || {})[ruleId] || {}),
            ...patch,
          },
        },
      },
    }))
  }

  function clearDeclarations(companyId, ruleId) {
    updateState(companyId, ruleId, { declarations: [], paid: false, paidDate: null, paidUserId: null })
    toast.success("Declaración reiniciada")
  }

  function openDeclarationEditor(company, rule, result, state) {
    setDeclarationDialog({ company, rule, periods: result.periods })
    setDeclarationDraft(
      result.periods.map((period) => {
        const existing = state?.declarations?.find((d) => d.period === period.id)
        return {
          period: period.id,
          label: period.label,
          dueDate: period.dueDate,
          date: existing?.date || new Date().toISOString().slice(0, 10),
          amount: existing?.amount ? String(existing.amount) : "",
        }
      })
    )
  }

  function saveDeclarationEditor() {
    if (!declarationDialog) return
    const declarations = declarationDraft
      .filter((d) => d.date)
      .map((d) => ({ period: d.period, date: d.date, amount: Number(d.amount || 0), userId: currentUserId }))

    const allZero = declarations.every((d) => d.amount === 0)
    updateState(declarationDialog.company.id, declarationDialog.rule.id, {
      declarations,
      ...(allZero && { paid: true, paidDate: new Date().toISOString().slice(0, 10), paidUserId: currentUserId }),
    })
    setDeclarationDialog(null)
    setDeclarationDraft([])
    toast.success("Declaración registrada", {
      description: allZero
        ? "Sin monto: marcada automáticamente como pagada."
        : "Los compromisos de pago ya pueden prepararse para el cliente.",
    })
  }

  async function copyCommitmentText() {
    try {
      await navigator.clipboard.writeText(commitmentMessage)
      toast.success("Texto copiado", { description: "Puedes pegarlo en WhatsApp o correo." })
    } catch {
      toast.error("No se pudo copiar el texto")
    }
  }

  async function copyCommitmentImage() {
    if (!selectedCommitmentSummary) return
    try {
      const { svg, width, height } = buildCommitmentSvg(selectedCommitmentSummary, periodLabel)
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url })
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d").drawImage(img, 0, 0, width, height)
      const png = await new Promise((res) => canvas.toBlob(res, "image/png"))
      URL.revokeObjectURL(url)
      if (!png) throw new Error()
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })])
      toast.success("Imagen copiada", { description: "Pégala directamente en WhatsApp o correo." })
    } catch {
      toast.error("No se pudo copiar la imagen")
    }
  }

  function openCommitmentDialog(companyId) {
    setCommitmentCompanyId(companyId)
    setCommitmentDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors position="bottom-right" />

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="w-fit text-xs">Operación tributaria</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Calendario fiscal</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Control transversal de declaraciones, pagos y compromisos. Registra lo declarado, detecta vencimientos y
            genera el resumen para solicitar transferencias al cliente.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Mes" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MONTHS_ES.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue placeholder="Año" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cumplimiento"
          value={`${dashboardMetrics.completionRate}%`}
          description={`${dashboardMetrics.completed} de ${dashboardMetrics.tracked} obligaciones completadas`}
          icon={IconRosetteDiscountCheck}
          progress={dashboardMetrics.completionRate}
          variant={dashboardMetrics.completionRate >= 80 ? "success" : dashboardMetrics.completionRate >= 40 ? "warning" : "default"}
        />
        <MetricCard
          title="Vencen pronto"
          value={String(dashboardMetrics.dueSoon)}
          description="Obligaciones dentro de la ventana de 7 días"
          icon={IconCalendarDue}
          variant={dashboardMetrics.dueSoon > 0 ? "warning" : "default"}
        />
        <MetricCard
          title="Riesgos activos"
          value={String(dashboardMetrics.overdue)}
          description="Obligaciones vencidas sin declarar"
          icon={IconAlertCircle}
          variant={dashboardMetrics.overdue > 0 ? "danger" : "default"}
        />
        <MetricCard
          title="Por transferir"
          value={formatMoney(dashboardMetrics.pendingAmount)}
          description="Monto agregado pendiente de cobro al cliente"
          icon={IconBuildingBank}
          variant={dashboardMetrics.pendingAmount > 0 ? "info" : "default"}
        />
      </div>

      {/* Obligations breakdown */}
      {dashboardMetrics.tracked > 0 && <ObligationsBreakdown metrics={dashboardMetrics} />}

      <Tabs defaultValue="calendario" className="gap-4">
        <TabsList variant="line">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="compromisos">Compromisos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen ejecutivo</TabsTrigger>
        </TabsList>

        {/* ── Tab: Calendario ── */}
        <TabsContent value="calendario" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz mensual por empresa</CardTitle>
              <CardDescription>
                Doble marca de declaración (D) y pago (P). Monto 0 se marca como pagado automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <Table className="table-fixed w-full text-[10px] md:text-[11px]" style={{ minWidth: 980 }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Empresa</TableHead>
                      {visibleRules.map((rule) => (
                        <TableHead key={rule.id} className="text-center">{rule.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyRows.map((row) => (
                      <TableRow key={row.company.id} className="align-top">
                        <TableCell className="p-2">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-medium">{row.company.name}</span>
                              <Badge variant={row.company.special ? "default" : "outline"} className="text-[10px]">
                                {row.company.special ? "ESP" : "ORD"}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground">{row.company.rif}</div>
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <IconUserCircle className="size-3" />
                                {row.company.manager}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                                onClick={() => openCommitmentDialog(row.company.id)}
                              >
                                <IconMailForward className="size-3" />
                                Enviar
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        {row.cells.map((cell) => (
                          <TableCell key={`${row.company.id}-${cell.rule.id}`} className="p-1">
                            <TaxCell
                              cell={cell}
                              onOpenEditor={() => openDeclarationEditor(row.company, cell.rule, cell.result, cell.state)}
                              onTogglePaid={(checked) => {
                                if (!isDeclared(cell.state, cell.result.periods)) {
                                  toast.error("Primero registra la declaración")
                                  return
                                }
                                updateState(row.company.id, cell.rule.id, {
                                  paid: checked,
                                  paidDate: checked ? new Date().toISOString().slice(0, 10) : null,
                                  paidUserId: checked ? currentUserId : null,
                                })
                              }}
                              onClear={() => clearDeclarations(row.company.id, cell.rule.id)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Referencia operativa interna. Contrastar con el calendario oficial vigente.
              </span>
              <Button variant="outline" size="sm" onClick={() => setCommitmentDialogOpen(true)}>
                <IconArrowUpRight className="size-3.5" />
                Preparar compromiso
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ── Tab: Compromisos ── */}
        <TabsContent value="compromisos" className="flex flex-col gap-4">
          {/* Period summary banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total pendiente · {periodLabel}
              </p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">
                {formatMoney(commitmentSummaries.reduce((s, x) => s + x.pending, 0))}
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{commitmentSummaries.filter((s) => s.pending > 0).length}</strong>{" "}
                con saldo
              </span>
              <span>
                <strong className="text-foreground">{commitmentSummaries.reduce((s, x) => s + x.items.length, 0)}</strong>{" "}
                obligaciones
              </span>
              <Select value={commitmentSort} onValueChange={setCommitmentSort}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="desc">Mayor a menor</SelectItem>
                    <SelectItem value="asc">Menor a mayor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Company commitment cards */}
          <div className="flex flex-col gap-2">
            {commitmentSummaries.map((summary) => (
              <CompanyCommitmentRow
                key={summary.company.id}
                summary={summary}
                onSend={() => openCommitmentDialog(summary.company.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Resumen ejecutivo ── */}
        <TabsContent value="resumen" className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
            {/* Company status table */}
            <Card>
              <CardHeader>
                <CardTitle>Estado por empresa</CardTitle>
                <CardDescription>
                  Visión consolidada para coordinación y cierre del período.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-center w-20">Vencidas</TableHead>
                      <TableHead className="text-center w-24">Por vencer</TableHead>
                      <TableHead className="text-center w-24">Avance</TableHead>
                      <TableHead className="text-right">Por transferir</TableHead>
                      <TableHead className="text-right w-24">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyRows
                      .map((row) => {
                        const overdueCount = row.cells.filter((c) => c.status === "overdue").length
                        const dueSoonCount = row.cells.filter((c) => c.status === "upcoming").length
                        const doneCount = row.cells.filter((c) => c.status === "done").length
                        const totalApplies = row.cells.filter((c) => c.result.applies).length
                        const pendingSummary = buildCommitmentSummary(row.company, selectedYear, selectedMonth, currentPeriodState)
                        return { row, overdueCount, dueSoonCount, doneCount, totalApplies, pending: pendingSummary.pending }
                      })
                      .sort((a, b) => b.pending - a.pending)
                      .map(({ row, overdueCount, dueSoonCount, doneCount, totalApplies, pending }) => (
                        <TableRow key={row.company.id}>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">{row.company.name}</span>
                                <Badge variant={row.company.special ? "default" : "outline"} className="text-[10px]">
                                  {row.company.special ? "ESP" : "ORD"}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{row.company.manager}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {overdueCount > 0
                              ? <Badge variant="destructive" className="text-xs">{overdueCount}</Badge>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            {dueSoonCount > 0
                              ? <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">{dueSoonCount}</Badge>
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs tabular-nums">{doneCount}/{totalApplies}</span>
                              <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${totalApplies ? (doneCount / totalApplies) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatMoney(pending)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={overdueCount > 0 ? "destructive" : "outline"}
                              className={cn(
                                "text-xs",
                                overdueCount === 0 && dueSoonCount > 0 && "border-amber-200 bg-amber-50 text-amber-700",
                                overdueCount === 0 && dueSoonCount === 0 && "border-emerald-200 bg-emerald-50 text-emerald-700"
                              )}
                            >
                              {overdueCount > 0 ? "Crítico" : dueSoonCount > 0 ? "Atención" : "Al día"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Priority signals sidebar */}
            <div className="flex flex-col gap-3">
              {dashboardMetrics.overdue > 0 && (
                <SignalItem
                  icon={IconAlertCircle}
                  variant="danger"
                  title="Obligaciones vencidas"
                  body={`${dashboardMetrics.overdue} obligaciones vencidas requieren atención inmediata para evitar multas.`}
                />
              )}
              {dashboardMetrics.dueSoon > 0 && (
                <SignalItem
                  icon={IconClockHour4}
                  variant="warning"
                  title="Próximas a vencer"
                  body={`${dashboardMetrics.dueSoon} obligaciones entran en la ventana crítica de los próximos 7 días.`}
                />
              )}
              <SignalItem
                icon={IconChecklist}
                variant="success"
                title={`${dashboardMetrics.completed} pagadas`}
                body={`${dashboardMetrics.completionRate}% de cumplimiento en el período actual.`}
              />
              <SignalItem
                icon={IconBuildingBank}
                variant="default"
                title="Pendiente de cobro"
                body={`${formatMoney(dashboardMetrics.pendingAmount)} por solicitar al cliente para cubrir las obligaciones declaradas.`}
              />
              <SignalItem
                icon={IconReceiptTax}
                variant="default"
                title="Próximos pasos"
                body="Cerrar declaraciones pendientes y confirmar transferencias bancarias de clientes especiales antes del fin de período."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Registrar declaración */}
      <Dialog open={Boolean(declarationDialog)} onOpenChange={(open) => !open && setDeclarationDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar declaración</DialogTitle>
            <DialogDescription>
              {declarationDialog
                ? `${declarationDialog.company.name} · ${declarationDialog.rule.label} · ${periodLabel}`
                : "Carga la fecha y el monto que se convertirá en compromiso de pago."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {declarationDraft.map((item, index) => (
              <Card key={item.period} size="sm">
                <CardHeader>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>Vence {formatDate(item.dueDate)}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Fecha de declaración</label>
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) =>
                        setDeclarationDraft((cur) =>
                          cur.map((entry, idx) => idx === index ? { ...entry, date: e.target.value } : entry)
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Monto a cobrar al cliente</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) =>
                        setDeclarationDraft((cur) =>
                          cur.map((entry, idx) => idx === index ? { ...entry, amount: e.target.value } : entry)
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeclarationDialog(null)}>Cancelar</Button>
            <Button onClick={saveDeclarationEditor}>
              <IconCheck className="size-4" />
              Guardar declaración
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Compromisos */}
      <Dialog open={commitmentDialogOpen} onOpenChange={setCommitmentDialogOpen}>
        <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-lg">
          {/* Header with company selector */}
          <div className="border-b px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogHeader>
                  <DialogTitle>Compromisos de pago</DialogTitle>
                  <DialogDescription>{periodLabel}</DialogDescription>
                </DialogHeader>
              </div>
              <Select value={commitmentCompanyId} onValueChange={setCommitmentCompanyId}>
                <SelectTrigger className="w-44 shrink-0 text-xs h-8">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {COMPANIES.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4 flex-1">
            {commitmentLoading ? (
              <CommitmentSkeleton />
            ) : selectedCommitmentSummary ? (
              <>
                {/* Items — compact one-liner each */}
                {selectedCommitmentSummary.items.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {selectedCommitmentSummary.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("size-1.5 shrink-0 rounded-full", item.paid ? "bg-emerald-500" : "bg-amber-400")} />
                          <span className="text-sm font-medium truncate">
                            {item.obligation} · {item.periodLabel}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">vence {formatDate(item.dueDate)}</span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums shrink-0 ml-2">{formatMoney(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Sin compromisos registrados para esta empresa en el período.
                  </div>
                )}

                {/* Totals */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums">{formatMoney(selectedCommitmentSummary.total)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Pagado</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-600">{formatMoney(selectedCommitmentSummary.paid)}</div>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                    <div className="text-xs text-muted-foreground">Por transferir</div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums">{formatMoney(selectedCommitmentSummary.pending)}</div>
                  </div>
                </div>

                {/* WhatsApp text */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Texto para WhatsApp
                  </label>
                  <Textarea value={commitmentMessage} readOnly className="min-h-36 resize-none font-mono text-xs" />
                </div>
              </>
            ) : null}
          </div>

          {/* Footer actions */}
          <div className="border-t px-5 py-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={copyCommitmentText}
                disabled={!selectedCommitmentSummary || commitmentLoading}
              >
                <IconCopy className="size-4" />
                Copiar texto
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyCommitmentImage}
                disabled={!selectedCommitmentSummary || commitmentLoading}
              >
                <IconCopy className="size-4" />
                Copiar imagen
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setCommitmentDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({ title, value, description, icon: MetricIcon, variant = "default", progress = null }) {
  const styles = {
    default: { card: "", icon: "text-muted-foreground", bar: "bg-primary" },
    success: { card: "ring-emerald-200/60 bg-emerald-50/40 dark:ring-emerald-800/40 dark:bg-emerald-950/20", icon: "text-emerald-600", bar: "bg-emerald-500" },
    warning: { card: "ring-amber-200/60 bg-amber-50/40 dark:ring-amber-800/40 dark:bg-amber-950/20", icon: "text-amber-600", bar: "bg-amber-500" },
    danger: { card: "ring-red-200/60 bg-red-50/40 dark:ring-red-800/40 dark:bg-red-950/20", icon: "text-red-600", bar: "bg-red-500" },
    info: { card: "ring-blue-200/60 bg-blue-50/40 dark:ring-blue-800/40 dark:bg-blue-950/20", icon: "text-blue-600", bar: "bg-blue-500" },
  }
  const s = styles[variant] || styles.default
  return (
    <Card className={s.card}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</span>
          {MetricIcon && <MetricIcon className={cn("size-4 shrink-0", s.icon)} />}
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {progress !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className={cn("h-full rounded-full transition-all duration-700", s.bar)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
        )}
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

// ── Obligations breakdown ─────────────────────────────────────────────────────

function ObligationsBreakdown({ metrics }) {
  const { tracked, completed, dueSoon, overdue, pending } = metrics
  if (!tracked) return null
  const pct = (n) => Math.round((n / tracked) * 100)
  const segments = [
    { label: "Completadas", count: completed, pct: pct(completed), color: "bg-emerald-500" },
    { label: "Por vencer", count: dueSoon, pct: pct(dueSoon), color: "bg-amber-400" },
    { label: "Vencidas", count: overdue, pct: pct(overdue), color: "bg-red-500" },
    { label: "Pendientes", count: pending, pct: pct(pending), color: "bg-slate-300 dark:bg-slate-600" },
  ]
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Distribución del período</CardTitle>
            <CardDescription className="mt-0.5">{tracked} obligaciones activas · {metrics.completionRate}% completado</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={cn("size-2.5 shrink-0 rounded-full", seg.color)} />
                <span className="font-medium text-foreground">{seg.count}</span>
                <span>{seg.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((seg) =>
            seg.count > 0 ? (
              <div key={seg.label} title={`${seg.label}: ${seg.count}`} style={{ width: `${seg.pct}%` }} className={cn("h-full transition-all duration-700", seg.color)} />
            ) : null
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Company commitment row (tab Compromisos) ──────────────────────────────────

function CompanyCommitmentRow({ summary, onSend }) {
  const hasPending = summary.pending > 0
  return (
    <div className={cn("rounded-xl border bg-card p-4 transition-colors", hasPending && "border-primary/20 bg-primary/[0.02]")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{summary.company.name}</span>
            <Badge variant={summary.company.special ? "default" : "outline"} className="text-[10px] shrink-0">
              {summary.company.special ? "ESP" : "ORD"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {summary.company.rif} · {summary.company.manager}
          </p>
          {summary.items.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {summary.items.map((item) => (
                <span
                  key={item.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    item.paid
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                  )}
                >
                  {item.obligation} — {formatMoney(item.amount)}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Sin declaraciones con monto en este período</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Pendiente</p>
            <p className={cn("font-bold tabular-nums", hasPending ? "text-base" : "text-sm text-muted-foreground")}>
              {formatMoney(summary.pending)}
            </p>
          </div>
          <Button
            size="sm"
            variant={hasPending ? "default" : "outline"}
            disabled={!summary.items.length}
            onClick={onSend}
          >
            <IconMailForward className="size-3.5" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Signal item ───────────────────────────────────────────────────────────────

function SignalItem({ icon: Icon, title, body, variant = "default" }) {
  const styles = {
    default: { card: "border bg-background", icon: "text-muted-foreground" },
    success: { card: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20", icon: "text-emerald-600" },
    warning: { card: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20", icon: "text-amber-600" },
    danger: { card: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20", icon: "text-red-600" },
  }
  const s = styles[variant] || styles.default
  return (
    <div className={cn("rounded-xl border p-4", s.card)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className={cn("size-4 shrink-0", s.icon)} />
        {title}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}

// ── Tax cell ──────────────────────────────────────────────────────────────────

function TaxCell({ cell, onOpenEditor, onTogglePaid, onClear }) {
  if (!cell.result.applies) {
    return (
      <div className="flex min-h-[76px] items-center justify-center rounded-lg border border-dashed bg-muted/20 text-[10px] text-muted-foreground">
        —
      </div>
    )
  }
  const declared = isDeclared(cell.state, cell.result.periods)
  const declaredAmount = totalDeclared(cell.state)
  const meta = {
    done: { label: "OK", badge: "outline", badgeCls: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400", tone: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30" },
    upcoming: { label: "Pronto", badge: "outline", badgeCls: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400", tone: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" },
    overdue: { label: "Vencido", badge: "destructive", badgeCls: "", tone: "border-destructive/30 bg-destructive/5" },
    pending: { label: "Pend.", badge: "outline", badgeCls: "", tone: "bg-background" },
  }[cell.status]

  return (
    <div className={cn("flex min-h-[76px] flex-col gap-1.5 rounded-lg border p-1.5", meta.tone)}>
      <div className="flex items-start justify-between gap-1">
        <div className="text-[10px] leading-tight text-muted-foreground">
          {cell.result.periods.map((p) => `${p.id}: ${formatDate(p.dueDate)}`).join(" · ")}
        </div>
        <Badge variant={meta.badge} className={cn("text-[10px] px-1 py-0 shrink-0", meta.badgeCls)}>
          {meta.label}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground">
          <Checkbox
            checked={declared}
            onCheckedChange={(v) => { if (v) { onOpenEditor(); return } onClear() }}
          />
          D
        </label>
        <label className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground">
          <Checkbox checked={Boolean(cell.state?.paid)} onCheckedChange={(v) => onTogglePaid(Boolean(v))} />
          P
        </label>
      </div>
      <div className="text-[10px] font-medium leading-tight tabular-nums">
        {declaredAmount > 0 ? formatMoney(declaredAmount) : <span className="text-muted-foreground/50">Sin monto</span>}
      </div>
    </div>
  )
}

// ── Commitment preview card (tab Compromisos) ─────────────────────────────────

function CommitmentPreviewCard({ summary, message, onCopy, onCopyImage, onChangeCompany }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen listo para compartir</CardTitle>
        <CardDescription>Selecciona la empresa, revisa el monto y copia el texto o la imagen.</CardDescription>
        <CardAction className="w-full max-w-[16rem]">
          <Select value={summary?.company.id} onValueChange={onChangeCompany}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {COMPANIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!summary ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><IconReceiptTax /></EmptyMedia>
              <EmptyTitle>Sin empresa seleccionada</EmptyTitle>
              <EmptyDescription>Elige una empresa para preparar el resumen de cobro.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{summary.company.name}</span>
                    <Badge variant={summary.company.special ? "default" : "outline"} className="text-[11px]">
                      {summary.company.special ? "ESP" : "ORD"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{summary.company.rif} · {getCompanyTypeLabel(summary.company)}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums">{formatMoney(summary.pending)}</div>
                  <div className="text-xs text-muted-foreground">por transferir</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {summary.items.length ? (
                summary.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("size-1.5 shrink-0 rounded-full", item.paid ? "bg-emerald-500" : "bg-amber-400")} />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium">{item.obligation} · {item.periodLabel}</span>
                        <span className="text-xs text-muted-foreground">Declarado {formatDateValue(item.declaredAt)} · vence {formatDate(item.dueDate)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right ml-2">
                      <div className="text-sm font-semibold tabular-nums">{formatMoney(item.amount)}</div>
                      {item.paid && <div className="text-[11px] text-emerald-600">Pagado</div>}
                    </div>
                  </div>
                ))
              ) : (
                <Empty className="border rounded-xl">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><IconChecklist /></EmptyMedia>
                    <EmptyTitle>Sin compromisos</EmptyTitle>
                    <EmptyDescription>Registra una declaración con monto para que aparezca aquí.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Total período</div>
                <div className="mt-1 font-semibold tabular-nums">{formatMoney(summary.total)}</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">Pagado</div>
                <div className="mt-1 font-semibold tabular-nums text-emerald-600">{formatMoney(summary.paid)}</div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="text-xs text-muted-foreground">Por transferir</div>
                <div className="mt-1 font-bold tabular-nums">{formatMoney(summary.pending)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Texto para WhatsApp</label>
              <Textarea value={message} readOnly className="min-h-44 resize-none font-mono text-xs" />
            </div>
          </>
        )}
      </CardContent>
      {summary && (
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onCopy}>
            <IconCopy className="size-4" />Copiar texto
          </Button>
          <Button onClick={onCopyImage}>
            <IconCopy className="size-4" />Copiar imagen
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// ── Commitment skeleton loader ────────────────────────────────────────────────

function CommitmentSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-9 w-full rounded-lg bg-muted" />
      <div className="h-9 w-full rounded-lg bg-muted" />
      <div className="h-9 w-3/4 rounded-lg bg-muted" />
      <div className="mt-1 grid grid-cols-3 gap-2">
        <div className="h-14 rounded-lg bg-muted" />
        <div className="h-14 rounded-lg bg-muted" />
        <div className="h-14 rounded-lg bg-muted" />
      </div>
      <div className="h-36 rounded-lg bg-muted" />
    </div>
  )
}
