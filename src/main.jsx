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

const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    ),
  },
  { path: "/facturas/compras", element: <AppLayout><ComprasIndex /></AppLayout> },
  { path: "/facturas/compras/new", element: <AppLayout><ComprasInvoiceCreate /></AppLayout> },
  { path: "/settings/company", element: <AppLayout><CompanyIndex /></AppLayout> },
  { path: "/settings/company/new", element: <AppLayout><CompanyEditor /></AppLayout> },
  { path: "/settings/company/:id", element: <AppLayout><CompanyEditor /></AppLayout> },
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
