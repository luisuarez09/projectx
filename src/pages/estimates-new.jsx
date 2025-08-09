import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estimateSchema } from "@/schemas/estimateSchema";
import EstimateItemRow from "@/components/ui/EstimateItemRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { formatMoney } from "@/utils/currency";

export default function EstimateNew() {
  const form = useForm({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      clientId: "",
      currency: "USD",
      exchangeRate: null,
      taxRate: 0,
      discountRate: 0,
      notes: "",
      items: [{ description: "", qty: 1, unit: "servicio", unitPrice: 0 }],
    },
  });

  const { register, control, handleSubmit, watch, setValue } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const currency = watch("currency");
  const items = watch("items") || [];
  const subtotal = items.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const discountRate = Number(watch("discountRate") || 0);
  const taxRate = Number(watch("taxRate") || 0);
  const discountAmt = subtotal * (discountRate / 100);
  const taxedBase = subtotal - discountAmt;
  const taxAmount = taxedBase * (taxRate / 100);
  const total = taxedBase + taxAmount;

  // Si VES, pide tasa
  const showRate = currency === "VES";

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        items: values.items.map((it) => ({
          ...it,
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
      };

      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert("Error al guardar");
        return;
      }
      // redirige a listado
      window.location.href = "/estimates";
    } catch {
      alert("Error de red al guardar");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Nuevo Presupuesto</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">Cliente ID</label>
            <Input placeholder="ID del cliente" {...register("clientId")} />
          </div>

          <div>
            <label className="text-sm font-medium">Fecha</label>
            <Input type="date" {...register("date")} />
          </div>

          <div>
            <label className="text-sm font-medium">Moneda</label>
            <Select
              value={currency}
              onValueChange={(v) => setValue("currency", v)}
            >
              <SelectTrigger><SelectValue placeholder="Moneda" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="VES">VES</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showRate && (
            <div>
              <label className="text-sm font-medium">Tasa (BCV o pactada)</label>
              <Input
                placeholder="Ej: 40.25"
                inputMode="decimal"
                onChange={(e) => setValue("exchangeRate", Number(e.target.value.replace(",", ".")))}
              />
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Conceptos</h2>
            <Button
              type="button"
              onClick={() => append({ description: "", qty: 1, unit: "servicio", unitPrice: 0 })}
            >
              Agregar concepto
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, idx) => (
              <EstimateItemRow
                key={field.id}
                index={idx}
                register={register}
                watch={watch}
                setValue={setValue}
                remove={remove}
                currency={currency}
              />
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">% Descuento</label>
            <Input
              inputMode="decimal"
              defaultValue={discountRate}
              onChange={(e) => setValue("discountRate", Number(e.target.value.replace(",", ".")))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">% Impuesto</label>
            <Input
              inputMode="decimal"
              defaultValue={taxRate}
              onChange={(e) => setValue("taxRate", Number(e.target.value.replace(",", ".")))}
            />
          </div>
          <div className="md:col-span-2 text-right space-y-1">
            <div>Subtotal: <strong>{formatMoney(subtotal, "es-VE", currency)}</strong></div>
            <div>Descuento: <strong>{formatMoney(discountAmt, "es-VE", currency)}</strong></div>
            <div>Impuesto: <strong>{formatMoney(taxAmount, "es-VE", currency)}</strong></div>
            <div className="text-xl">Total: <strong>{formatMoney(total, "es-VE", currency)}</strong></div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="text-sm font-medium">Notas / Condiciones</label>
          <textarea className="w-full border rounded-md p-2 min-h-[100px]" {...register("notes")} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}
