export const MOCK_COMPANIES = [
  { id: "acme", tradeName: "Acme Inc", legalName: "Acme S.A.", rif: "J-12345678-9" },
  { id: "ecorisas", tradeName: "Fundación Ecorisas", legalName: "Fundación Ecorisas", rif: "J-87654321-0" },
  { id: "consultoria", tradeName: "Consultoría LS", legalName: "Servicios LS, C.A.", rif: "J-11223344-5" },
]

export const MODULE_LIST = [
  { key: "ventas", label: "Ventas" },
  { key: "compras", label: "Compras" },
  { key: "inventario", label: "Inventario" },
  { key: "contabilidad", label: "Contabilidad" },
  { key: "impuestos", label: "Impuestos" },
  { key: "parafiscales", label: "Parafiscales" },
  { key: "nomina", label: "Nómina" },
]

export const COMPANY_PROFILES = [
  { value: "admin_firma", label: "Administrador de la firma", description: "Acceso completo a todos los módulos" },
  { value: "contador_firma", label: "Contador de la firma", description: "Contabilidad, impuestos, nómina y parafiscales" },
  { value: "cliente", label: "Cliente", description: "Vista de documentos y estados de cuenta propios" },
  { value: "auditor", label: "Auditor", description: "Lectura y revisión de registros contables" },
]

export const PROFILE_DEFAULT_MODULES = {
  admin_firma: ["ventas", "compras", "inventario", "contabilidad", "impuestos", "parafiscales", "nomina"],
  contador_firma: ["contabilidad", "impuestos", "parafiscales", "nomina"],
  cliente: ["ventas"],
  auditor: ["ventas", "compras", "contabilidad"],
}

export const USER_ROLES = [
  { value: "OWNER", label: "Propietario", description: "Control total del sistema" },
  { value: "ADMIN_FIRMA", label: "Administrador de la firma", description: "Gestión de usuarios, empresas y configuración" },
  { value: "CONTADOR_FIRMA", label: "Contador de la firma", description: "Operaciones contables y fiscales" },
  { value: "AUDITOR", label: "Auditor", description: "Revisión y auditoría de registros" },
  { value: "CLIENTE", label: "Cliente", description: "Acceso limitado a su propia información" },
]

export const ROLE_META = {
  OWNER: { label: "Propietario", color: "bg-violet-100 text-violet-700 border-violet-200" },
  ADMIN_FIRMA: { label: "Admin. Firma", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CONTADOR_FIRMA: { label: "Contador", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  AUDITOR: { label: "Auditor", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CLIENTE: { label: "Cliente", color: "bg-slate-100 text-slate-700 border-slate-200" },
}

export const PROFILE_META = {
  admin_firma: { label: "Administrador de la firma", color: "bg-blue-100 text-blue-700 border-blue-200" },
  contador_firma: { label: "Contador de la firma", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cliente: { label: "Cliente", color: "bg-slate-100 text-slate-700 border-slate-200" },
  auditor: { label: "Auditor", color: "bg-amber-100 text-amber-700 border-amber-200" },
}

export const MOCK_USERS = [
  {
    id: "usr-1",
    name: "María González",
    email: "maria@firma.com",
    phone: "+58 412-555-0101",
    role: "ADMIN_FIRMA",
    isActive: true,
    createdAt: "2024-01-15",
    notes: "",
    companies: [
      { id: "acme", tradeName: "Acme Inc", rif: "J-12345678-9", profile: "admin_firma", modules: ["ventas", "compras", "contabilidad", "impuestos"] },
      { id: "ecorisas", tradeName: "Fundación Ecorisas", rif: "J-87654321-0", profile: "contador_firma", modules: ["contabilidad", "impuestos", "parafiscales"] },
    ],
  },
  {
    id: "usr-2",
    name: "Carlos Ramírez",
    email: "carlos@cliente.com",
    phone: "+58 414-555-0202",
    role: "CLIENTE",
    isActive: true,
    createdAt: "2024-03-20",
    notes: "Cliente empresa Acme",
    companies: [
      { id: "acme", tradeName: "Acme Inc", rif: "J-12345678-9", profile: "cliente", modules: ["ventas"] },
    ],
  },
  {
    id: "usr-3",
    name: "Ana Martínez",
    email: "ana@firma.com",
    phone: "+58 416-555-0303",
    role: "CONTADOR_FIRMA",
    isActive: true,
    createdAt: "2024-02-10",
    notes: "",
    companies: [
      { id: "acme", tradeName: "Acme Inc", rif: "J-12345678-9", profile: "contador_firma", modules: ["contabilidad", "impuestos", "parafiscales", "nomina"] },
      { id: "consultoria", tradeName: "Consultoría LS", rif: "J-11223344-5", profile: "contador_firma", modules: ["contabilidad", "impuestos"] },
    ],
  },
  {
    id: "usr-4",
    name: "Pedro Herrera",
    email: "pedro@auditoria.com",
    phone: "+58 424-555-0404",
    role: "AUDITOR",
    isActive: false,
    createdAt: "2024-04-01",
    notes: "Auditor externo",
    companies: [],
  },
  {
    id: "usr-5",
    name: "Luis Suárez",
    email: "luisuarez09@gmail.com",
    phone: "+58 412-000-0000",
    role: "OWNER",
    isActive: true,
    createdAt: "2023-12-01",
    notes: "Propietario del sistema",
    companies: [
      { id: "acme", tradeName: "Acme Inc", rif: "J-12345678-9", profile: "admin_firma", modules: ["ventas", "compras", "inventario", "contabilidad", "impuestos", "parafiscales", "nomina"] },
      { id: "ecorisas", tradeName: "Fundación Ecorisas", rif: "J-87654321-0", profile: "admin_firma", modules: ["ventas", "compras", "inventario", "contabilidad", "impuestos", "parafiscales", "nomina"] },
      { id: "consultoria", tradeName: "Consultoría LS", rif: "J-11223344-5", profile: "admin_firma", modules: ["ventas", "compras", "inventario", "contabilidad", "impuestos", "parafiscales", "nomina"] },
    ],
  },
]
