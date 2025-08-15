import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useSeniatRifLookup } from "@/hooks/useSeniatRifLookup"

export default function RifLookupField({ onResolved }) {
  const [rif, setRif] = useState("")
  const [captcha, setCaptcha] = useState("")
  const { start, submit, captchaDataUrl, loading, error, reset } = useSeniatRifLookup()

  const rifFmt = (v) => v.toUpperCase().replaceAll(/[^A-Z0-9]/g, "")

  async function handleLookup() {
    if (!captchaDataUrl) {
      await start() // carga captcha
      return
    }
    const data = await submit({ rif: rifFmt(rif), captcha })
    if (data && onResolved) {
      onResolved(data) // { rif, legalName, contribType, activity }
      reset()
      setCaptcha("")
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rif">RIF (sin guiones)</Label>
          <Input
            id="rif"
            placeholder="V123456789 / J123456789"
            value={rif}
            onChange={(e) => setRif(rifFmt(e.target.value))}
            autoComplete="off"
            inputMode="text"
          />
        </div>

        <div className="space-y-2">
          <Label>Consulta SENIAT</Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={handleLookup} disabled={loading || !rif}>
              {!captchaDataUrl ? (loading ? "Cargando..." : "Obtener CAPTCHA") : (loading ? "Consultando..." : "Consultar")}
            </Button>
            {captchaDataUrl && (
              <Button variant="ghost" type="button" onClick={start} disabled={loading}>Otro CAPTCHA</Button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {captchaDataUrl && (
          <div className="sm:col-span-2 grid gap-2 sm:grid-cols-[auto_1fr_auto] items-center">
            <img src={captchaDataUrl} alt="CAPTCHA SENIAT" className="h-10 rounded border bg-white object-contain px-2" />
            <Input
              placeholder="Escribe el texto del recuadro"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              autoComplete="off"
            />
            <Button onClick={handleLookup} disabled={loading || !captcha}>Validar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}