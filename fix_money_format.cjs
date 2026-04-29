const fs = require('fs');

const path = 'src/pages/invoices/compras/compras-create.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add formatMoney and MoneyInput, and update normalize
code = code.replace(
  /function normalize\(v\) \{ return v\.replace\(\/,\/g, "\."\)\.replace\(\/\[\^0-9\.\]\/g, ""\) \}/g,
  `function normalize(v) {
  if (!v) return "";
  let clean = String(v).replace(/\\./g, "").replace(/,/g, ".");
  let parts = clean.replace(/[^0-9.]/g, "").split(".");
  if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
  return clean;
}

function formatMoney(n) {
  const num = Number(n);
  if (isNaN(num)) return "0,00";
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function MoneyInput({ value, onChange, readOnly, ...props }) {
  const [localValue, setLocalValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) setLocalValue(value ? formatMoney(value) : "");
  }, [value, isFocused]);

  function handleChange(e) {
    const raw = e.target.value;
    setLocalValue(raw);
    if (onChange) onChange(normalize(raw));
  }

  return (
    <Input
      {...props}
      readOnly={readOnly}
      value={readOnly ? formatMoney(value) : (isFocused ? localValue : (value ? formatMoney(value) : ""))}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={handleChange}
    />
  );
}`
);

// Add React namespace import if needed, but it already uses React hooks. Actually just use `useState` and `useEffect` directly since they are imported.
code = code.replace(/React\.useState/g, 'useState').replace(/React\.useEffect/g, 'useEffect');

// 2. Add auto-fill logic inside ComprasInvoiceCreate
const fillLogic = `  // Atajos Alt+S / Alt+N
  useEffect(() => {`;

const newFillLogic = `  // Auto-completar la cuenta de gasto con base + exento
  useEffect(() => {
    setGlLines((prev) => {
      const idx = prev.findIndex(l => {
        const acc = findAccountById(l.accountId);
        return acc && acc.type === "expense";
      });
      if (idx !== -1 && prev.filter(l => findAccountById(l.accountId)?.type === "expense").length === 1) {
        const sum = (Number(base) || 0) + (Number(exempt) || 0);
        if (sum > 0) {
          const currentAmount = Number(prev[idx].amount) || 0;
          if (currentAmount !== sum) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], amount: String(sum) };
            return copy;
          }
        }
      }
      return prev;
    });
  }, [base, exempt]);

  // Atajos Alt+S / Alt+N
  useEffect(() => {`;

code = code.replace(fillLogic, newFillLogic);

// 3. Replace Inputs with MoneyInput
code = code.replace(
  /<Input inputMode="decimal" value=\{base\} onChange=\{\(e\) => setBase\(normalize\(e\.target\.value\)\)\} placeholder="0\.00" \/>/g,
  `<MoneyInput inputMode="decimal" value={base} onChange={(v) => setBase(v)} placeholder="0,00" />`
);

code = code.replace(
  /<Input inputMode="decimal" value=\{exempt\} onChange=\{\(e\) => setExempt\(normalize\(e\.target\.value\)\)\} placeholder="0\.00" \/>/g,
  `<MoneyInput inputMode="decimal" value={exempt} onChange={(v) => setExempt(v)} placeholder="0,00" />`
);

code = code.replace(
  /<Input value=\{fix2\(tax\)\} readOnly \/>/g,
  `<MoneyInput value={tax} readOnly />`
);

code = code.replace(
  /<Input value=\{fix2\(total\)\} readOnly \/>/g,
  `<MoneyInput value={total} readOnly />`
);

code = code.replace(
  /<Input inputMode="decimal" className="text-right" value=\{l\.amount\} onChange=\{\(e\) => updateLine\(l\.id, \{ amount: normalize\(e\.target\.value\) \}\)\} placeholder="0\.00" \/>/g,
  `<MoneyInput inputMode="decimal" className="text-right" value={l.amount} onChange={(v) => updateLine(l.id, { amount: v })} placeholder="0,00" />`
);

// 4. Update display texts
code = code.replace(/fix2\(balance\.debit\)/g, 'formatMoney(balance.debit)');
code = code.replace(/fix2\(balance\.credit\)/g, 'formatMoney(balance.credit)');
code = code.replace(/fix2\(balance\.debit - balance\.credit\)/g, 'formatMoney(balance.debit - balance.credit)');
code = code.replace(/\{fix2\(total\)\}/g, '{formatMoney(total)}');
code = code.replace(/fix2\(baseNum\)/g, 'formatMoney(baseNum)');
code = code.replace(/fix2\(exemptNum\)/g, 'formatMoney(exemptNum)');
code = code.replace(/fix2\(tax\)/g, 'formatMoney(tax)');

fs.writeFileSync(path, code);
console.log('done');
