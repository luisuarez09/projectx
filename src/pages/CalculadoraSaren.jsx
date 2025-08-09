import React, { useMemo, useState } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons"
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { data } from "@/lib/sarenData";

const PETRO_TO_USD = 60;


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
    const [modalAbierto, setModalAbierto] = useState(false);

    const handleLibroChange = (libro, folios) => {
        setLibros((prev) => ({ ...prev, [libro]: folios }));
    };

    const selectedActData = useMemo(() => {
        if (!organismo || !actuacion) return null;
        const orgData = data[organismo];
        if (!orgData) return null;
        if (orgData[actuacion]) return orgData[actuacion];
        for (const actos of Object.values(orgData)) {
            if (actos && typeof actos === "object" && actos[actuacion]) {
                return actos[actuacion];
            }
        }
        return null;
    }, [organismo, actuacion]);

    const calcular = () => {
        if (!organismo || !actuacion) return;
        let totalPetros = 0;

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
        } else if (selectedActData) {
            if (
                selectedActData.primerFolio !== undefined &&
                selectedActData.folioAdicional !== undefined
            ) {
                const f = parseInt(folios, 10);
                if (!isNaN(f) && f > 0) {
                    totalPetros +=
                        selectedActData.primerFolio +
                        selectedActData.folioAdicional * Math.max(f - 1, 0);
                }
            } else if (typeof selectedActData === "number") {
                totalPetros += selectedActData;
            }

            if (selectedActData.porcentajeCapital !== undefined) {
                const c = parseFloat(capital);
                if (!isNaN(c) && c > 0) {
                    totalPetros += c * selectedActData.porcentajeCapital;
                }
            }
        }

        const totalUSD = totalPetros * PETRO_TO_USD;
        setResultado({ organismo, actuacion, totalUSD, fecha: new Date().toLocaleDateString() });
        setModalAbierto(true);
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

            {selectedActData &&
                selectedActData.primerFolio !== undefined &&
                selectedActData.folioAdicional !== undefined &&
                actuacion !== "Sellado de Libros" && (
                    <div className="space-y-1">
                        <label className="text-sm" htmlFor="input-folios">
                            Total de folios
                        </label>
                        <Input
                            id="input-folios"
                            type="text"
                            inputMode="numeric"
                            placeholder="Folios"
                            value={folios}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || (/^[1-9][0-9]*$/.test(value) || value === "0")) {
                                    setFolios(value);
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                )}

            {selectedActData && selectedActData.porcentajeCapital !== undefined && (
                <div className="space-y-1">
                    <label className="text-sm" htmlFor="input-capital">
                        Monto del capital
                    </label>
                    <Input
                        id="input-capital"
                        type="text"
                        inputMode="decimal"
                        placeholder="Capital"
                        value={capital}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
                                setCapital(value);
                            }
                        }}
                        className="w-full"
                    />
                </div>
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

            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent className="max-w-md p-6 rounded-lg border bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">
                            Cálculo Estimado de Aranceles
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2 text-sm text-gray-700">
                        <div className="text-2xl font-bold text-center text-green-600">
                            ${resultado?.totalUSD.toFixed(2)} USD
                        </div>

                        <hr className="my-2" />

                        <p><strong>Organismo:</strong> {resultado?.organismo}</p>
                        <p><strong>Actuación:</strong> {resultado?.actuacion}</p>
                        <p><strong>Fecha:</strong> {resultado?.fecha}</p>
                    </div>

                    <DialogFooter className="mt-4 pt-4 border-t text-xs text-muted-foreground text-justify leading-relaxed">
                        Este cálculo tiene carácter estimativo y orientativo, basado en lo dispuesto en la Providencia Administrativa Nº 002 publicada en la Gaceta Oficial N° 42.301 del 20/01/2022, y corresponde al monto que se reflejará en la Planilla Única Bancaria (PUB) emitida por el SAREN.
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}