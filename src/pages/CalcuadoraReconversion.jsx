// Calculadora de Reconversión Monetaria en React + Tailwind + Shadcn UI

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Card, CardContent } from "../components/ui/card";
import { format } from "date-fns"
import CurrencyInput from 'react-currency-input-field'




const reconversiones = [
    {
        nombre: "Reconversión 2008",
        fecha: new Date("2008-01-01"),
        factor: 1 / 1000,
        decreto: "Decreto-Ley Nº 5.229",
        gaceta: "Gaceta Oficial Nº 38.638",
        publicada: "6 de marzo de 2007"
    },
    {
        nombre: "Reconversión 2018",
        fecha: new Date("2018-08-20"),
        factor: 1 / 100000,
        decreto: "Decreto Nº 3.548",
        gaceta: "Gaceta Oficial Nº 41.446",
        publicada: "25 de julio de 2018"
    },
    {
        nombre: "Reconversión 2021",
        fecha: new Date("2021-10-01"),
        factor: 1 / 1000000,
        decreto: "Decreto Nº 4.553",
        gaceta: "Gaceta Oficial Nº 42.185",
        publicada: "6 de agosto de 2021"
    }
]

export default function CalculadoraReconversion() {
    const [monto, setMonto] = useState("")
    const [fecha, setFecha] = useState("")
    const [resultado, setResultado] = useState(null)
    const [modalAbierto, setModalAbierto] = useState(false);

    function calcular() {
        if (!monto || !fecha) return
        const fechaInput = new Date(fecha)
        let montoActual = parseFloat(monto)
        const detalle = []

        for (const r of reconversiones) {
            if (fechaInput < r.fecha) {
                montoActual *= r.factor
                detalle.push({
                    ...r,
                    montoResultante: montoActual
                })
            }
        }
        setResultado({ final: montoActual, detalle })
        setModalAbierto(true);
    }

    return (
        <div className="p-4 max-w-xl mx-auto space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Calculadora de Reconversión Monetaria</h1>
                <p className="text-sm text-muted-foreground">Calcule el valor actual de un monto histórico en bolívares.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm" htmlFor="input-monto">Monto original (en bolívares)</label>
                    <CurrencyInput
                        id="input-monto"
                        name="input-monto"
                        placeholder="Ej: 1.000.000,00"
                        decimalsLimit={2}
                        allowDecimals={true}
                        decimalSeparator=","
                        groupSeparator="."
                        value={monto}
                        onValueChange={(value) => setMonto(value)}
                        className="w-full border-input rounded-md h-10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                </div>

                <div className="space-y-1">
                    <label className="text-sm" htmlFor="input-fecha">Fecha del monto</label>
                    <Input
                        id="input-fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={calcular} className="w-full">Calcular</Button>
                </div>
            </div>

            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent className="max-w-md p-6 rounded-lg border bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">
                            Resultado de la Conversión Monetaria
                        </DialogTitle>
                    </DialogHeader>

                    {resultado && (
                        <div className="space-y-2 text-sm text-gray-700">
                            <div className="text-2xl font-bold text-center text-green-600">
                                {resultado.final.toFixed(2)} Bs.D
                            </div>

                            <hr className="my-2" />

                            <p><strong>Fecha del monto original:</strong> {resultado.fecha}</p>
                            <ul className="list-disc pl-5 text-sm">
                                {resultado.detalle.map((r, i) => (
                                    <li key={i} className="mt-2">
                                        <strong>{r.nombre}</strong> aplicado el {format(r.fecha, 'dd/MM/yyyy')}<br />
                                        Decreto: {r.decreto}, {r.gaceta} ({r.publicada})<br />
                                        Factor: {r.factor.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}<br />
                                        Monto tras conversión: {r.montoResultante.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <DialogFooter className="mt-4 pt-4 border-t text-xs text-muted-foreground text-justify leading-relaxed">
                        Este cálculo es estimativo, basado en los decretos oficiales publicados en Gaceta Oficial sobre las reconversiones monetarias de 2008, 2018 y 2021.
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}