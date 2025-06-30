import React, { useState } from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "./navigation-menu"
import { Button } from "./button"
import { Link } from "react-router-dom"

export default function NavigationMenuHeader({ onToggleTheme, isDark }) {
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <NavigationMenu>
        <NavigationMenuList>
          {/* <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/" className="font-semibold text-sm">
                Inicio
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Herramientas</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[300px] p-3">
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="#" className="block">
                      <div className="text-sm font-medium leading-none">Calculadora de aranceles</div>
                      <p className="text-sm text-muted-foreground leading-tight mt-1">
                        Estime el costo de actuaciones registrales.<br />Seleccione el organismo y el tipo de acto.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem> */}
        </NavigationMenuList>
      </NavigationMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        className="rounded-full border"
        aria-label="Cambiar tema"
      >
        {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </Button>
    </div>
  )
}