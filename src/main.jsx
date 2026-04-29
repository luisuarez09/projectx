import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "@/index.css"
import { ThemeProvider } from "@/components/theme-provider"

import AppLayout from "@/layouts/app-layout"
import Dashboard from "@/pages/dashboard"
import Placeholder from "@/pages/placeholder"
import CompanyIndex from "@/pages/settings/company/index"
import CompanyEditor from "@/pages/settings/company/editor"
import ComprasIndex from "@/pages/compras"
import ComprasInvoiceCreate from "./pages/invoices/compras/compras-create"
import ProveedorCreateModal from "./pages/proveedor/proveedor-create"
import ProveedoresIndex from "./pages/proveedor/proveedor-view"
import VentasInvoiceCreate from "./pages/invoices/ventas/ventas-create"
import VentasIndex from "./pages/invoices/ventas/ventas"
import CalculadoraReconversion from "./pages/CalcuadoraReconversion"
import Login from "./pages/login"

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    ),
  },

  { path: "/facturas/ventas", element: <AppLayout><VentasIndex /></AppLayout> },  
  { path: "/facturas/ventas/new", element: <AppLayout><VentasInvoiceCreate /></AppLayout> },  

  { path: "/facturas/compras", element: <AppLayout><ComprasIndex /></AppLayout> },
  { path: "/facturas/compras/new", element: <AppLayout><ComprasInvoiceCreate /></AppLayout> },

  { path: "/proveedor", element: <AppLayout><ProveedoresIndex /></AppLayout> },
  { path: "/proveedor/new", element: <AppLayout><ProveedorCreateModal /></AppLayout> },

  { path: "/settings/company", element: <AppLayout><CompanyIndex /></AppLayout> },
  { path: "/settings/company/new", element: <AppLayout><CompanyEditor /></AppLayout> },
  { path: "/settings/company/:id", element: <AppLayout><CompanyEditor /></AppLayout> },

  { path: "CalculadoraReconversion", element: <AppLayout><CalculadoraReconversion /></AppLayout> },
  {
    path: "*",
    element: (
      <AppLayout>
        <Placeholder />
      </AppLayout>
    ),
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
