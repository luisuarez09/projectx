import React, { useState } from "react";
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

const PETRO_TO_USD = 60;

const data = {
    "Registro Mercantil": {
        "Actos constitutivos": {
            // Artículo 4, Numeral 1
            "Constitución de compañía": {
                tipo: "petro+porcentaje",
                articulo: 4,
                numeral: 1,
                primerFolio: 1.5,
                folioAdicional: 0.2,
                porcentajeCapital: 0.02 // 2%
            },
            // Artículo 4, Numeral 1
            "Cambio de nombre": {
                tipo: "petro",
                articulo: 4,
                numeral: 1,
                primerFolio: 1.5,
                folioAdicional: 0.2
            }
        },
        "Actos no constitutivos": {
            "Acta de asamblea y junta directiva de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Aumento de capital de empresa mercantil": { tipo: "porcentaje", articulo: 4, numeral: 14, porcentajeCapital: 0.02 },
            "Cambio de domicilio nacional de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 15, primerFolio: 3.0, folioAdicional: 0.2 },
            "Disolución de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Domiciliación de expediente de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Fusión de compañías": { tipo: "petro", articulo: 4, numeral: 18, primerFolio: 5.0, folioAdicional: 0.05 },
            "Liquidación de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Modificación al documento de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Nombramiento de junta directiva de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Prórroga de duración de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 2, primerFolio: 1.0, folioAdicional: 0.05 },
            "Reducción de capital de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 7, primerFolio: 0.8, folioAdicional: 0.05 },
            "Renuncia a la denominación de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 7, primerFolio: 0.8, folioAdicional: 0.05 },
            "Solicitud de agregado": { tipo: "petro", articulo: 4, numeral: 8, primerFolio: 0.6, folioAdicional: 0.04 },
            "Solicitud de agregado de publicación": { tipo: "petro", articulo: 4, numeral: 8, primerFolio: 0.6, folioAdicional: 0.04 },
            "Transformación de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 7, primerFolio: 0.8, folioAdicional: 0.05 },
            "Venta de acciones de empresa mercantil": { tipo: "petro", articulo: 4, numeral: 17, primerFolio: 2.0, folioAdicional: 0.05 },
            "Venta de cuotas de participación": { tipo: "petro", articulo: 4, numeral: 4, primerFolio: 2.0, folioAdicional: 0.05 },
            "Venta de fondo de comercio": { tipo: "petro", articulo: 4, numeral: 4, primerFolio: 2.0, folioAdicional: 0.05 }
        },
        "Otros actos": {
            "Capitulación matrimonial": { tipo: "petro", articulo: 4, numeral: 5, primerFolio: 1.0, folioAdicional: 0.05 },
            "Contratos de adhesión": {}, // Pendiente
            "Declaración sucesoral": {}, // Pendiente
            "Factores mercantiles": { tipo: "petro", articulo: 4, numeral: 5, primerFolio: 1.0, folioAdicional: 0.05 },
            "Fideicomisos": {}, // Pendiente
            "Poderes personas jurídicas": { tipo: "petro", articulo: 4, numeral: 5, primerFolio: 1.0, folioAdicional: 0.05 },
            "Poderes personas naturales": { tipo: "petro", articulo: 4, numeral: 5, primerFolio: 1.0, folioAdicional: 0.05 }
        },
        "Archivo": {
            "Copia certificada fotostática": { tipo: "petro", articulo: 4, numeral: 12, primerFolio: 0.09, folioAdicional: 0.01 },
            "Copia simple fotostática": { tipo: "petro", articulo: 4, numeral: 12, primerFolio: 0.03, folioAdicional: 0.01 },
            "Sellado de Libros": { tipo: "petro", articulo: 4, numeral: 10, primerFolio: 0.1, folioAdicional: 0.01 }
        }
    },
    "Notaría": {
        "Documento Autenticado": 2,
        "Poder General": 3,
        "Poder Especial": 2,
    },
    "Registro Principal": {
        "Copias certificadas": {
            "Acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Acta de matrimonio (inscrita en registro principal)": 0,
            "Acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Actas constitutivas (asoc/soc/fundac inscrita en registro principal)": 0,
            "Actas de asamblea (asoc/soc/fundac inscrita en registro principal)": 0,
            "Asociaciones (asoc/soc/fundac inscrita en registro principal)": 0,
            "Corporaciones de carácter privado (asoc/soc/fundac inscrita en registro principal)": 0,
            "Declaración de voluntad (inscrita en registro principal)": 0,
            "Decreto de adopción (emitida por registro civil/otros entes civiles)": 0,
            "Fundaciones (asoc/soc/fundac inscrita en registro principal)": 0,
            "Inserción acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Inserción acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Reconocimiento posterior (emitida por registro civil/otros entes civiles)": 0,
            "Sentencia de interdicción (inscrita en registro principal)": 0,
            "Sentencias de divorcio (inscrita en registro principal)": 0,
            "Separación de cuerpos (inscrita en registro principal)": 0,
            "Sociedades civiles (asoc/soc/fundac inscrita en registro principal)": 0,
            "Título universitario (inscrita en registro principal)": 0
        },
        "Protocolización": {
            "Actas de asamblea (asambleas ONG)": 0,
            "Doctor Honoris Causa (título universitario)": 0,
            "Nulidad de acta de asamblea y del asiento registral (emitidas por tribunales)": 0,
            "Sentencia de adopción (emitidas por tribunales)": 0,
            "Sentencia de impugnación de paternidad (emitidas por tribunales)": 0,
            "Sentencia de inquisición de paternidad (emitidas por tribunales)": 0,
            "Sentencia de interdicción (emitidas por tribunales)": 0,
            "Sentencias de divorcio (emitidas por tribunales)": 0,
            "Separación de cuerpos (emitidas por tribunales)": 0,
            "Título universitario (título universitario)": 0
        },
        "Legalizaciones": {
            "Acción mero declarativa (emitidas por tribunales)": 0,
            "Aclaratoria de acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Aclaratoria de acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Aclaratoria (inscrita en registro público)": 0,
            "Acta constitutiva organizaciones civiles de carácter privado (ONG registro público)": 0,
            "Acta constitutiva sociedades mercantiles (registro mercantil)": 0,
            "Acta de asamblea organizaciones civiles de carácter privado (ONG registro público)": 0,
            "Acta de asamblea sociedades mercantiles (registro mercantil)": 0,
            "Acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Acta de matrimonio (emitidas por tribunales)": 0,
            "Acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Actas constitutivas (asoc/soc/fundac inscrita en registro principal)": 0,
            "Actas de asamblea (asoc/soc/fundac inscrita en registro principal)": 0,
            "Adendum (notaría)": 0,
            "Autorización de representación judicial (emitidas por tribunales)": 0,
            "Autorización judicial de representación en el extranjero (emitidas por tribunales)": 0,
            "Autorización para viaje de niño, niña y adolescentes (notaría)": 0,
            "Autorizaciones (notaría)": 0,
            "Cambio de residencia internacional (emitidas por tribunales)": 0,
            "Cancelación de hipoteca 1er grado (inscrita en registro público)": 0,
            "Capitulaciones matrimoniales (inscrita en registro público)": 0,
            "Capitulaciones matrimoniales (notaría)": 0,
            "Carta de soltería (otros)": 0,
            "Carta rogatoria (emitidas por tribunales)": 0,
            "Cartel de citación (emitidas por tribunales)": 0,
            "Certificación de nacido vivo (emitida por registro civil/otros entes civiles)": 0,
            "Certificación de no naturalizado (emitida por registro civil/otros entes civiles)": 0,
            "Certificado de solvencia de sucesiones (emitida por registro civil/otros entes civiles)": 0,
            "Certificado de solvencia de sucesiones (inscrita en registro principal)": 0,
            "Cesiones onerosas (notaría)": 0,
            "Colocación familiar (emitidas por tribunales)": 0,
            "Constancia de no existencia (emitida por registro civil/otros entes civiles)": 0,
            "Constancia de residencia (otros)": 0,
            "Constancia de viudez (otros)": 0,
            "Constancias (emitida por registro civil/otros entes civiles)": 0,
            "Contratos (notaría)": 0,
            "Dación en pago con valor estimado (inscrita en registro público)": 0,
            "Declaración de no poseer vivienda (notaría)": 0,
            "Declaración de voluntad (notaría)": 0,
            "Declaraciones juradas (notaría)": 0,
            "Declaratoria de nacionalidad (emitida por registro civil/otros entes civiles)": 0,
            "Decreto de adopción (emitida por registro civil/otros entes civiles)": 0,
            "Disolución de unión estable de hecho (emitida por registro civil/otros entes civiles)": 0,
            "Disolución de unión estable de hecho (emitidas por tribunales)": 0,
            "Donación (notaría)": 0,
            "Edicto (emitidas por tribunales)": 0,
            "Exequatur (emitidas por tribunales)": 0,
            "Expediente de sociedades de mercantiles (registro mercantil)": 0,
            "Extradición (emitidas por tribunales)": 0,
            "Extradición (inscrita en registro principal)": 0,
            "Factores mercantiles (registro mercantil comercial)": 0,
            "Fe de vida (otros)": 0,
            "Fianzas (notaría)": 0,
            "Fideicomiso (notaría)": 0,
            "Garantía (notaría justificativos)": 0,
            "Impugnación de reconocimiento (emitidas por tribunales)": 0,
            "Impugnación y inquisición de paternidad (emitidas por tribunales)": 0,
            "Inhabilitación de adulto (emitidas por tribunales)": 0,
            "Inserción acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Inserción acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Inserción acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Inserción acta de naturalización (emitida por registro civil/otros entes civiles)": 0,
            "Inserción acta de reconocimiento (emitida por registro civil/otros entes civiles)": 0,
            "Inspección judicial (emitidas por tribunales)": 0,
            "Invitaciones a extranjeros (notaría)": 0,
            "Justificativo de carga familiar (emitidas por tribunales)": 0,
            "Justificativo de testigos (emitidas por tribunales)": 0,
            "Justificativo de únicos y universales herederos (emitidas por tribunales)": 0,
            "Justificativo de unión estable de hecho (emitida por registro civil/otros entes civiles)": 0,
            "Justificativo de unión estable de hecho (notaría)": 0,
            "Justificativos con fines legales (emitidas por tribunales)": 0,
            "Justificativos con fines legales (notaría justificativos)": 0,
            "Justificativos con fines matrimoniales (notaría justificativos)": 0,
            "Liberación de hipoteca (inscrita en registro público)": 0,
            "Liberación de hipoteca (notaría)": 0,
            "Medida anticipada preventiva de custodia (emitidas por tribunales)": 0,
            "Medida cautelar de embargo (emitidas por tribunales)": 0,
            "Participación y liquidación hereditaria (inscrita en registro público)": 0,
            "Poder (inscrita en registro público)": 0,
            "Poder (notaría)": 0,
            "Poder (registro mercantil)": 0,
            "Reconocimiento (emitida por registro civil/otros entes civiles)": 0,
            "Reconocimiento (emitidas por tribunales)": 0,
            "Reconocimiento (inscrita en registro principal)": 0,
            "Reconocimiento (inscrita en registro público)": 0,
            "Reconocimiento (notaría)": 0,
            "Reconstrucción de expediente de divorcio (emitidas por tribunales)": 0,
            "Rectificación de acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Rectificación de acta de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Rectificación de acta de matrimonio (emitidas por tribunales)": 0,
            "Rectificación de partida (emitida por registro civil/otros entes civiles)": 0,
            "Renuncia de derecho (notaría)": 0,
            "Renuncia de herencia (inscrita en registro público)": 0,
            "Renuncia de herencia (notaría)": 0,
            "Renuncia de nacionalidad (emitida por registro civil/otros entes civiles)": 0,
            "Renuncia de poder (inscrita en registro público)": 0,
            "Renuncia de poder (notaría)": 0,
            "Revocatoria de contratos (notaría)": 0,
            "Revocatoria de poder (inscrita en registro público)": 0,
            "Revocatoria de poder (notaría)": 0,
            "Sentencia de adopción (emitidas por tribunales)": 0,
            "Sentencia de adopción (inscrita en registro principal)": 0,
            "Sentencia de autorización de viaje (emitidas por tribunales)": 0,
            "Sentencia de autorización de viaje (inscrita en registro principal)": 0,
            "Sentencia de ejercicio unilateral de patria potestad (emitidas por tribunales)": 0,
            "Sentencia de ejercicio unilateral de patria potestad (inscrita en registro principal)": 0,
            "Sentencia de herederos únicos y universales (emitidas por tribunales)": 0,
            "Sentencia de herederos únicos y universales (inscrita en registro principal)": 0,
            "Sentencia de homologación (emitidas por tribunales)": 0,
            "Sentencia de sobreseimiento (emitidas por tribunales)": 0,
            "Sentencia de tutela (inscrita en registro público)": 0,
            "Sentencia definitiva (emitidas por tribunales)": 0,
            "Sentencia (emitidas por tribunales)": 0,
            "Sentencia (inscrita en registro principal)": 0,
            "Sentencia (inscrita en registro público)": 0,
            "Sentencia interlocutoria (emitidas por tribunales)": 0,
            "Sentencias de divorcio (emitidas por tribunales)": 0,
            "Sentencias de divorcio (inscrita en registro principal)": 0,
            "Sentencias de divorcio (inscrita en registro público)": 0,
            "Separación de cuerpos (emitidas por tribunales)": 0,
            "Solicitud de agregado (registro mercantil)": 0,
            "Sustitución de poder (inscrita en registro público)": 0,
            "Sustitución de poder (notaría)": 0,
            "Testamento (inscrita en registro público)": 0,
            "Testamento (notaría)": 0,
            "Traducción pública (notaría)": 0,
            "Tutela (emitidas por tribunales)": 0,
            "Venta de bien mueble (notaría)": 0,
            "Venta (inscrita en registro público)": 0,
            "Venta (notaría)": 0
        },
        "Notas al margen": {
            "Acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Autenticaciones de notaría (notaría)": 0,
            "Exequatur (inscrita en registro principal)": 0,
            "Legitimación por consiguiente de matrimonio (emitida por registro civil/otros entes civiles)": 0,
            "Modificación de título universitario (inscrita en registro principal)": 0,
            "Nulidad de acta de asamblea y del asiento registral (emitidas por tribunales)": 0,
            "Nulidad de acta de nacimiento (emitida por registro civil/otros entes civiles)": 0,
            "Reconocimiento posterior (inscrita en registro principal)": 0,
            "Rectificación de acta de defunción (emitida por registro civil/otros entes civiles)": 0,
            "Rectificación de acta de defunción (emitidas por tribunales)": 0,
            "Rectificación de acta de matrimonio (inscrita en registro principal)": 0,
            "Rectificación de partida (emitida por registro civil/otros entes civiles)": 0,
            "Rectificación de partida (emitidas por tribunales)": 0,
            "Recuperación de nacionalidad (inscrita en registro principal)": 0,
            "Renuncia de nacionalidad (inscrita en registro principal)": 0,
            "Revocatoria de poder (notaría)": 0,
            "Sentencia de adopción (inscrita en registro principal)": 0,
            "Sentencia de impugnación de paternidad (inscrita en registro principal)": 0,
            "Sentencia de inquisición de paternidad (inscrita en registro principal)": 0,
            "Sentencia de interdicción (inscrita en registro principal)": 0,
            "Sentencias de divorcio (inscrita en registro principal)": 0
        }
    }
};

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
    const [folios, setFolios] = useState(0);
    const [capital, setCapital] = useState(0);
    const [resultado, setResultado] = useState(null);
    const [open, setOpen] = useState(false);

    const handleLibroChange = (libro, folios) => {
        setLibros((prev) => ({ ...prev, [libro]: folios }));
    };

    const calcular = () => {
        if (!organismo || !actuacion) return;
        let tasa = data[organismo][actuacion];
        let totalUSD = 0;

        if (actuacion === "Sellado de Libros") {
            const TASA_LIBRO = 0.10; // por libro
            const TASA_FOLIO = 0.01; // por folio

            for (const [libro, folios] of Object.entries(libros)) {
                const f = parseFloat(folios);
                if (!isNaN(f) && f > 0) {
                    const totalLibroPetros = TASA_LIBRO + TASA_FOLIO * f;
                    totalUSD += totalLibroPetros * PETRO_TO_USD;
                }
            }
        } else {
            totalUSD = tasa * PETRO_TO_USD;
        }

        setResultado({ organismo, actuacion, totalUSD, fecha: new Date().toLocaleDateString() });
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
                    <p><strong>Total estimado (USD):</strong> ${resultado.totalUSD.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
}