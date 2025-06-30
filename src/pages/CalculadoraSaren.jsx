import React, { useMemo, useState } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons"
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { data } from "@/lib/sarenData";

const PETRO_TO_USD = 60;

function findActData(organismo, act) {
    if (!organismo || !act) return null;
    const orgData = data[organismo];
    if (!orgData) return null;
    if (orgData[act]) return orgData[act];
    for (const value of Object.values(orgData)) {
        if (value && typeof value === "object" && value[act]) {
            return value[act];
        }
    }
    return null;
}


const tiposLibros = [
    "Diario",
    "Mayor",
    "Balance e Inventarios",
    "Asamblea",
    "Accionistas",
    "Junta Directiva",
];

export default function CalculadoraAranceles() {
    const [organismo, setOrganismo] = useState("");
    const [grupo, setGrupo] = useState("");
    const [actuacion, setActuacion] = useState("");
    const [libros, setLibros] = useState({});
    const [folios, setFolios] = useState("");
    const [capital, setCapital] = useState("");
    const [resultado, setResultado] = useState(null);
    const [open, setOpen] = useState(false);

    const actData = useMemo(() => findActData(organismo, actuacion), [organismo, actuacion]);
    const requiresFolios = actData && typeof actData.primerFolio === "number";
    const requiresCapital = actData && typeof actData.porcentajeCapital === "number";

    const handleLibroChange = (libro, folios) => {
        setLibros((prev) => ({ ...prev, [libro]: folios }));
    };

    const calcular = () => {
        if (!organismo || !actuacion) return;

        let totalPetros = 0;
        let breakdown = {};

        if (actuacion === "Sellado de Libros") {
            const TASA_LIBRO = 0.10; // por libro
            const TASA_FOLIO = 0.01; // por folio
            for (const [libro, folios] of Object.entries(libros)) {
                const f = parseFloat(folios);
                if (!isNaN(f) && f > 0) {
                    const totalLibroPetros = TASA_LIBRO + TASA_FOLIO * f;
                    totalPetros += totalLibroPetros;
                }
            }
        } else if (actData) {
            const folioCount = parseFloat(folios) || 0;
            const capitalAmount = parseFloat(capital) || 0;
            let folioCharge = 0;
            let capitalCharge = 0;

            if (requiresFolios) {
                folioCharge = actData.primerFolio;
                if (folioCount > 1) {
                    folioCharge += (folioCount - 1) * actData.folioAdicional;
                }
                if (actData.tipo === "petro" || actData.tipo === "petro+porcentaje") {
                    totalPetros += folioCharge;
                }
            }

            if (requiresCapital) {
                capitalCharge = capitalAmount * actData.porcentajeCapital;
                if (actData.tipo === "porcentaje" || actData.tipo === "petro+porcentaje") {
                    totalPetros += capitalCharge;
                }
            }

            breakdown = { folioCharge, capitalCharge };
        } else if (typeof data[organismo][actuacion] === "number") {
            totalPetros = data[organismo][actuacion];
        }

        const totalUSD = totalPetros * PETRO_TO_USD;
        setResultado({ organismo, actuacion, totalUSD, totalPetros, breakdown, fecha: new Date().toLocaleDateString() });
    };

    return (
        <div className="p-4 max-w-xl mx-auto space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Calculadora de Aranceles - SAREN</h1>
                <p className="text-sm text-muted-foreground">Seleccione el organismo y la actuación para estimar el costo.</p>
            </div>

            <div className="space-y-3">
                <Select onValueChange={setOrganismo}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione el organismo" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(data).map((org) => (
                            <SelectItem key={org} value={org}>{org}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {organismo && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={false}
                                className={`w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-left font-normal shadow-sm ${actuacion ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {actuacion || "Seleccione la actuación"}
                                <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>

                        </PopoverTrigger>
                        <PopoverContent align="start" className="min-w-[--radix-popover-trigger-width] w-auto p-0">
                            <Command>
                                <CommandInput placeholder="Buscar actuación..." />
                                <CommandList className="max-h-64 overflow-y-auto">
                                    {Object.entries(data[organismo]).map(([grupo, actos]) => (
                                        <CommandGroup key={grupo} heading={grupo}>
                                            {Object.keys(actos).map((act) => (
                                                <CommandItem
                                                    key={act}
                                                    value={act}
                                                    onSelect={() => {
                                                        setActuacion(act);
                                                        setFolios("");
                                                        setCapital("");
                                                        setLibros({});
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {act}
                                                    {act === actuacion && (
                                                        <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                                                    )}
                                                </CommandItem>

                                            ))}
                                        </CommandGroup>
                                    ))}
                                </CommandList>
                                <CommandEmpty>No se encontró ninguna actuación.</CommandEmpty>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {requiresFolios && actuacion !== "Sellado de Libros" && (
                <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Cantidad de folios"
                    className="w-full"
                    value={folios}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (/^[1-9][0-9]*$/.test(value) || value === "0")) {
                            setFolios(value);
                        }
                    }}
                />
            )}

            {requiresCapital && (
                <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Capital"
                    className="w-full"
                    value={capital}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
                            setCapital(value);
                        }
                    }}
                />
            )}

            {actuacion === "Sellado de Libros" && (
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Sellado de libros</h2>
                        <p className="text-sm text-muted-foreground">
                            Indique la cantidad de folios por cada tipo de libro a sellar.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {tiposLibros.map((libro) => (
                            <div
                                key={libro}
                                className="flex items-center justify-between gap-4 border rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition min-h-[56px]"
                            >
                                <label
                                    htmlFor={`checkbox-${libro}`}
                                    className="flex items-center gap-2 text-sm cursor-pointer w-full justify-start"
                                >
                                    <Checkbox
                                        id={`checkbox-${libro}`}
                                        checked={libros[libro] !== undefined}
                                        onCheckedChange={(checked) => {
                                            const newLibros = { ...libros };
                                            if (!checked) {
                                                delete newLibros[libro];
                                            } else {
                                                newLibros[libro] = "";
                                            }
                                            setLibros(newLibros);
                                        }}
                                    />
                                    {libro}
                                </label>

                                {libros[libro] !== undefined ? (
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Folios"
                                        className="w-24 text-end"
                                        value={libros[libro]}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Permitir solo números enteros sin ceros antepuestos (excepto el "0" solito)
                                            if (value === "" || (/^[1-9][0-9]*$/.test(value) || value === "0")) {
                                                handleLibroChange(libro, value);
                                            }
                                        }}
                                    />


                                ) : (
                                    <div className="w-24"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button onClick={calcular} className="w-full">Calcular</Button>
            </div>

            {resultado && (
                <div className="border rounded-xl p-4 space-y-2">
                    <h2 className="text-lg font-semibold">Resumen de la estimación</h2>
                    <p><strong>Organismo:</strong> {resultado.organismo}</p>
                    <p><strong>Actuación:</strong> {resultado.actuacion}</p>
                    <p><strong>Fecha:</strong> {resultado.fecha}</p>
                    {resultado.totalPetros !== undefined && (
                        <p><strong>Total estimado (Petros):</strong> {resultado.totalPetros.toFixed(2)}</p>
                    )}
                    <p><strong>Total estimado (USD):</strong> ${resultado.totalUSD.toFixed(2)}</p>
                    {(resultado.breakdown.folioCharge || resultado.breakdown.capitalCharge) && (
                        <div className="text-sm space-y-1">
                            {resultado.breakdown.folioCharge ? (
                                <p>Por folios: {resultado.breakdown.folioCharge.toFixed(2)} Petros</p>
                            ) : null}
                            {resultado.breakdown.capitalCharge ? (
                                <p>Por capital: {resultado.breakdown.capitalCharge.toFixed(2)} Petros</p>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}