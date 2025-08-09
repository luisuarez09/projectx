import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseLocaleNumber, formatMoney } from "@/utils/currency";
import { X } from "lucide-react";

export default function EstimateItemRow({ index, register, watch, setValue, remove, currency = "USD" }) {
  const qty = watch(`items.${index}.qty`);
  const unitPrice = watch(`items.${index}.unitPrice`);
  const lineTotal = (Number(qty) || 0) * (Number(unitPrice) || 0);

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-5">
        <Input placeholder="Descripción" {...register(`items.${index}.description`)} />
      </div>
      <div className="col-span-2">
        <Input
          inputMode="decimal"
          placeholder="Cant."
          defaultValue={qty}
          onChange={(e) => setValue(`items.${index}.qty`, parseLocaleNumber(e.target.value))}
        />
      </div>
      <div className="col-span-2">
        <Input placeholder="Unidad" {...register(`items.${index}.unit`)} />
      </div>
      <div className="col-span-2">
        <Input
          inputMode="decimal"
          placeholder="Precio unit."
          defaultValue={unitPrice}
          onChange={(e) => setValue(`items.${index}.unitPrice`, parseLocaleNumber(e.target.value))}
        />
      </div>
      <div className="col-span-1 text-right text-sm font-medium">
        {formatMoney(lineTotal, "es-VE", currency)}
      </div>

      <div className="col-span-12 flex justify-end">
        <Button type="button" variant="ghost" onClick={() => remove(index)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}