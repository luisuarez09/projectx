import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

const PETRO_TO_USD = 60;


const data = {
    "Registro Mercantil": {
        "Registro de Compañía": 10,
        "Sellado de Libros": 0, // tarifa se calcula dinámicamente
        "Acta de Asamblea": 1.5,
        "Cambio de Domicilio": 2.5,
    },
    "Notaría": {
        "Documento Autenticado": 2,
        "Poder General": 3,
        "Poder Especial": 2,
    },
    "Registro Principal": {
        "Registro de Título": 1.5,
        "Registro de Documento Civil": 0.5,
    },
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
    const [actuacion, setActuacion] = useState("");
    const [libros, setLibros] = useState({});
    const [resultado, setResultado] = useState(null);

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
      <Select onValueChange={setActuacion}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccione la actuación" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(data[organismo]).map((act) => (
            <SelectItem key={act} value={act}>{act}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
                type="number"
                placeholder="Folios"
                className="w-24 text-end"
                value={libros[libro]}
                onChange={(e) => handleLibroChange(libro, e.target.value)}
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