import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { navSections } from "@/components/nav"
import { CompanySwitcher } from "@/components/company-switcher"
import { ModeToggle } from "@/components/mode-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChevronDown, User, CreditCard, Bell, LogOut, Settings as SettingsIcon, LifeBuoy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"


export function AppSidebarLayout({ children }) {
    return (
        <SidebarProvider>
            <TooltipProvider delayDuration={200}>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <SidebarInset className="flex min-w-0 flex-1">
                        {/* Topbar */}
                        <div className="sticky top-0 z-40 flex h-14 w-full items-center gap-2 border-b bg-background px-3">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="h-6" />
                            <div className="text-sm text-muted-foreground">Panel</div>
                            <div className="ml-auto flex items-center gap-2">
                                <ModeToggle />
                            </div>
                        </div>
                        {/* Content */}
                        <main className="w-full p-4">{children}</main>
                    </SidebarInset>
                </div>
            </TooltipProvider>
        </SidebarProvider>
    )
}

export function AppSidebar() {
    const { pathname } = useLocation()
    const { state } = useSidebar()
    const collapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon" className="border-r">
            <SidebarHeader className="px-2">      {/* <— un poco de padding */}
                <CompanySwitcher />
            </SidebarHeader>

            <SidebarContent>
                {navSections.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
                                    const Icon = item.icon || (() => null)
                                    const active = pathname === item.url || pathname.startsWith(item.url + "/")

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={active}
                                                tooltip={item.title}                 // <-- tooltip automático en modo colapsado
                                                className="
              group
              data-[active=true]:bg-accent data-[active=true]:text-accent-foreground
              group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center
            "
                                            >
                                                <Link
                                                    to={item.url}
                                                    aria-label={item.title}            // accesible cuando está colapsado
                                                    className="flex items-center"
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span className="ml-2 group-data-[collapsible=icon]:hidden">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <UserFooterMenu collapsed={collapsed} />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

function UserFooterMenu({ collapsed }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Separator className="mb-1" />
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        {/* el verdadero botón es SidebarMenuButton */}
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="
                  w-full justify-start rounded-md
                  hover:bg-accent hover:text-accent-foreground
                  data-[state=open]:bg-accent data-[state=open]:text-accent-foreground
                "
                            >
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src="/avatar.png" alt="Usuario" />
                                    <AvatarFallback>LS</AvatarFallback>
                                </Avatar>

                                {/* Oculta texto cuando el sidebar está colapsado */}
                                <div className="mr-auto hidden flex-col text-left group-data-[collapsible=icon]:hidden sm:flex">
                                    <span className="text-sm leading-none">Luis Suárez</span>
                                    <span className="text-xs text-muted-foreground">m@example.com</span>
                                </div>

                                <ChevronDown
                                    className={`h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden ${open ? "rotate-180" : ""}`}
                                />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent side="top" align="end" className="w-64">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatar.png" alt="Usuario" />
                                        <AvatarFallback>LS</AvatarFallback>
                                    </Avatar>
                                    <div className="grid">
                                        <span className="text-sm font-medium leading-none">Luis Suárez</span>
                                        <span className="text-xs text-muted-foreground">m@example.com</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><a href="/settings/account"><User className="mr-2 h-4 w-4" />Cuenta</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href="/settings/billing"><CreditCard className="mr-2 h-4 w-4" />Facturación</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href="/settings/notifications"><Bell className="mr-2 h-4 w-4" />Notificaciones</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Preferencias</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href="/support"><LifeBuoy className="mr-2 h-4 w-4" />Soporte</a></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    )
}
export { UserFooterMenu }
