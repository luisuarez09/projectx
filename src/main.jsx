import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@/index.css"
import { ThemeProvider } from "@/components/theme-provider"

import AppLayout from "@/layouts/app-layout"
import Dashboard from "@/pages/dashboard"
import Placeholder from "@/pages/placeholder"
import Clients from "@/pages/clients/clients"
import ControlAlertsPage from "@/pages/control/alerts"
import ModuleShell from "@/pages/module-shell"
import CompanyIndex from "@/pages/settings/company/index"
import CompanyEditor from "@/pages/settings/company/editor"
import ComprasIndex from "@/pages/compras"
import ComprasInvoiceCreate from "./pages/invoices/compras/compras-create"
import ProveedorCreateModal from "./pages/proveedor/proveedor-create"
import ProveedoresIndex from "./pages/proveedor/proveedor-view"
import TaxCalendarPage from "./pages/taxes/calendar"
import VentasInvoiceCreate from "./pages/invoices/ventas/ventas-create"
import VentasIndex from "./pages/invoices/ventas/ventas"
import CalculadoraReconversion from "./pages/CalcuadoraReconversion"
import Login from "./pages/login"

const shellRoutes = [
  {
    path: "/taxes/iva",
    title: "IVA",
    description: "Espacio base para gestionar declaraciones, soportes y seguimiento operativo del IVA por empresa y período.",
    highlights: [
      "Control mensual por empresa con estatus de preparación, revisión y envío.",
      "Relación entre declaración, soportes y comprobantes.",
      "Visión integrada con alertas y calendario fiscal.",
      "Preparado para métricas de cumplimiento del equipo.",
    ],
  },
  {
    path: "/taxes/retenciones-islr",
    title: "Retenciones ISLR",
    description: "Base del módulo para centralizar retenciones, soportes y control de cumplimiento por período.",
    highlights: [
      "Seguimiento por empresa, período y responsable.",
      "Control de soportes y validaciones previas al cierre.",
      "Visibilidad de estatus para operación interna.",
      "Diseñado para crecer hacia reportes y exportaciones.",
    ],
  },
  {
    path: "/taxes/retenciones-iva",
    title: "Retenciones IVA",
    description: "Shell de trabajo para concentrar preparación, revisión y control de obligaciones asociadas al SPE.",
    highlights: [
      "Estados operativos por empresa y lote.",
      "Pendientes de comprobantes y soportes.",
      "Foco en trazabilidad para el equipo fiscal.",
      "Base lista para conexión con flujos reales.",
    ],
  },
  {
    path: "/taxes/municipal",
    title: "Impuesto municipal",
    description: "Vista inicial para organizar obligaciones municipales y sus distintos estados por empresa.",
    highlights: [
      "Ventanas de vencimiento por municipio o período.",
      "Seguimiento de recaudos y revisión.",
      "Espacio para excepciones y particularidades por cliente.",
      "Listo para integrarse al calendario general.",
    ],
  },
  {
    path: "/taxes/igtf",
    title: "IGTF",
    description: "Módulo base para seguimiento del impuesto, preparación de soportes y control del estado del trabajo.",
    highlights: [
      "Checklist por empresa y período.",
      "Resumen de pendientes críticos antes del cierre.",
      "Preparado para conectarse con indicadores globales.",
      "Consistencia con el modelo de gestión de firma.",
    ],
  },
  {
    path: "/taxes/igp",
    title: "IGP anual",
    description: "Shell inicial para controlar obligaciones anuales con visibilidad clara del avance institucional.",
    highlights: [
      "Seguimiento anual por empresa y responsable.",
      "Hitos previos al vencimiento final.",
      "Espacio para documentación y revisiones.",
      "Pensado para métricas de avance agregadas.",
    ],
  },
  {
    path: "/taxes/parafiscales",
    title: "Parafiscales",
    description: "Base de navegación para gestionar obligaciones parafiscales con estados compartidos para el equipo.",
    highlights: [
      "Seguimiento por período de cumplimiento.",
      "Alertas sobre obligaciones próximas.",
      "Visibilidad de dependencias y soportes.",
      "Integración futura con paneles institucionales.",
    ],
  },
  {
    path: "/payroll/employees",
    title: "Empleados",
    description: "Vista base para centralizar el padrón laboral asociado a las empresas atendidas por la firma.",
    highlights: [
      "Base maestra de empleados por empresa.",
      "Preparado para relacionarse con nómina y obligaciones.",
      "Seguimiento limpio sin sobrecargar la operación.",
      "Pensado para crecimiento por etapas.",
    ],
  },
  {
    path: "/payroll/runs",
    title: "Nóminas quincenales",
    description: "Shell operativa para futuros cierres de nómina con estados, responsables y períodos.",
    highlights: [
      "Ciclos de nómina por período y empresa.",
      "Estados de elaboración, revisión y cierre.",
      "Base para indicadores internos de capacidad.",
      "Preparado para exportaciones posteriores.",
    ],
  },
  {
    path: "/payroll/export",
    title: "Exportaciones FAOV",
    description: "Vista base para organizar exportaciones y entregables de nómina relacionados con FAOV.",
    highlights: [
      "Historial de exportaciones por empresa.",
      "Pendientes de generación o revisión.",
      "Espacio para trazabilidad documental.",
      "Integrable con alertas y cumplimiento.",
    ],
  },
  {
    path: "/reports/taxes",
    title: "Resumen fiscal",
    description: "Pantalla semilla para futuros reportes ejecutivos con foco en supervisión y cumplimiento.",
    highlights: [
      "Indicadores agregados por empresa o cartera.",
      "Cruce de avance, vencimientos y riesgo.",
      "Enfoque ejecutivo para socios o responsables.",
      "Base común para futura Vista TV.",
    ],
  },
  {
    path: "/reports/books",
    title: "Libros",
    description: "Módulo inicial para organizar la generación y consulta de libros fiscales o contables.",
    highlights: [
      "Estado de generación por período.",
      "Trazabilidad de entrega y revisión.",
      "Espacio para descargas y validaciones.",
      "Ruta propia lista para crecer.",
    ],
  },
  {
    path: "/files",
    title: "Archivos",
    description: "Shell pensada para el futuro gestor documental de la firma con visibilidad transversal por empresa.",
    highlights: [
      "Repositorio documental organizado por contexto.",
      "Relación con obligaciones y procesos.",
      "Preparado para permisos y auditoría.",
      "Base premium para el portal futuro del cliente.",
    ],
  },
  {
    path: "/settings/users",
    title: "Usuarios y roles",
    description: "Vista inicial para ordenar la estructura interna de acceso, responsabilidades y permisos.",
    highlights: [
      "Usuarios internos y perfiles por función.",
      "Permisos por módulo y empresa.",
      "Base para colaboración segura en la firma.",
      "Pensado para escalar al portal del cliente.",
    ],
  },
  {
    path: "/settings/catalogs",
    title: "Catálogos",
    description: "Pantalla semilla para administrar tablas maestras y parámetros de trabajo reutilizables.",
    highlights: [
      "Valores estándar por módulo.",
      "Menos duplicidad y más consistencia operativa.",
      "Base para configuración por firma o empresa.",
      "Ruta estable para crecimiento posterior.",
    ],
  },
  {
    path: "/settings/fx",
    title: "Tasas de cambio",
    description: "Vista base para controlar tasas, referencias y configuraciones financieras necesarias en la operación.",
    highlights: [
      "Historial y valores vigentes.",
      "Base para cálculos y reportes futuros.",
      "Contexto útil para facturación y cierres.",
      "Preparado para integrarse con auditoría.",
    ],
  },
  {
    path: "/settings/audit",
    title: "Auditoría",
    description: "Shell para centralizar rastros de actividad, cambios críticos y trazabilidad institucional.",
    highlights: [
      "Registro de acciones importantes.",
      "Visión de control interno y cumplimiento.",
      "Base útil para supervisión de socios.",
      "Preparado para crecimiento gradual.",
    ],
  },
  {
    path: "/settings",
    title: "Preferencias",
    description: "Pantalla inicial para agrupar configuraciones generales de la experiencia interna de la firma.",
    highlights: [
      "Ajustes de experiencia y operación.",
      "Parámetros globales de la plataforma.",
      "Base consistente con el resto del sistema.",
      "Lista para modularizarse más adelante.",
    ],
  },
]

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <AppLayout><Dashboard /></AppLayout> },
  { path: "/facturas/ventas", element: <AppLayout><VentasIndex /></AppLayout> },
  { path: "/facturas/ventas/new", element: <AppLayout><VentasInvoiceCreate /></AppLayout> },
  { path: "/facturas/compras", element: <AppLayout><ComprasIndex /></AppLayout> },
  { path: "/facturas/compras/new", element: <AppLayout><ComprasInvoiceCreate /></AppLayout> },
  { path: "/clients", element: <AppLayout><Clients /></AppLayout> },
  { path: "/proveedor", element: <AppLayout><ProveedoresIndex /></AppLayout> },
  { path: "/proveedor/new", element: <AppLayout><ProveedorCreateModal /></AppLayout> },
  { path: "/taxes/calendar", element: <AppLayout><TaxCalendarPage /></AppLayout> },
  { path: "/control/alerts", element: <AppLayout><ControlAlertsPage /></AppLayout> },
  { path: "/settings/company", element: <AppLayout><CompanyIndex /></AppLayout> },
  { path: "/settings/company/new", element: <AppLayout><CompanyEditor /></AppLayout> },
  { path: "/settings/company/:id", element: <AppLayout><CompanyEditor /></AppLayout> },
  { path: "CalculadoraReconversion", element: <AppLayout><CalculadoraReconversion /></AppLayout> },
  ...shellRoutes.map((route) => ({
    path: route.path,
    element: (
      <AppLayout>
        <ModuleShell title={route.title} description={route.description} highlights={route.highlights} />
      </AppLayout>
    ),
  })),
  { path: "*", element: <AppLayout><Placeholder /></AppLayout> },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
