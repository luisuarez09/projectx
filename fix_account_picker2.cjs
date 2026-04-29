const fs = require('fs');

const path = 'src/pages/invoices/compras/compras-create.jsx';
let code = fs.readFileSync(path, 'utf8');

const newAccountPicker = `function AccountPicker({ value, onChange, typeFilter }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const filtered = useMemo(() => {
    const byType = typeFilter ? COA.filter((a) => a.type === typeFilter) : COA;
    if (!q) return byType;
    const s = q.toLowerCase();
    // Búsqueda por nombre o código de cuenta
    return byType.filter((a) => a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s));
  }, [q, typeFilter]);

  const selected = findAccountById(value)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQ("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(id) {
    onChange(id)
    setQ("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input 
          value={open ? q : (selected ? accountLabel(selected) : q)} 
          onFocus={() => { setOpen(true); setQ(""); }}
          onChange={(e) => { 
            setQ(e.target.value); 
            setOpen(true); 
            if (selected) onChange(""); 
          }} 
          placeholder={selected ? accountLabel(selected) : "Código o nombre de cuenta"}
          className="pr-8" 
          autoComplete="off"
        />
        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border rounded-md shadow-md p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
          {filtered.map((a) => (
            <button 
              key={a.id} 
              onMouseDown={(e) => { e.preventDefault(); handleSelect(a.id) }} 
              className="text-left px-3 py-2 rounded text-sm hover:bg-muted transition-colors flex flex-col sm:flex-row sm:items-center sm:gap-2"
            >
              <span className="font-medium whitespace-nowrap">{a.code}</span>
              <span className="text-muted-foreground sm:border-l sm:pl-2">{a.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground px-3 py-2">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  )
}`;

const startIdx = code.indexOf('function AccountPicker');
const endIdx = code.indexOf('function Field');

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newAccountPicker + '\n\n' + code.substring(endIdx);
    fs.writeFileSync(path, code);
    console.log('done3');
} else {
    console.log('could not find AccountPicker');
}
