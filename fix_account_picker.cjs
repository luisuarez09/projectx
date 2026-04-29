const fs = require('fs');
let code = fs.readFileSync('src/pages/invoices/compras/compras-create.jsx', 'utf8');

const t1 = `function AccountPicker({ value, onChange, typeFilter }) {\r
  const [q, setQ] = useState("")\r
  const filtered = useMemo(() => { const byType = typeFilter ? COA.filter((a) => a.type === typeFilter) : COA; if (!q) return byType; const s = q.toLowerCase(); return byType.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) }, [q, typeFilter])`;

const r1 = `function AccountPicker({ value, onChange, typeFilter }) {\r
  const [q, setQ] = useState("")\r
  const filtered = useMemo(() => { const byType = typeFilter ? COA.filter((a) => a.type === typeFilter) : COA; if (!q) return byType; const s = q.toLowerCase(); return byType.filter((a) => \`\${a.code} \${a.name}\`.toLowerCase().includes(s)) }, [q, typeFilter])`;

const t2 = `<div className="flex w-full items-center gap-2">\r
          <Input value={selected ? accountLabel(selected) : q} onChange={(e) => { setQ(e.target.value); onChange("") }} placeholder="Código o nombre de cuenta" />\r
          <Search className="h-4 w-4 text-muted-foreground" />\r
        </div>`;

const r2 = `<div className="relative w-full">\r
          <Input value={selected ? accountLabel(selected) : q} onChange={(e) => { setQ(e.target.value); onChange("") }} placeholder="Código o nombre de cuenta" className="pr-8" />\r
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />\r
        </div>`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);

fs.writeFileSync('src/pages/invoices/compras/compras-create.jsx', code);
console.log('Fixed AccountPicker');
