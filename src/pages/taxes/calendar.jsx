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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const USERS = [
  { id: "luis", name: "Luis Suárez", role: "Socio fiscal" },
  { id: "paola", name: "Paola Méndez", role: "Analista tributaria" },
  { id: "andres", name: "Andrés Vera", role: "Coordinador de cartera" },
]

const COMPANIES = [
  {
    id: "ceres",
    name: "Agroinversiones Ceres, C.A.",
    rif: "J-504429562",
    special: false,
    manager: "Luis Suárez",
    sector: "Agroindustrial",
  },
  {
    id: "altos",
    name: "Centro Médico Altos, C.A.",
    rif: "J-403808880",
    special: true,
    manager: "Paola Méndez",
    sector: "Salud",
  },
  {
    id: "navis",
    name: "Grupo Navis Occidente, C.A.",
    rif: "J-309951440",
    special: false,
    manager: "Andrés Vera",
    sector: "Logística",
  },
  {
    id: "ferresum",
    name: "Construcciones Ferresum, C.A.",
    rif: "J-506236508",
    special: true,
    manager: "Paola Méndez",
    sector: "Construcción",
  },
  {
    id: "vision",
    name: "Óptica Visión de Águila, C.A.",
    rif: "J-506434377",
    special: false,
    manager: "Luis Suárez",
    sector: "Retail",
  },
]

const TAX_RULES = [
  {
    id: "iva",
    label: "IVA",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 15) }],
  },
  {
    id: "retislr",
    label: "Ret. ISLR",
    getPeriods: (company, year, month) =>
      company.special
        ? [{ id: "M", label: "Mensual", dueDate: dueSpecialRetention(company, year, month) }]
        : [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 10) }],
  },
  {
    id: "retiva",
    label: "Ret. IVA",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [],
  },
  {
    id: "igtf",
    label: "IGTF",
    getPeriods: (company, year, month) =>
      company.special
        ? [
            { id: "1Q", label: "1ra quincena", dueDate: dueSpecialFirstHalf(company, year, month) },
            { id: "2Q", label: "2da quincena", dueDate: dueSpecialSecondHalf(company, year, month) },
          ]
        : [],
  },
  {
    id: "municipal",
    label: "Municipal",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueFixedNextMonth(year, month, 10) }],
  },
  {
    id: "ivss",
    label: "IVSS",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueNthBusinessDayNextMonth(year, month, 5) }],
  },
  {
    id: "faov",
    label: "FAOV",
    getPeriods: (_, year, month) => [{ id: "M", label: "Mensual", dueDate: dueNthBusinessDayNextMonth(year, month, 5) }],
  },
  {
    id: "inces",
    label: "INCES",
    getPeriods: (_, year, month) =>
      isQuarterDueMonth(month)
        ? [
            {
              id: "T",
              label: `Trimestre Q${getQuarterFromDueMonth(month)}`,
              dueDate: nthBusinessDay(year, month, 5),
            },
          ]
        : [],
  },
  {
    id: "rnet",
    label: "RNET",
    getPeriods: (_, year, month) =>
      isQuarterDueMonth(month)
        ? [
            {
              id: "T",
              label: `Trimestre Q${getQuarterFromDueMonth(month)}`,
              dueDate: nthBusinessDay(year, month, 15),
            },
          ]
        : [],
  },
]

