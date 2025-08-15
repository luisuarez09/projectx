import {
  LayoutDashboard,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Percent,
  Landmark,
  FileText,
  Building2,
  BadgeDollarSign,
  FileCheck2,
  ShieldCheck,
  Users,
  FolderOpen,
  Settings,
  Building,
  UserCog,
  Book,
  LineChart,
  Banknote,
  ClipboardList,
  Truck,
} from "lucide-react"

export const navSections = [
  {
    label: "General",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Facturación",
    items: [
      { title: "Ventas", url: "/facturas/ventas", icon: Receipt },
      { title: "Compras", url: "/facturas/compras", icon: ShoppingCart },
      { title: "Clientes", url: "/customers", icon: Users },
      { title: "Proveedores", url: "/proveedor", icon: Truck },
      { title: "Retenciones", url: "/billing/withholdings", icon: Percent },
      { title: "Importar por lote", url: "/billing/import", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Declaraciones",
    items: [
      { title: "IVA", url: "/taxes/iva", icon: Landmark },
      { title: "Retenciones ISLR", url: "/taxes/retenciones-islr", icon: FileText },
      { title: "Retenciones IVA (SPE)", url: "/taxes/retenciones-iva", icon: FileCheck2 },
      { title: "Impuesto Municipal", url: "/taxes/municipal", icon: Building2 },
      { title: "IGTF (SPE)", url: "/taxes/igtf", icon: BadgeDollarSign },
      { title: "IGP (Anual)", url: "/taxes/igp", icon: ShieldCheck },
      { title: "Parafiscales", url: "/taxes/parafiscales", icon: ClipboardList },
    ],
  },
  {
    label: "Nómina",
    items: [
      { title: "Empleados", url: "/payroll/employees", icon: Users },
      { title: "Nóminas quincenales", url: "/payroll/runs", icon: FolderOpen },
      { title: "Exportaciones FAOV", url: "/payroll/export", icon: Banknote },
    ],
  },
  {
    label: "Reportes",
    items: [
      { title: "Resumen fiscal", url: "/reports/taxes", icon: LineChart },
      { title: "Libros", url: "/reports/books", icon: Book },
      { title: "Archivos", url: "/files", icon: FolderOpen },
    ],
  },
  {
    label: "Configuración",
    items: [
      { title: "Empresa", url: "/settings/company", icon: Building },
      { title: "Usuarios y roles", url: "/settings/users", icon: UserCog },
      { title: "Catálogos", url: "/settings/catalogs", icon: Book },
      { title: "Tasas de cambio", url: "/settings/fx", icon: LineChart },
      { title: "Auditoría", url: "/settings/audit", icon: ShieldCheck },
      { title: "Preferencias", url: "/settings", icon: Settings },
    ],
  },
]
