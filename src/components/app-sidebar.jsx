import { useLocation } from "react-router-dom"
import { CompanySwitcher } from "@/components/company-switcher"
import { matchNavItem } from "@/components/nav"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppSidebarLayout({ children }) {
  const { pathname } = useLocation()
  const activeItem = matchNavItem(pathname)

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1">
            <div className="sticky top-0 z-40 flex h-14 w-full items-center gap-2 border-b bg-background px-3 transition-[height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-6" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{activeItem?.title ?? "Project X"}</div>
                <div className="hidden text-xs text-muted-foreground sm:block">
                  {activeItem?.group ?? "Operación interna de la firma"}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>
            <main className="w-full p-4">{children}</main>
          </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="gap-3 px-2 py-2">
        <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Project X</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Control de firma, empresas y obligaciones en una sola vista.
          </p>
        </div>
        <CompanySwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <NavUser />
      <SidebarRail />
    </Sidebar>
  )
}