const INITIAL_STATE = {
  "2026-04": {
    ceres: {
      iva: {
        declarations: [{ period: "M", date: "2026-04-14", amount: 1250, userId: "luis" }],
      },
      retislr: {
        declarations: [{ period: "M", date: "2026-04-09", amount: 320, userId: "luis" }],
        paid: true,
        paidDate: "2026-04-11",
        paidUserId: "luis",
      },
      municipal: {
        declarations: [{ period: "M", date: "2026-04-25", amount: 460, userId: "andres" }],
      },
      inces: {
        declarations: [{ period: "T", date: "2026-04-04", amount: 185, userId: "luis" }],
      },
      rnet: {
        declarations: [{ period: "T", date: "2026-04-12", amount: 0, userId: "luis" }],
      },
    },
    altos: {
      iva: {
        declarations: [
          { period: "1Q", date: "2026-04-16", amount: 880, userId: "paola" },
          { period: "2Q", date: "2026-04-29", amount: 910, userId: "paola" },
        ],
      },
      retislr: {
        declarations: [{ period: "M", date: "2026-04-28", amount: 540, userId: "paola" }],
      },
      retiva: {
        declarations: [
          { period: "1Q", date: "2026-04-16", amount: 300, userId: "paola" },
          { period: "2Q", date: "2026-04-29", amount: 280, userId: "paola" },
        ],
      },
      igtf: {
        declarations: [
          { period: "1Q", date: "2026-04-16", amount: 120, userId: "paola" },
          { period: "2Q", date: "2026-04-29", amount: 145, userId: "paola" },
        ],
      },
      inces: {
        declarations: [{ period: "T", date: "2026-04-03", amount: 240, userId: "paola" }],
      },
      rnet: {
        declarations: [{ period: "T", date: "2026-04-15", amount: 0, userId: "paola" }],
      },
    },
    navis: {
      iva: {
        declarations: [{ period: "M", date: "2026-04-21", amount: 1960, userId: "andres" }],
      },
      municipal: {
        declarations: [{ period: "M", date: "2026-04-27", amount: 515, userId: "andres" }],
      },
      ivss: {
        declarations: [{ period: "M", date: "2026-04-30", amount: 230, userId: "andres" }],
      },
      inces: {
        declarations: [{ period: "T", date: "2026-04-05", amount: 310, userId: "andres" }],
        paid: true,
        paidDate: "2026-04-05",
        paidUserId: "andres",
      },
    },
    ferresum: {
      iva: {
        declarations: [{ period: "1Q", date: "2026-04-18", amount: 620, userId: "paola" }],
      },
      retislr: {
        declarations: [{ period: "M", date: "2026-04-20", amount: 190, userId: "paola" }],
      },
      retiva: {
        declarations: [{ period: "1Q", date: "2026-04-18", amount: 165, userId: "paola" }],
      },
      faov: {
        declarations: [{ period: "M", date: "2026-04-30", amount: 140, userId: "paola" }],
      },
    },
    vision: {
      iva: {
        declarations: [{ period: "M", date: "2026-04-12", amount: 780, userId: "luis" }],
        paid: true,
        paidDate: "2026-04-13",
        paidUserId: "luis",
      },
      retislr: {
        declarations: [{ period: "M", date: "2026-04-10", amount: 210, userId: "luis" }],
      },
    },
  },
}

function lastDigit(rif) {
  const match = String(rif).match(/(\d)(?!.*\d)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function clampDay(year, month, day) {
  return Math.min(day, new Date(year, month, 0).getDate())
}

function nextMonth(year, month) {
  const next = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return [nextYear, next]
}

function dueFixedNextMonth(year, month, day) {
  const [nextYear, next] = nextMonth(year, month)
  return new Date(nextYear, next - 1, clampDay(nextYear, next, day))
}

function nthBusinessDay(year, month, number) {
  let day = 1
  let counter = 0
  while (day <= 31) {
    const current = new Date(year, month - 1, day)
    if (current.getMonth() !== month - 1) break
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      counter += 1
      if (counter === number) return current
    }
    day += 1
  }
  return new Date(year, month - 1, 1)
}

function dueNthBusinessDayNextMonth(year, month, number) {
  const [nextYear, next] = nextMonth(year, month)
  return nthBusinessDay(nextYear, next, number)
}

function getQuarterFromDueMonth(month) {
  const map = {
    1: 4,
    4: 1,
    7: 2,
    10: 3,
  }
  return map[month] || null
}

function isQuarterDueMonth(month) {
  return [1, 4, 7, 10].includes(month)
}

function dueSpecialFirstHalf(company, year, month) {
  return new Date(year, month - 1, clampDay(year, month, 17 + lastDigit(company.rif)))
}

function dueSpecialSecondHalf(company, year, month) {
  const [nextYear, next] = nextMonth(year, month)
  return new Date(nextYear, next - 1, clampDay(nextYear, next, 2 + lastDigit(company.rif)))
}

function dueSpecialRetention(company, year, month) {
  const [nextYear, next] = nextMonth(year, month)
  return new Date(nextYear, next - 1, clampDay(nextYear, next, 4 + lastDigit(company.rif)))
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
  }).format(date)
}

