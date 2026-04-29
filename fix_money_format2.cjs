const fs = require('fs');

const path = 'src/pages/invoices/compras/compras-create.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replace normalize and formatMoney and MoneyInput
const moneyBlock = `function normalize(v) {
  if (!v) return "";
  let str = String(v);
  if (str.includes(',') && str.includes('.')) {
      str = str.replace(/\\./g, "").replace(/,/g, ".");
  } else if (str.includes(',')) {
      str = str.replace(/,/g, ".");
  }
  let clean = str.replace(/[^0-9.]/g, "");
  let parts = clean.split(".");
  if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
  return clean;
}

function formatMoney(n) {
  const num = Number(n);
  if (isNaN(num)) return "0,00";
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

function MoneyInput({ value, onChange, readOnly, ...props }) {
  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value ? formatMoney(value) : "");
    } else {
      setLocalValue(value ? String(value).replace(".", ",") : "");
    }
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
}`;

// I need to locate the old block
const startIdx = code.indexOf('function normalize(');
const endIdx = code.indexOf('function toISOFromDDMMYYYY');
if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + moneyBlock + '\n\n// Conversión de fechas\n' + code.substring(endIdx);
}

// 2. Fix amount values in ensureSystemLines and syncSystemLines
// Wait, currently they have `amount: fix2(...)` and `amount: formatMoney(...)`.
// Let's replace `formatMoney(tax)` with `(Number(tax)||0).toFixed(2)` inside those helpers.
// Let's just find and replace those exact lines.

code = code.replace(/amount: formatMoney\(tax \|\| 0\)/g, 'amount: (Number(tax) || 0).toFixed(2)');
code = code.replace(/amount: formatMoney\(total \|\| 0\)/g, 'amount: (Number(total) || 0).toFixed(2)');
code = code.replace(/amount: formatMoney\(tax\)/g, 'amount: (Number(tax) || 0).toFixed(2)');
code = code.replace(/amount: formatMoney\(total\)/g, 'amount: (Number(total) || 0).toFixed(2)');
code = code.replace(/amount: fix2\(tax \|\| 0\)/g, 'amount: (Number(tax) || 0).toFixed(2)');
code = code.replace(/amount: fix2\(total \|\| 0\)/g, 'amount: (Number(total) || 0).toFixed(2)');
code = code.replace(/amount: fix2\(tax\)/g, 'amount: (Number(tax) || 0).toFixed(2)');
code = code.replace(/amount: fix2\(total\)/g, 'amount: (Number(total) || 0).toFixed(2)');

// 3. For the auto-fill, ensure it only fills if the account is EMPTY or it's an expense account.
// The user said: "en la primera cuenta contable que no tiene aun cuenta asignada"
// So we find the first line where `!l.accountId` or it's an expense account.
const autofillOld = `  // Auto-completar la cuenta de gasto con base + exento
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
  }, [base, exempt]);`;

const autofillNew = `  // Auto-completar la cuenta de gasto con base + exento
  useEffect(() => {
    setGlLines((prev) => {
      const idx = prev.findIndex(l => {
        const acc = findAccountById(l.accountId);
        return !l.accountId || (acc && acc.type === "expense");
      });
      if (idx !== -1) {
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
  }, [base, exempt]);`;

code = code.replace(autofillOld, autofillNew);

fs.writeFileSync(path, code);
console.log('done2');
