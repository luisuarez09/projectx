import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getSidebarGroups } from "@/components/nav"

export function NavMain() {
  const { pathname } = useLocation()
  const groups = getSidebarGroups()

  return groups.map((section) => (
    <SidebarGroup key={section.label}>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.url || pathname.startsWith(`${item.url}/`)

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
                >
                  <Link to={item.url} aria-label={item.title} className="flex items-center">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.comingSoon ? <SidebarMenuBadge>Pronto</SidebarMenuBadge> : null}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ))
}
