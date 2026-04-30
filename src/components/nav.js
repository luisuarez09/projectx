import {
  BellRing,
  Book,
  BriefcaseBusiness,
  Building,
  Building2,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Gauge,
  Landmark,
  LineChart,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react"

export const navItems = [
  { title: "Centro de control", url: "/dashboard", icon: Gauge, group: "Control", enabled: true, audience: "internal" },
  { title: "Calendario fiscal", url: "/taxes/calendar", icon: CalendarDays, group: "Control", enabled: true, audience: "internal" },
  { title: "Alertas y vencimientos", url: "/control/alerts", icon: BellRing, group: "Control", enabled: true, audience: "internal" },
  { title: "Ventas", url: "/facturas/ventas", icon: Receipt, group: "Operación", enabled: true, audience: "internal" },
  { title: "Compras", url: "/facturas/compras", icon: ShoppingCart, group: "Operación", enabled: true, audience: "internal" },
  { title: "Clientes", url: "/clients", icon: Users, group: "Operación", enabled: true, audience: "internal" },
  { title: "Proveedores", url: "/proveedor", icon: Truck, group: "Operación", enabled: true, audience: "internal" },
  { title: "IVA", url: "/taxes/iva", icon: Landmark, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "Retenciones ISLR", url: "/taxes/retenciones-islr", icon: FileText, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "Retenciones IVA", url: "/taxes/retenciones-iva", icon: FileCheck2, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "Impuesto municipal", url: "/taxes/municipal", icon: Building2, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "IGTF", url: "/taxes/igtf", icon: WalletCards, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "IGP anual", url: "/taxes/igp", icon: ShieldCheck, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "Parafiscales", url: "/taxes/parafiscales", icon: ClipboardList, group: "Fiscal", enabled: true, audience: "internal", comingSoon: true },
  { title: "Empleados", url: "/payroll/employees", icon: Users, group: "Nómina", enabled: true, audience: "internal", comingSoon: true },
  { title: "Nóminas quincenales", url: "/payroll/runs", icon: BriefcaseBusiness, group: "Nómina", enabled: true, audience: "internal", comingSoon: true },
  { title: "Exportaciones FAOV", url: "/payroll/export", icon: FileSpreadsheet, group: "Nómina", enabled: true, audience: "internal", comingSoon: true },
  { title: "Resumen fiscal", url: "/reports/taxes", icon: LineChart, group: "Reportes", enabled: true, audience: "internal", comingSoon: true },
  { title: "Libros", url: "/reports/books", icon: Book, group: "Reportes", enabled: true, audience: "internal", comingSoon: true },
  { title: "Archivos", url: "/files", icon: FolderOpen, group: "Reportes", enabled: true, audience: "internal", comingSoon: true },
  { title: "Empresa", url: "/settings/company", icon: Building, group: "Configuración", enabled: true, audience: "internal" },
  { title: "Usuarios y roles", url: "/settings/users", icon: UserCog, group: "Configuración", enabled: true, audience: "internal", comingSoon: true },
  { title: "Catálogos", url: "/settings/catalogs", icon: Book, group: "Configuración", enabled: true, audience: "internal", comingSoon: true },
  { title: "Tasas de cambio", url: "/settings/fx", icon: LineChart, group: "Configuración", enabled: true, audience: "internal", comingSoon: true },
  { title: "Auditoría", url: "/settings/audit", icon: ShieldCheck, group: "Configuración", enabled: true, audience: "internal", comingSoon: true },
  { title: "Preferencias", url: "/settings", icon: Settings, group: "Configuración", enabled: true, audience: "internal", comingSoon: true },
]

const navGroups = ["Control", "Operación", "Fiscal", "Nómina", "Reportes", "Configuración"]

export function getSidebarGroups() {
  return navGroups
    .map((group) => ({
      label: group,
      items: navItems.filter((item) => item.group === group && item.enabled),
    }))
    .filter((group) => group.items.length > 0)
}

export function matchNavItem(pathname) {
  return navItems.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))
}