function formatDateValue(dateString) {
  if (!dateString) return "—"
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`))
}

function formatMoney(amount) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0))
}

function getRuleResult(company, rule, year, month) {
  const periods = rule.getPeriods(company, year, month)
  return {
    applies: periods.length > 0,
    periods,
  }
}

function isDeclared(state, periods) {
  if (!state?.declarations?.length) return false
  return periods.every((period) => state.declarations.some((item) => item.period === period.id))
}

function totalDeclared(state) {
  return (state?.declarations || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

function getCellStatus(state, periods, today) {
  if (isDeclared(state, periods) && state?.paid) return "done"
  const dueDates = periods.map((period) => period.dueDate)
  const nextDueDate = dueDates.sort((first, second) => first - second)[0]
  if (!nextDueDate) return "pending"
  const diffDays = Math.ceil((nextDueDate - today) / 86400000)
  if (diffDays < 0 && !isDeclared(state, periods)) return "overdue"
  if (diffDays <= 7 && !state?.paid) return "upcoming"
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
      .filter((item) => Number(item.amount || 0) > 0)
      .map((item) => {
        const periodMeta = result.periods.find((period) => period.id === item.period)
        return {
          id: `${rule.id}-${item.period}`,
          obligation: rule.label,
          periodLabel: periodMeta?.label || item.period,
          dueDate: periodMeta?.dueDate || new Date(),
          declaredAt: item.date,
          amount: Number(item.amount || 0),
          paid: Boolean(state?.paid),
          paidDate: state?.paidDate || null,
          paidUserId: state?.paidUserId || null,
        }
      })
  })

  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const paid = items.filter((item) => item.paid).reduce((sum, item) => sum + item.amount, 0)
  const pending = items.filter((item) => !item.paid).reduce((sum, item) => sum + item.amount, 0)

  return {
    company,
    items: items.sort((first, second) => first.dueDate - second.dueDate),
    total,
    paid,
    pending,
  }
}

function buildCommitmentText(summary, periodLabel) {
  if (!summary) return ""
  const lines = [
    `*${summary.company.name}*`,
    `RIF: ${summary.company.rif}`,
    `${getCompanyTypeLabel(summary.company)}`,
    "",
    `📅 *Compromisos de pago · ${periodLabel}*`,
    "",
  ]

  if (!summary.items.length) {
    lines.push("✅ Sin compromisos pendientes para este período.")
  } else {
    summary.items.forEach((item) => {
      const icon = item.paid ? "✅" : "🟡"
      lines.push(`${icon} *${item.obligation}* (${item.periodLabel})`)
      lines.push(`   Vence: ${formatDate(item.dueDate)}`)
      lines.push(`   Monto: *${formatMoney(item.amount)}*`)
    })
    lines.push("")
    lines.push(`💼 *Total del período:* ${formatMoney(summary.total)}`)
    lines.push(`✅ *Ya pagado:* ${formatMoney(summary.paid)}`)
    lines.push(`🟡 *Pendiente por transferir:* ${formatMoney(summary.pending)}`)
  }

  lines.push("")
  lines.push("🙏 Al confirmar la transferencia procesamos el pago de la obligación.")
  return lines.join("\n")
}

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function buildCommitmentSvg(summary, periodLabel) {
  const width = 900
  const headerHeight = 140
  const itemHeight = 52
  const footerHeight = 150
  const bodyHeight = Math.max(summary.items.length, 1) * itemHeight
  const height = headerHeight + bodyHeight + footerHeight
  const pendingLabel = summary.pending > 0 ? "Pendiente por transferir" : "Total cubierto"
  const itemsMarkup = summary.items.length
    ? summary.items
        .map((item, index) => {
          const y = headerHeight + index * itemHeight
          const fill = index % 2 === 0 ? "rgba(15,23,42,0.04)" : "transparent"
          return `
            <rect x="36" y="${y}" width="828" height="${itemHeight}" rx="14" fill="${fill}" />
            <text x="56" y="${y + 22}" font-size="18" font-weight="600" fill="#0f172a">${escapeXml(item.obligation)} · ${escapeXml(item.periodLabel)}</text>
            <text x="56" y="${y + 40}" font-size="13" fill="#64748b">Declarado ${escapeXml(formatDateValue(item.declaredAt))} · vence ${escapeXml(formatDate(item.dueDate))}</text>
            <text x="844" y="${y + 30}" text-anchor="end" font-size="18" font-weight="700" fill="#0f172a">${escapeXml(formatMoney(item.amount))}</text>
          `
        })
        .join("")
    : `
      <rect x="36" y="${headerHeight}" width="828" height="72" rx="18" fill="rgba(15,23,42,0.04)" />
      <text x="450" y="${headerHeight + 42}" text-anchor="middle" font-size="16" fill="#64748b">Sin compromisos pendientes en este período.</text>
    `

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f8fafc" />
      <rect x="0" y="0" width="${width}" height="108" fill="#0f172a" />
      <text x="36" y="44" font-size="28" font-weight="800" fill="#ffffff">${escapeXml(summary.company.name)}</text>
      <text x="36" y="74" font-size="15" fill="#cbd5e1">${escapeXml(summary.company.rif)} · ${escapeXml(getCompanyTypeLabel(summary.company))}</text>
      <text x="36" y="128" font-size="22" font-weight="700" fill="#0f172a">Compromisos de pago</text>
      <text x="36" y="154" font-size="14" fill="#64748b">${escapeXml(periodLabel)}</text>
      ${itemsMarkup}
      <rect x="36" y="${headerHeight + bodyHeight + 20}" width="828" height="110" rx="18" fill="#ffffff" stroke="rgba(15,23,42,0.10)" />
      <text x="56" y="${headerHeight + bodyHeight + 55}" font-size="15" fill="#64748b">Total del período</text>
      <text x="844" y="${headerHeight + bodyHeight + 55}" text-anchor="end" font-size="18" font-weight="700" fill="#0f172a">${escapeXml(formatMoney(summary.total))}</text>
      <text x="56" y="${headerHeight + bodyHeight + 86}" font-size="15" fill="#64748b">Ya pagado</text>
      <text x="844" y="${headerHeight + bodyHeight + 86}" text-anchor="end" font-size="16" font-weight="600" fill="#0f172a">${escapeXml(formatMoney(summary.paid))}</text>
      <text x="56" y="${headerHeight + bodyHeight + 118}" font-size="17" font-weight="700" fill="#0f172a">${escapeXml(pendingLabel)}</text>
      <text x="844" y="${headerHeight + bodyHeight + 118}" text-anchor="end" font-size="22" font-weight="800" fill="#0f172a">${escapeXml(formatMoney(summary.pending))}</text>
    </svg>
  `
}

