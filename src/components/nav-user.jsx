import { useState } from "react"
import { Bell, ChevronDown, CreditCard, LifeBuoy, LogOut, Settings as SettingsIcon, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavUser() {
  const [open, setOpen] = useState(false)

  return (
    <SidebarFooter>
      <Separator className="mb-1" />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full justify-start rounded-md hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatar.png" alt="Usuario" />
                  <AvatarFallback>LS</AvatarFallback>
                </Avatar>
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
              <DropdownMenuItem asChild>
                <a href="/settings/account"><User className="mr-2 h-4 w-4" />Cuenta</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings/billing"><CreditCard className="mr-2 h-4 w-4" />Facturación</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings/notifications"><Bell className="mr-2 h-4 w-4" />Notificaciones</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Preferencias</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/support"><LifeBuoy className="mr-2 h-4 w-4" />Soporte</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
