export function formatMoney(n: number, locale = "es-VE", currency = "USD") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n || 0);
}

// Input controlado que guarda "number" pero muestra formateado
export function parseLocaleNumber(value: string, locale = "es-VE") {
  const example = 1000.1;
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(example);
  const group = parts.find(p => p.type === "group")?.value ?? ".";
  const decimal = parts.find(p => p.type === "decimal")?.value ?? ",";
  // normaliza: quita separadores de miles y reemplaza decimal
  const normalized = value
    .replace(new RegExp(`\\${group}`, "g"), "")
    .replace(decimal, ".");
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
}