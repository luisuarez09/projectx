import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos de prueba (Seeding)...');

  // 1. Crear un Usuario Administrador
  const user = await prisma.user.upsert({
    where: { email: 'admin@miempresa.com' },
    update: {},
    create: {
      email: 'admin@miempresa.com',
      passwordHash: 'hashed_placeholder_123', // En producción iría encriptado con bcrypt
      name: 'Administrador Principal',
      role: 'OWNER'
    }
  });
  console.log('✅ Usuario Administrador creado');

  // 2. Crear una Empresa
  const company = await prisma.company.upsert({
    where: { rif: 'J-12345678-9' },
    update: {},
    create: {
      tradeName: 'Mi Empresa Demo',
      legalName: 'Empresa Demo C.A.',
      rif: 'J-12345678-9',
      fiscalAddress: 'Caracas, Venezuela',
      createdById: user.id
    }
  });
  console.log('✅ Empresa creada');

  // 3. Vincular el Usuario con la Empresa (Privilegios)
  await prisma.companyUser.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: 'OWNER',
      modules: ['ventas', 'compras', 'inventario', 'contabilidad', 'bancos']
    }
  });
  console.log('✅ Privilegios de usuario asignados');

  // 4. Crear un Plan de Cuentas Básico (Catálogo)
  const accountsData = [
    { code: '1', name: 'Activos', type: 'ACTIVO', nature: 'DEBIT' },
    { code: '1.1.01', name: 'Banco Moneda Nacional', type: 'ACTIVO', nature: 'DEBIT' },
    { code: '1.1.02', name: 'Banco Moneda Extranjera', type: 'ACTIVO', nature: 'DEBIT' },
    { code: '1.2.01', name: 'Cuentas por Cobrar Clientes', type: 'ACTIVO', nature: 'DEBIT' },
    { code: '2', name: 'Pasivos', type: 'PASIVO', nature: 'CREDIT' },
    { code: '2.1.01', name: 'Cuentas por Pagar Proveedores', type: 'PASIVO', nature: 'CREDIT' },
    { code: '3', name: 'Patrimonio', type: 'PATRIMONIO', nature: 'CREDIT' },
    { code: '4', name: 'Ingresos', type: 'INGRESO', nature: 'CREDIT' },
    { code: '4.1.01', name: 'Ventas de Bienes y Servicios', type: 'INGRESO', nature: 'CREDIT' },
    { code: '5', name: 'Gastos', type: 'GASTO', nature: 'DEBIT' },
    { code: '5.1.01', name: 'Gastos de Administración', type: 'GASTO', nature: 'DEBIT' },
    { code: '5.1.02', name: 'Honorarios Profesionales', type: 'GASTO', nature: 'DEBIT' }
  ];

  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: acc.code } },
      update: {},
      create: {
        companyId: company.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        nature: acc.nature
      }
    });
  }
  console.log('✅ Plan de cuentas básico creado');

  // 5. Crear Impuestos
  const taxIva = await prisma.tax.upsert({
    where: { companyId_name: { companyId: company.id, name: 'IVA 16%' } },
    update: {},
    create: { companyId: company.id, name: 'IVA 16%', rate: 0.16, isExempt: false }
  });
  const taxExempt = await prisma.tax.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Exento' } },
    update: {},
    create: { companyId: company.id, name: 'Exento', rate: 0, isExempt: true }
  });
  console.log('✅ Impuestos (IVA/Exento) creados');

  // 6. Crear Unidades de Medida
  const unitKg = await prisma.unit.upsert({
    where: { companyId_code: { companyId: company.id, code: 'KG' } },
    update: {},
    create: { companyId: company.id, code: 'KG', name: 'Kilogramos', kind: 'MASS' }
  });
  const unitUn = await prisma.unit.upsert({
    where: { companyId_code: { companyId: company.id, code: 'UN' } },
    update: {},
    create: { companyId: company.id, code: 'UN', name: 'Unidad', kind: 'UNIT' }
  });
  console.log('✅ Unidades de medida creadas');

  // 7. Obtener cuentas contables para amarrarlas a productos/proveedores
  const incomeAccount = await prisma.account.findUnique({ where: { companyId_code: { companyId: company.id, code: '4.1.01' } } });
  const expenseAccount = await prisma.account.findUnique({ where: { companyId_code: { companyId: company.id, code: '5.1.02' } } });

  // 8. Crear Productos/Servicios
  await prisma.product.upsert({
    where: { companyId_sku: { companyId: company.id, sku: 'SERV-001' } },
    update: {},
    create: {
      companyId: company.id,
      sku: 'SERV-001',
      name: 'Servicio de Consultoría IT',
      type: 'SERVICE',
      unitPrice: 150,
      taxId: taxIva.id,
      incomeAccountId: incomeAccount?.id,
      expenseAccountId: expenseAccount?.id
    }
  });
  console.log('✅ Productos de prueba creados');

  // 9. Crear Proveedores y Clientes
  await prisma.supplier.upsert({
    where: { companyId_rif: { companyId: company.id, rif: 'J-50000000-1' } },
    update: {},
    create: {
      companyId: company.id,
      rif: 'J-50000000-1',
      name: 'Distribuidora Global, C.A.',
      taxpayerType: 'ORDINARIO',
      email: 'ventas@distribuidora.com',
      defaultExpenseAccountId: expenseAccount?.id
    }
  });

  await prisma.customer.upsert({
    where: { companyId_rif: { companyId: company.id, rif: 'J-60000000-2' } },
    update: {},
    create: {
      companyId: company.id,
      rif: 'J-60000000-2',
      name: 'Inversiones Frecuentes S.A.',
      taxpayerType: 'ORDINARIO',
      email: 'compras@inversiones.com'
    }
  });
  console.log('✅ Clientes y Proveedores creados');

  console.log('🎉 ¡Base de datos poblada con éxito!');
}

main()
  .catch((e) => {
    console.error('Error poblando la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
