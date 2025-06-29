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
      <h1 className="text-2xl font-semibold text-center">Calculadora de Aranceles - SAREN</h1>

      <Select onValueChange={setOrganismo}>
        <SelectTrigger>
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
          <SelectTrigger>
            <SelectValue placeholder="Seleccione la actuación" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(data[organismo]).map((act) => (
              <SelectItem key={act} value={act}>{act}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {actuacion === "Sellado de Libros" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Indique la cantidad de folios por cada tipo de libro:</p>
          {tiposLibros.map((libro) => (
            <div key={libro} className="flex items-center gap-2">
              <Checkbox
                id={`checkbox-${libro}`}
                checked={libros[libro] !== undefined}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    const newLibros = { ...libros };
                    delete newLibros[libro];
                    setLibros(newLibros);
                  } else {
                    setLibros((prev) => ({ ...prev, [libro]: "" }));
                  }
                }}
              />
              <label htmlFor={`checkbox-${libro}`} className="text-sm w-40">{libro}</label>
              {libros[libro] !== undefined && (
                <Input
                  type="number"
                  placeholder="Folios"
                  className="w-32"
                  value={libros[libro]}
                  onChange={(e) => handleLibroChange(libro, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Button onClick={calcular} className="w-full">Calcular</Button>

      {resultado && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Resumen de la estimación</h2>
            <p><strong>Organismo:</strong> {resultado.organismo}</p>
            <p><strong>Actuación:</strong> {resultado.actuacion}</p>
            <p><strong>Fecha:</strong> {resultado.fecha}</p>
            <p><strong>Total estimado (USD):</strong> ${resultado.totalUSD.toFixed(2)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}