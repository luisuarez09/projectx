import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function CompanyBasic({ value, onChange }) {
  const fileRef = useRef(null)

  function onLogoChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onChange({ logoDataUrl: reader.result })
    reader.readAsDataURL(f)
  }

  const s = value.socials || {}

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-xl border bg-muted">
              {value.logoDataUrl ? (
                <img src={value.logoDataUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                  Logo / Avatar
                </div>
              )}
            </div>
            <div className="grid w-full gap-2">
              <Label>Subir logo</Label>
              <Input ref={fileRef} type="file" accept="image/*" onChange={onLogoChange} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Usa un logo cuadrado (SVG/PNG). También se muestra cuando el sidebar está colapsado.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Nombre comercial</Label>
            <Input value={value.tradeName} onChange={e=>onChange({ tradeName: e.target.value })} placeholder="Acme Inc" />
          </div>
          <div className="grid gap-2">
            <Label>Nombre legal</Label>
            <Input value={value.legalName} onChange={e=>onChange({ legalName: e.target.value })} placeholder="Acme S.A." />
          </div>
          <div className="grid gap-2">
            <Label>RIF</Label>
            <Input value={value.rif} onChange={e=>onChange({ rif: e.target.value })} placeholder="J-12345678-9" />
          </div>
          <div className="grid gap-2">
            <Label>Persona de contacto</Label>
            <Input value={value.contact?.name || ""} onChange={e=>onChange({ contact: { ...value.contact, name: e.target.value } })} placeholder="Nombre y apellido" />
          </div>
          <div className="grid gap-2">
            <Label>Cargo</Label>
            <Input value={value.contact?.role || ""} onChange={e=>onChange({ contact: { ...value.contact, role: e.target.value } })} placeholder="Gerente" />
          </div>
          <div className="grid gap-2">
            <Label>Teléfono</Label>
            <Input inputMode="tel" value={value.contact?.phone || ""} onChange={e=>onChange({ contact: { ...value.contact, phone: e.target.value } })} placeholder="+58 412 000 0000" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Dirección fiscal</Label>
          <Textarea rows={3} value={value.fiscalAddress} onChange={e=>onChange({ fiscalAddress: e.target.value })} placeholder="Calle, edificio, oficina..." />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="grid gap-2">
            <Label>Website</Label>
            <Input value={s.website || ""} onChange={e=>onChange({ socials: { ...s, website: e.target.value } })} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <Label>Instagram</Label>
            <Input value={s.instagram || ""} onChange={e=>onChange({ socials: { ...s, instagram: e.target.value } })} placeholder="@usuario" />
          </div>
          <div className="grid gap-2">
            <Label>X (Twitter)</Label>
            <Input value={s.x || ""} onChange={e=>onChange({ socials: { ...s, x: e.target.value } })} placeholder="@usuario" />
          </div>
          <div className="grid gap-2">
            <Label>LinkedIn</Label>
            <Input value={s.linkedin || ""} onChange={e=>onChange({ socials: { ...s, linkedin: e.target.value } })} placeholder="Empresa en LinkedIn" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Ubicación Google Maps (URL)</Label>
          <Input value={value.mapsUrl} onChange={e=>onChange({ mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
          {value.mapsUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border">
              <iframe title="Ubicación" src={value.mapsUrl} className="h-64 w-full border-0" loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}