export default function TaxCalendarPage() {
  const today = useMemo(() => new Date(), [])
  const currentUserId = USERS[0].id
  const initialPeriod = useMemo(() => {
    const date = new Date()
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    }
  }, [])

  const [selectedYear, setSelectedYear] = useState(initialPeriod.year)
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month)
  const [cellState, setCellState] = useState(INITIAL_STATE)
  const [declarationDialog, setDeclarationDialog] = useState(null)
  const [declarationDraft, setDeclarationDraft] = useState([])
  const [commitmentCompanyId, setCommitmentCompanyId] = useState(COMPANIES[1].id)
  const [commitmentDialogOpen, setCommitmentDialogOpen] = useState(false)
  const [commitmentSort, setCommitmentSort] = useState("desc")

  const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
  const periodLabel = `${MONTHS_ES[selectedMonth - 1]} ${selectedYear}`
  const yearOptions = useMemo(() => {
    const baseYear = initialPeriod.year
    return [baseYear - 1, baseYear, baseYear + 1]
  }, [initialPeriod.year])

  const visibleRules = useMemo(
    () =>
      TAX_RULES.filter((rule) =>
        COMPANIES.some((company) => getRuleResult(company, rule, selectedYear, selectedMonth).applies)
      ),
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
          return {
            company,
            rule,
            result,
            state,
            status: result.applies ? getCellStatus(state, result.periods, today) : "na",
          }
        }),
      })),
    [currentPeriodState, selectedMonth, selectedYear, today, visibleRules]
  )

  const dashboardMetrics = useMemo(() => {
    let tracked = 0
    let completed = 0
    let dueSoon = 0
    let overdue = 0
    let pendingAmount = 0

    companyRows.forEach((row) => {
      row.cells.forEach((cell) => {
        if (!cell.result.applies || cell.state?.na) return
        tracked += 1
        if (cell.status === "done") completed += 1
        if (cell.status === "upcoming") dueSoon += 1
        if (cell.status === "overdue") overdue += 1
      })

      const summary = buildCommitmentSummary(row.company, selectedYear, selectedMonth, currentPeriodState)
      pendingAmount += summary.pending
    })

    const completionRate = tracked ? Math.round((completed / tracked) * 100) : 0
    return {
      tracked,
      completed,
      dueSoon,
      overdue,
      pendingAmount,
      completionRate,
    }
  }, [companyRows, currentPeriodState, selectedMonth, selectedYear])

  const commitmentSummaries = useMemo(
    () =>
      COMPANIES
        .map((company) => buildCommitmentSummary(company, selectedYear, selectedMonth, currentPeriodState))
        .sort((first, second) =>
          commitmentSort === "desc" ? second.pending - first.pending : first.pending - second.pending
        ),
    [commitmentSort, currentPeriodState, selectedMonth, selectedYear]
  )

  const selectedCommitmentSummary = useMemo(
    () => commitmentSummaries.find((item) => item.company.id === commitmentCompanyId) || commitmentSummaries[0],
    [commitmentCompanyId, commitmentSummaries]
  )

  const commitmentMessage = useMemo(
    () => buildCommitmentText(selectedCommitmentSummary, periodLabel),
    [periodLabel, selectedCommitmentSummary]
  )

  useEffect(() => {
    if (!selectedCommitmentSummary && commitmentSummaries.length) {
      setCommitmentCompanyId(commitmentSummaries[0].company.id)
    }
  }, [commitmentSummaries, selectedCommitmentSummary])

  function updateState(companyId, ruleId, patch) {
    setCellState((current) => ({
      ...current,
      [periodKey]: {
        ...(current[periodKey] || {}),
        [companyId]: {
          ...((current[periodKey] || {})[companyId] || {}),
          [ruleId]: {
            ...(((current[periodKey] || {})[companyId] || {})[ruleId] || {}),
            ...patch,
          },
        },
      },
    }))
  }

  function clearDeclarations(companyId, ruleId) {
    updateState(companyId, ruleId, {
      declarations: [],
      paid: false,
      paidDate: null,
      paidUserId: null,
    })
    toast.success("Declaración reiniciada", {
      description: "La obligación vuelve a quedar pendiente en el calendario.",
    })
  }

  function openDeclarationEditor(company, rule, result, state) {
    setDeclarationDialog({
      company,
      rule,
      periods: result.periods,
    })
    setDeclarationDraft(
      result.periods.map((period) => {
        const existing = state?.declarations?.find((item) => item.period === period.id)
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
      .filter((item) => item.date)
      .map((item) => ({
        period: item.period,
        date: item.date,
        amount: Number(item.amount || 0),
        userId: currentUserId,
      }))

    updateState(declarationDialog.company.id, declarationDialog.rule.id, {
      declarations,
    })
    setDeclarationDialog(null)
    setDeclarationDraft([])
    toast.success("Declaración registrada", {
      description: "Los compromisos de pago ya pueden prepararse para el cliente.",
    })
  }

  async function copyCommitmentText() {
    try {
      await navigator.clipboard.writeText(commitmentMessage)
      toast.success("Texto copiado", {
        description: "Puedes pegarlo en WhatsApp o correo al cliente.",
      })
    } catch {
      toast.error("No se pudo copiar el texto")
    }
  }

  async function copyCommitmentImage() {
    if (!selectedCommitmentSummary) return

    try {
      const svg = buildCommitmentSvg(selectedCommitmentSummary, periodLabel)
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      const image = new Image()

      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = svgUrl
      })

      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext("2d")
      context.drawImage(image, 0, 0)

      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
      URL.revokeObjectURL(svgUrl)

      if (!pngBlob) throw new Error("No se pudo generar la imagen")

      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })])
      toast.success("Imagen copiada", {
        description: "Ya puedes pegarla directamente en WhatsApp o correo.",
      })
    } catch {
      toast.error("No se pudo copiar la imagen")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors position="bottom-right" />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit">
            Operación tributaria
          </Badge>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Calendario fiscal</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              Control transversal de declaraciones, pagos y compromisos por cliente. La firma puede registrar lo ya
              declarado, detectar vencimientos y generar el resumen que se envía al cliente para solicitar la
              transferencia.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[26rem]">
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MONTHS_ES.map((month, index) => (
                  <SelectItem key={month} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cumplimiento del período"
          value={`${dashboardMetrics.completionRate}%`}
          description={`${dashboardMetrics.completed} de ${dashboardMetrics.tracked} obligaciones marcadas como pagadas`}
          icon={IconRosetteDiscountCheck}
        />
        <MetricCard
          title="Vencen pronto"
          value={String(dashboardMetrics.dueSoon)}
          description="Obligaciones con ventana operativa de los próximos 7 días"
          icon={IconCalendarDue}
        />
        <MetricCard
          title="Riesgos activos"
          value={String(dashboardMetrics.overdue)}
          description="Obligaciones vencidas o aún no declaradas"
          icon={IconAlertCircle}
        />
        <MetricCard
          title="Pendiente por transferir"
          value={formatMoney(dashboardMetrics.pendingAmount)}
          description="Monto agregado que todavía debe cubrir el cliente"
          icon={IconBuildingBank}
        />
      </div>

      <Tabs defaultValue="calendario" className="gap-4">
        <TabsList variant="line">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="compromisos">Compromisos</TabsTrigger>
          <TabsTrigger value="resumen">Resumen ejecutivo</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz mensual por empresa</CardTitle>
              <CardDescription>
                Usa la doble marca de declaración y pago para reflejar el avance real. Cuando la declaración tiene
                monto, el sistema la vuelve un compromiso listo para enviar al cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border">
                <div className="min-w-[980px]">
                  <Table className="text-[10px] md:text-[11px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[210px] text-[10px] md:text-[11px]">Empresa</TableHead>
                        {visibleRules.map((rule) => (
                          <TableHead key={rule.id} className="px-1 text-center text-[10px] md:text-[11px]">
                            {rule.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyRows.map((row) => (
                        <TableRow key={row.company.id} className="align-top">
                          <TableCell className="min-w-[210px] p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium md:text-xs">{row.company.name}</span>
                                <Badge variant={row.company.special ? "default" : "outline"}>
                                  {row.company.special ? "ESP" : "ORD"}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {row.company.rif} · {row.company.sector}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <IconUserCircle className="size-3.5" />
                                  {row.company.manager}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="px-2 text-[11px]"
                                  onClick={() => {
                                    setCommitmentCompanyId(row.company.id)
                                    setCommitmentDialogOpen(true)
                                  }}
                                >
                                  <IconMailForward data-icon="inline-start" />
                                  Enviar
                                </Button>
                              </div>
                            </div>
                          </TableCell>

                          {row.cells.map((cell) => (
                            <TableCell key={`${row.company.id}-${cell.rule.id}`} className="min-w-[108px] p-1">
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
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Referencia operativa interna. La validación final siempre debe contrastarse con el calendario oficial
                vigente.
              </span>
              <Button variant="outline" size="sm" onClick={() => setCommitmentDialogOpen(true)}>
                <IconArrowUpRight data-icon="inline-start" />
                Preparar compromiso
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar de compromisos</CardTitle>
              <CardDescription>Empresas con montos listos para solicitar transferencia.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {commitmentSummaries.map((summary) => (
                <button
                  key={summary.company.id}
                  type="button"
                  onClick={() => {
                    setCommitmentCompanyId(summary.company.id)
                    setCommitmentDialogOpen(true)
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3 text-left transition-colors hover:bg-muted/40",
                    summary.pending > 0 && "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{summary.company.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {summary.items.length
                        ? `${summary.items.length} compromisos registrados`
                        : "Sin declaraciones con monto en este período"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatMoney(summary.pending)}</div>
                    <div className="text-xs text-muted-foreground">pendiente</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compromisos" className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Bandeja de cobro al cliente</CardTitle>
                <CardDescription>
                  Resumen priorizado por monto pendiente para preparar solicitudes de transferencia.
                </CardDescription>
                <CardAction className="w-full max-w-[13rem]">
                  <Select value={commitmentSort} onValueChange={setCommitmentSort}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="desc">Mayor a menor</SelectItem>
                        <SelectItem value="asc">Menor a mayor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Pendiente</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commitmentSummaries.map((summary) => (
                      <TableRow key={summary.company.id}>
                        <TableCell className="font-medium">{summary.company.name}</TableCell>
                        <TableCell>{summary.items.length}</TableCell>
                        <TableCell>{formatMoney(summary.pending)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCommitmentCompanyId(summary.company.id)
                              setCommitmentDialogOpen(true)
                            }}
                          >
                            <IconMailForward data-icon="inline-start" />
                            Preparar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          <CommitmentPreviewCard
            summary={selectedCommitmentSummary}
            message={commitmentMessage}
            onCopy={copyCommitmentText}
            onCopyImage={copyCommitmentImage}
            onChangeCompany={setCommitmentCompanyId}
          />
          </div>
        </TabsContent>

        <TabsContent value="resumen" className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Empresas que requieren foco</CardTitle>
                <CardDescription>
                  Lectura rápida para socios o coordinación antes del cierre del período.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {companyRows
                  .map((row) => {
                    const overdueCount = row.cells.filter((cell) => cell.status === "overdue").length
                    const dueSoonCount = row.cells.filter((cell) => cell.status === "upcoming").length
                    const pendingSummary = buildCommitmentSummary(row.company, selectedYear, selectedMonth, currentPeriodState)
                    return {
                      company: row.company,
                      overdueCount,
                      dueSoonCount,
                      pendingAmount: pendingSummary.pending,
                    }
                  })
                  .sort((first, second) => second.pendingAmount - first.pendingAmount)
                  .map((item) => (
                    <div key={item.company.id} className="rounded-xl border bg-background p-4">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-medium">{item.company.name}</span>
                        <Badge variant={item.overdueCount > 0 ? "destructive" : "outline"}>
                          {item.overdueCount > 0 ? "Crítico" : "Controlado"}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                        <div>{item.overdueCount} obligaciones vencidas sin cerrar.</div>
                        <div>{item.dueSoonCount} obligaciones entran en ventana próxima.</div>
                        <div>{formatMoney(item.pendingAmount)} por solicitar al cliente.</div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Señales del período</CardTitle>
                <CardDescription>Indicadores institucionales para la coordinación diaria.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <IconChecklist className="size-4" />
                    Declaraciones registradas
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {dashboardMetrics.completed} obligaciones ya están marcadas como declaradas y pagadas en esta vista.
                  </p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <IconClockHour4 className="size-4" />
                    Próximas acciones sugeridas
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reforzar seguimiento de pagos de clientes especiales y cerrar las obligaciones que ya están
                    declaradas pero siguen sin confirmación bancaria.
                  </p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <IconReceiptTax className="size-4" />
                    Base para portal futuro
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    El mismo resumen de compromisos puede evolucionar luego hacia una vista de cliente con estado de
                    pago, soporte y trazabilidad.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(declarationDialog)} onOpenChange={(open) => !open && setDeclarationDialog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar declaración</DialogTitle>
            <DialogDescription>
              {declarationDialog
                ? `${declarationDialog.company.name} · ${declarationDialog.rule.label} · ${periodLabel}`
                : "Carga la fecha y el monto que luego se convertirá en compromiso de pago."}
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
                      onChange={(event) =>
                        setDeclarationDraft((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, date: event.target.value } : entry
                          )
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
                      onChange={(event) =>
                        setDeclarationDraft((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, amount: event.target.value } : entry
                          )
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclarationDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={saveDeclarationEditor}>
              <IconCheck data-icon="inline-start" />
              Guardar declaración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commitmentDialogOpen} onOpenChange={setCommitmentDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-1.5rem)] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Compromisos de pago al cliente</DialogTitle>
            <DialogDescription>
              Genera el texto o la imagen que se comparte para solicitar la transferencia del período.
            </DialogDescription>
          </DialogHeader>

          <CommitmentPreviewCard
            summary={selectedCommitmentSummary}
            message={commitmentMessage}
            onCopy={copyCommitmentText}
            onCopyImage={copyCommitmentImage}
            onChangeCompany={setCommitmentCompanyId}
            compact={false}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommitmentDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({ title, value, description, icon: MetricIcon }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          {MetricIcon ? <MetricIcon className="size-4" /> : null}
          <span className="text-sm">{title}</span>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function TaxCell({ cell, onOpenEditor, onTogglePaid, onClear }) {
  if (!cell.result.applies) {
    return (
      <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed bg-muted/20 p-2 text-center text-[10px] text-muted-foreground">
        -
      </div>
    )
  }

  const declared = isDeclared(cell.state, cell.result.periods)
  const declaredAmount = totalDeclared(cell.state)
  const statusMeta = {
    done: {
      label: "OK",
      badge: "outline",
      badgeClassName: "border-emerald-200 bg-emerald-100 text-emerald-700",
      tone: "border-emerald-200 bg-emerald-50",
    },
    upcoming: {
      label: "Pronto",
      badge: "outline",
      badgeClassName: "border-amber-200 bg-amber-100 text-amber-800",
      tone: "border-amber-200 bg-amber-50",
    },
    overdue: {
      label: "Vencido",
      badge: "destructive",
      badgeClassName: "",
      tone: "border-destructive/20 bg-destructive/5",
    },
    pending: {
      label: "Pend.",
      badge: "outline",
      badgeClassName: "",
      tone: "bg-background",
    },
  }[cell.status]

  return (
    <div className={cn("flex min-h-20 flex-col gap-1.5 rounded-lg border p-1.5", statusMeta.tone)}>
      <div className="flex items-start justify-between gap-1">
        <div className="text-[10px] leading-tight text-muted-foreground">
          {cell.result.periods.map((period) => `${period.id}: ${formatDate(period.dueDate)}`).join(" · ")}
        </div>
        <Badge variant={statusMeta.badge} className={statusMeta.badgeClassName}>
          {statusMeta.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Checkbox
            checked={declared}
            onCheckedChange={(checked) => {
              if (checked) {
                onOpenEditor()
                return
              }
              onClear()
            }}
          />
          D
        </label>

        <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Checkbox checked={Boolean(cell.state?.paid)} onCheckedChange={(checked) => onTogglePaid(Boolean(checked))} />
          P
        </label>
      </div>

      <div className="text-[10px] font-medium leading-tight">
        {declaredAmount > 0 ? formatMoney(declaredAmount) : "Sin monto"}
      </div>
    </div>
  )
}

function CommitmentPreviewCard({
  summary,
  message,
  onCopy,
  onCopyImage,
  onChangeCompany,
  compact = true,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen listo para compartir</CardTitle>
        <CardDescription>
          Selecciona la empresa, revisa el monto pendiente y luego copia el texto o la imagen.
        </CardDescription>
        <CardAction className="w-full max-w-[16rem]">
          <Select value={summary?.company.id} onValueChange={onChangeCompany}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {COMPANIES.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!summary ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconReceiptTax />
              </EmptyMedia>
              <EmptyTitle>Sin empresa seleccionada</EmptyTitle>
              <EmptyDescription>Elige una empresa para preparar el resumen de cobro al cliente.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className={cn("rounded-2xl border bg-background", compact ? "p-4" : "p-4 md:p-5")}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold md:text-lg">{summary.company.name}</span>
                  <Badge variant={summary.company.special ? "default" : "outline"}>
                    {summary.company.special ? "ESP" : "ORD"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {summary.company.rif} ? {getCompanyTypeLabel(summary.company)}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col gap-2">
                {summary.items.length ? (
                  summary.items.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-xl border bg-muted/30 p-2.5 md:grid-cols-[1fr_auto]">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {item.obligation} ? {item.periodLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Declarado {formatDateValue(item.declaredAt)} ? vence {formatDate(item.dueDate)}
                        </span>
                      </div>
                      <div className="text-right text-sm font-semibold">{formatMoney(item.amount)}</div>
                    </div>
                  ))
                ) : (
                  <Empty className="border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <IconChecklist />
                      </EmptyMedia>
                      <EmptyTitle>Sin compromisos registrados</EmptyTitle>
                      <EmptyDescription>
                        Registra una declaración con monto para que aparezca el resumen a enviar.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid gap-2 text-sm md:grid-cols-3">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-muted-foreground">Total del período</div>
                  <div className="mt-1 text-base font-semibold">{formatMoney(summary.total)}</div>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-muted-foreground">Ya pagado</div>
                  <div className="mt-1 text-base font-semibold">{formatMoney(summary.paid)}</div>
                </div>
                <div className="rounded-xl border bg-primary/5 p-3">
                  <div className="text-muted-foreground">Pendiente por transferir</div>
                  <div className="mt-1 text-base font-semibold">{formatMoney(summary.pending)}</div>
                </div>
              </div>
            </div>

            <div className={cn("grid gap-4", compact ? "xl:grid-cols-[1fr]" : "grid-cols-1 2xl:grid-cols-[1.1fr_0.9fr]")}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Texto sugerido para el cliente</label>
                <Textarea value={message} readOnly className={compact ? "min-h-44 text-xs" : "min-h-48 text-xs"} />
              </div>

              {!compact && (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconCopy />
                    </EmptyMedia>
                    <EmptyTitle>Salida inmediata</EmptyTitle>
                    <EmptyDescription>
                      Copia el texto con formato para WhatsApp o pega la imagen directamente en el chat.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button className="w-full" onClick={onCopy}>
                      <IconCopy data-icon="inline-start" />
                      Copiar texto
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onCopyImage}>
                      <IconCopy data-icon="inline-start" />
                      Copiar imagen
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </div>
          </>
        )}
      </CardContent>

      {summary && compact && (
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onCopy}>
            <IconCopy data-icon="inline-start" />
            Copiar texto
          </Button>
          <Button onClick={onCopyImage}>
            <IconCopy data-icon="inline-start" />
            Copiar imagen
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
