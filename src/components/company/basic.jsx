import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import RifLookupField from "@/components/tools/RifLookupField"

export default function CompanyBasic({ value, onChange }) {
  const fileRef = useRef(null)

  // helpers para actualizar campos (incluye anidados)
  const set = (patch) => onChange(patch)
  const setIn = (path, val) => {
    const [a, b, c] = path.split(".")
    if (b && c) {
      onChange({ [a]: { ...value[a], [b]: { ...value[a]?.[b], [c]: val } } })
    } else if (b) {
      onChange({ [a]: { ...value[a], [b]: val } })
    } else {
      onChange({ [a]: val })
    }
  }

  async function handlePickLogo(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => set({ logoDataUrl: reader.result })
    reader.readAsDataURL(f)
  }

  function handleResolvedFromSeniat({ rif, legalName, contribType, activity }) {
    onChange({
      rif: rif || value.rif,
      legalName: legalName || value.legalName,
      contribType: contribType || value.contribType,
      economicActivity: activity || value.economicActivity
    })
  }

  return (
    <div className="space-y-8">
      {/* Identidad */}
      <section className="grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="flex flex-col items-start gap-3">
          <div className="aspect-square w-32 overflow-hidden rounded-xl border bg-muted">
            {value.logoDataUrl ? (
              <img
                src={value.logoDataUrl}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Logo
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickLogo}
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              Subir logo
            </Button>
            {value.logoDataUrl && (
              <Button variant="ghost" size="sm" onClick={() => set({ logoDataUrl: "" })}>
                Quitar
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tradeName">Nombre comercial</Label>
            <Input
              id="tradeName"
              placeholder="Ej: Consultora XYZ"
              value={value.tradeName}
              onChange={(e) => set({ tradeName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Razón social (legal)</Label>
            <Input
              id="legalName"
              placeholder="Ej: CONSULTORA XYZ, C.A."
              value={value.legalName}
              onChange={(e) => set({ legalName: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            {/* Herramienta de consulta al SENIAT */}
            <RifLookupField onResolved={handleResolvedFromSeniat} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rif">RIF</Label>
            <Input
              id="rif"
              placeholder="V123456789 / J123456789"
              value={value.rif}
              onChange={(e) =>
                set({ rif: e.target.value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "") })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribType">Tipo de contribuyente</Label>
            <Input
              id="contribType"
              placeholder="Ordinario / Formal / Especial"
              value={value.contribType || ""}
              onChange={(e) => set({ contribType: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="economicActivity">Actividad económica</Label>
            <Input
              id="economicActivity"
              placeholder="Actividad principal según SENIAT"
              value={value.economicActivity || ""}
              onChange={(e) => set({ economicActivity: e.target.value })}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Dirección fiscal */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fiscalAddress">Domicilio fiscal</Label>
          <Textarea
            id="fiscalAddress"
            rows={3}
            placeholder="Dirección completa según RIF/Registro"
            value={value.fiscalAddress}
            onChange={(e) => set({ fiscalAddress: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapsUrl">Google Maps (URL)</Label>
          <Input
            id="mapsUrl"
            placeholder="https://maps.google.com/..."
            value={value.mapsUrl}
            onChange={(e) => set({ mapsUrl: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      {/* Redes y contacto */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="website">Sitio web</Label>
          <Input
            id="website"
            placeholder="https://..."
            value={value.socials?.website || ""}
            onChange={(e) => setIn("socials.website", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ig">Instagram</Label>
          <Input
            id="ig"
            placeholder="@usuario"
            value={value.socials?.instagram || ""}
            onChange={(e) => setIn("socials.instagram", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="x">X (Twitter)</Label>
          <Input
            id="x"
            placeholder="@usuario"
            value={value.socials?.x || ""}
            onChange={(e) => setIn("socials.x", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/company/..."
            value={value.socials?.linkedin || ""}
            onChange={(e) => setIn("socials.linkedin", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-name">Contacto</Label>
          <Input
            id="contact-name"
            placeholder="Nombre y apellido"
            value={value.contact?.name || ""}
            onChange={(e) => setIn("contact.name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-role">Cargo</Label>
          <Input
            id="contact-role"
            placeholder="Ej: Gerente General"
            value={value.contact?.role || ""}
            onChange={(e) => setIn("contact.role", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Teléfono</Label>
          <Input
            id="contact-phone"
            placeholder="+58 ..."
            value={value.contact?.phone || ""}
            onChange={(e) => setIn("contact.phone", e.target.value)}
          />
        </div>
      </section>
    </div>
  )
}