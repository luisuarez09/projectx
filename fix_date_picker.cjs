const fs = require('fs');
let code = fs.readFileSync('src/pages/invoices/compras/compras-create.jsx', 'utf8');

const t1 = `// Conversión de fechas\r
function toISOFromDDMMYYYY(s) { const [dd, mm, yyyy] = (s || "").split("/"); if (!dd || !mm || !yyyy) return new Date().toISOString().slice(0, 10); return \`\${yyyy}-\${mm.padStart(2, "0")}-\${dd.padStart(2, "0")}\` }\r
function toDDMMYYYYFromISO(iso) { const d = new Date(iso); const dd = String(d.getDate()).padStart(2, "0"); const mm = String(d.getMonth() + 1).padStart(2, "0"); const yyyy = d.getFullYear(); return \`\${dd}/\${mm}/\${yyyy}\` }`;

const r1 = `// Conversión de fechas\r
function toISOFromDDMMYYYY(s) { const [dd, mm, yyyy] = (s || "").split("/"); if (!dd || !mm || !yyyy || yyyy.length !== 4) return new Date().toISOString().slice(0, 10); return \`\${yyyy}-\${mm.padStart(2, "0")}-\${dd.padStart(2, "0")}\` }\r
function toDDMMYYYYFromISO(iso) { const d = new Date(iso); const dd = String(d.getDate()).padStart(2, "0"); const mm = String(d.getMonth() + 1).padStart(2, "0"); const yyyy = d.getFullYear(); return \`\${dd}/\${mm}/\${yyyy}\` }\r
function parseDateForCalendar(iso) { const [yyyy, mm, dd] = iso.split("-"); return new Date(yyyy, mm - 1, dd) }\r
\r
function handleDateTextChange(e, setDisplay, setISO) {\r
  let val = e.target.value.replace(/\\D/g, "");\r
  if (val.length > 8) val = val.slice(0, 8);\r
  \r
  let formatted = val;\r
  if (val.length > 2) formatted = val.slice(0, 2) + "/" + val.slice(2);\r
  if (val.length > 4) formatted = formatted.slice(0, 5) + "/" + val.slice(4);\r
  \r
  setDisplay(formatted);\r
  if (formatted.length === 10) {\r
    const iso = toISOFromDDMMYYYY(formatted);\r
    setISO(iso);\r
  }\r
}`;

const t2 = `              <Field label="Fecha (DD/MM/AAAA)">\r
                <Input value={dateDisplay} onChange={(e) => { const val = e.target.value; setDateDisplay(val); setDateISO(toISOFromDDMMYYYY(val)) }} placeholder="31/08/2025" />\r
              </Field>`;

const r2 = `              <Field label="Fecha (DD/MM/AAAA)">\r
                <Popover>\r
                  <div className="relative">\r
                    <Input \r
                      value={dateDisplay} \r
                      onChange={(e) => handleDateTextChange(e, setDateDisplay, setDateISO)} \r
                      placeholder="DD/MM/AAAA" \r
                    />\r
                    <PopoverTrigger asChild>\r
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" tabIndex="-1">\r
                        <CalendarIcon className="h-4 w-4" />\r
                      </Button>\r
                    </PopoverTrigger>\r
                  </div>\r
                  <PopoverContent className="w-auto p-0" align="start">\r
                    <Calendar\r
                      mode="single"\r
                      selected={parseDateForCalendar(dateISO)}\r
                      onSelect={(date) => {\r
                        if (date) {\r
                          const iso = date.toISOString().slice(0, 10);\r
                          setDateISO(iso);\r
                          setDateDisplay(toDDMMYYYYFromISO(iso));\r
                        }\r
                      }}\r
                      initialFocus\r
                    />\r
                  </PopoverContent>\r
                </Popover>\r
              </Field>`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);

fs.writeFileSync('src/pages/invoices/compras/compras-create.jsx', code);
console.log('done');
