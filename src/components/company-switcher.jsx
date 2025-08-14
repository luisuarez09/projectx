import { useMemo, useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSidebar } from "@/components/ui/sidebar"

const companies = [
  { id: "acme", name: "Acme Inc", tag: "Enterprise", logo: "/logos/acme.svg" },
  { id: "ecorisas", name: "Fundación Ecorisas", tag: "ONG", logo: "/logos/ecorisas.svg" },
  { id: "consultoria", name: "Consultoría Luis Suárez", tag: "Servicios", logo: "/logos/consultoria.svg" },
]

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function CompanySwitcher() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(companies[0])
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const badge = useMemo(() => {
    if (value.logo) {
      return (
        // logo cuadrado
        <img
          src={value.logo}
          alt={value.name}
          className="h-6 w-6 rounded-md object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )
    }
    return (
      <div className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-semibold">
        {initials(value.name)}
      </div>
    )
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2">
          <div className="flex items-center gap-2">
            {badge}
            {!collapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{value.name}</span>
                <span className="text-xs text-muted-foreground">{value.tag}</span>
              </div>
            )}
          </div>
          {!collapsed && <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-72" align="start">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandList>
            <CommandEmpty>No hay resultados.</CommandEmpty>
            <CommandGroup heading="Empresas">
              {companies.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => {
                    setValue(c)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="h-5 w-5 rounded-md object-cover" />
                    ) : (
                      <div className="grid h-5 w-5 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-semibold">
                        {initials(c.name)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.tag}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}