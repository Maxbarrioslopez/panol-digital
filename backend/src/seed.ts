import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.auditoria.deleteMany();
  await prisma.aprobacionSolicitud.deleteMany();
  await prisma.detalleDevolucion.deleteMany();
  await prisma.devolucion.deleteMany();
  await prisma.movimientoStock.deleteMany();
  await prisma.detalleSolicitud.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.compraAutorizada.deleteMany();
  await prisma.costoInsumo.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.modelo.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.categoriaInsumo.deleteMany();
  await prisma.subproceso.deleteMany();
  await prisma.proceso.deleteMany();
  await prisma.ordenTrabajo.deleteMany();
  await prisma.rolPermiso.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();

  // Roles
  const roles = await prisma.rol.createMany({
    data: [
      { nombre: 'Superusuario', nivelPermiso: 100, descripcion: 'Acceso total al sistema', activo: true },
      { nombre: 'Supervisor', nivelPermiso: 80, descripcion: 'Gestión operativa, compras y maestros', activo: true },
      { nombre: 'Pañolero', nivelPermiso: 60, descripcion: 'Gestión de entregas, devoluciones y stock', activo: true },
      { nombre: 'Oficina Técnica', nivelPermiso: 40, descripcion: 'Análisis de costos y reportes', activo: true },
      { nombre: 'Trabajador', nivelPermiso: 20, descripcion: 'Solicitud de insumos por OT', activo: true },
    ],
  });
  console.log('✅ Roles creados');

  // Permisos
  const permisos = await prisma.permiso.createMany({
    data: [
      { codigo: 'AUTH_LOGIN', nombre: 'Iniciar sesión', descripcion: 'Permite iniciar sesión', modulo: 'auth' },
      { codigo: 'USUARIO_CREAR', nombre: 'Crear usuarios', descripcion: 'Crear nuevos usuarios', modulo: 'usuarios' },
      { codigo: 'USUARIO_EDITAR', nombre: 'Editar usuarios', descripcion: 'Editar datos de usuarios', modulo: 'usuarios' },
      { codigo: 'USUARIO_VER', nombre: 'Ver usuarios', descripcion: 'Ver listado de usuarios', modulo: 'usuarios' },
      { codigo: 'INSUMO_CREAR', nombre: 'Crear insumos', descripcion: 'Crear nuevos insumos', modulo: 'insumos' },
      { codigo: 'INSUMO_EDITAR', nombre: 'Editar insumos', descripcion: 'Editar insumos existentes', modulo: 'insumos' },
      { codigo: 'INSUMO_VER', nombre: 'Ver insumos', descripcion: 'Ver catálogo de insumos', modulo: 'insumos' },
      { codigo: 'CATEGORIA_CREAR', nombre: 'Crear categorías', descripcion: 'Crear categorías de insumo', modulo: 'categorias' },
      { codigo: 'CATEGORIA_EDITAR', nombre: 'Editar categorías', descripcion: 'Editar categorías', modulo: 'categorias' },
      { codigo: 'OT_CREAR', nombre: 'Crear OT', descripcion: 'Crear órdenes de trabajo', modulo: 'ordenes_trabajo' },
      { codigo: 'OT_EDITAR', nombre: 'Editar OT', descripcion: 'Editar órdenes de trabajo', modulo: 'ordenes_trabajo' },
      { codigo: 'OT_VER', nombre: 'Ver OT', descripcion: 'Ver órdenes de trabajo', modulo: 'ordenes_trabajo' },
      { codigo: 'SOLICITUD_CREAR', nombre: 'Crear solicitud', descripcion: 'Solicitar insumos', modulo: 'solicitudes' },
      { codigo: 'SOLICITUD_VER', nombre: 'Ver solicitudes', descripcion: 'Ver solicitudes', modulo: 'solicitudes' },
      { codigo: 'SOLICITUD_PROCESAR', nombre: 'Procesar solicitud', descripcion: 'Preparar y entregar solicitudes', modulo: 'solicitudes' },
      { codigo: 'SOLICITUD_ANULAR', nombre: 'Anular solicitud', descripcion: 'Anular ítems o solicitudes completas', modulo: 'solicitudes' },
      { codigo: 'DEVOLUCION_CREAR', nombre: 'Registrar devolución', descripcion: 'Reingresar insumos', modulo: 'devoluciones' },
      { codigo: 'COSTO_VER', nombre: 'Ver costos', descripcion: 'Ver reportes de costos', modulo: 'costos' },
      { codigo: 'COSTO_EXPORTAR', nombre: 'Exportar reportes', descripcion: 'Exportar a Excel/PDF', modulo: 'reportes' },
      { codigo: 'COMPRA_AUTORIZAR', nombre: 'Autorizar compra', descripcion: 'Autorizar reposición de stock', modulo: 'compras' },
      { codigo: 'AUDITORIA_VER', nombre: 'Ver auditoría', descripcion: 'Ver logs de auditoría', modulo: 'auditoria' },
      { codigo: 'CONFIG_VER', nombre: 'Ver configuración', descripcion: 'Configurar parámetros', modulo: 'configuracion' },
    ],
  });
  console.log('✅ Permisos creados');

  const allPermisos = await prisma.permiso.findMany();
  const allRoles = await prisma.rol.findMany();

  // Asignar permisos
  const superusuario = allRoles.find((r) => r.nombre === 'Superusuario')!;
  const supervisor = allRoles.find((r) => r.nombre === 'Supervisor')!;
  const panolero = allRoles.find((r) => r.nombre === 'Pañolero')!;
  const oficina = allRoles.find((r) => r.nombre === 'Oficina Técnica')!;
  const trabajador = allRoles.find((r) => r.nombre === 'Trabajador')!;

  // Superusuario: todos los permisos
  await prisma.rolPermiso.createMany({
    data: allPermisos.map((p) => ({ rolId: superusuario.id, permisoId: p.id })),
  });

  // Supervisor
  const permSupervisor = allPermisos.filter((p) =>
    ['USUARIO_CREAR', 'USUARIO_EDITAR', 'USUARIO_VER', 'INSUMO_CREAR', 'INSUMO_EDITAR', 'INSUMO_VER',
     'CATEGORIA_CREAR', 'CATEGORIA_EDITAR', 'OT_CREAR', 'OT_EDITAR', 'OT_VER', 'SOLICITUD_VER',
     'DEVOLUCION_CREAR', 'COMPRA_AUTORIZAR', 'CONFIG_VER'].includes(p.codigo)
  );
  await prisma.rolPermiso.createMany({
    data: permSupervisor.map((p) => ({ rolId: supervisor.id, permisoId: p.id })),
  });

  // Pañolero
  const permPanolero = allPermisos.filter((p) =>
    ['AUTH_LOGIN', 'INSUMO_VER', 'OT_VER', 'SOLICITUD_VER', 'SOLICITUD_PROCESAR', 'SOLICITUD_ANULAR', 'DEVOLUCION_CREAR'].includes(p.codigo)
  );
  await prisma.rolPermiso.createMany({
    data: permPanolero.map((p) => ({ rolId: panolero.id, permisoId: p.id })),
  });

  // Oficina técnica
  const permOficina = allPermisos.filter((p) =>
    ['AUTH_LOGIN', 'OT_VER', 'SOLICITUD_VER', 'COSTO_VER', 'COSTO_EXPORTAR'].includes(p.codigo)
  );
  await prisma.rolPermiso.createMany({
    data: permOficina.map((p) => ({ rolId: oficina.id, permisoId: p.id })),
  });

  // Trabajador
  const permTrabajador = allPermisos.filter((p) =>
    ['AUTH_LOGIN', 'OT_VER', 'SOLICITUD_CREAR'].includes(p.codigo)
  );
  await prisma.rolPermiso.createMany({
    data: permTrabajador.map((p) => ({ rolId: trabajador.id, permisoId: p.id })),
  });
  console.log('✅ Permisos asignados');

  // Usuarios
  const hashAdmin = await bcrypt.hash('A1234', 12);
  const hashSupervisor = await bcrypt.hash('B5678', 12);
  const hashPanolero = await bcrypt.hash('C9012', 12);
  const hashTrabajador = await bcrypt.hash('D3456', 12);
  const hashOficina = await bcrypt.hash('E7890', 12);

  await prisma.usuario.createMany({
    data: [
      { rut: '1-9', nombre: 'Admin Superusuario', email: 'admin@panoldigital.cl', claveHash: hashAdmin, rolId: superusuario.id, telefono: '+56900000001', activo: true, debeCambiarClave: false, creadoPor: 1 },
      { rut: '12345678-9', nombre: 'Juan Pérez', email: 'juan@panoldigital.cl', claveHash: hashSupervisor, rolId: supervisor.id, telefono: '+56900000002', activo: true, debeCambiarClave: true, creadoPor: 1 },
      { rut: '11111111-1', nombre: 'Ana López', email: 'ana@panoldigital.cl', claveHash: hashPanolero, rolId: panolero.id, telefono: '+56900000003', activo: true, debeCambiarClave: true, creadoPor: 1 },
      { rut: '22222222-2', nombre: 'Pedro Gómez', email: 'pedro@panoldigital.cl', claveHash: hashTrabajador, rolId: trabajador.id, telefono: '+56900000004', activo: true, debeCambiarClave: true, creadoPor: 1 },
      { rut: '33333333-3', nombre: 'María Ruiz', email: 'maria@panoldigital.cl', claveHash: hashOficina, rolId: oficina.id, telefono: '+56900000005', activo: true, debeCambiarClave: true, creadoPor: 1 },
    ],
  });
  console.log('✅ Usuarios creados');

  // Procesos
  await prisma.proceso.createMany({
    data: [
      { nombre: 'Recepción de componente', orden: 1, activo: true },
      { nombre: 'Premecanizado', orden: 2, activo: true },
      { nombre: 'Saneado', orden: 3, activo: true },
      { nombre: 'Reparación especial', orden: 4, activo: true },
      { nombre: 'Soldadura', orden: 5, activo: true },
      { nombre: 'Esmerilado', orden: 6, activo: true },
      { nombre: 'Alivio de tensiones', orden: 7, activo: true },
      { nombre: 'Pulido', orden: 8, activo: true },
      { nombre: 'Metalizado', orden: 9, activo: true },
      { nombre: 'Balanceo', orden: 10, activo: true },
    ],
  });

  const allProcesos = await prisma.proceso.findMany();
  const procMap = new Map(allProcesos.map((p) => [p.nombre, p.id]));

  // Subprocesos
  await prisma.subproceso.createMany({
    data: [
      { procesoId: procMap.get('Recepción de componente')!, nombre: 'Inspección inicial', orden: 1, activo: true },
      { procesoId: procMap.get('Recepción de componente')!, nombre: 'Registro fotográfico', orden: 2, activo: true },
      { procesoId: procMap.get('Premecanizado')!, nombre: 'Torno', orden: 1, activo: true },
      { procesoId: procMap.get('Premecanizado')!, nombre: 'Fresado', orden: 2, activo: true },
      { procesoId: procMap.get('Saneado')!, nombre: 'Limpieza química', orden: 1, activo: true },
      { procesoId: procMap.get('Saneado')!, nombre: 'Chorro de arena', orden: 2, activo: true },
      { procesoId: procMap.get('Soldadura')!, nombre: 'MIG', orden: 1, activo: true },
      { procesoId: procMap.get('Soldadura')!, nombre: 'TIG', orden: 2, activo: true },
      { procesoId: procMap.get('Soldadura')!, nombre: 'Electrodo revestido', orden: 3, activo: true },
      { procesoId: procMap.get('Esmerilado')!, nombre: 'Desbaste', orden: 1, activo: true },
      { procesoId: procMap.get('Esmerilado')!, nombre: 'Acabado', orden: 2, activo: true },
      { procesoId: procMap.get('Pulido')!, nombre: 'Pulido espejo', orden: 1, activo: true },
      { procesoId: procMap.get('Pulido')!, nombre: 'Pulido mate', orden: 2, activo: true },
      { procesoId: procMap.get('Balanceo')!, nombre: 'Balanceo dinámico', orden: 1, activo: true },
      { procesoId: procMap.get('Balanceo')!, nombre: 'Balanceo estático', orden: 2, activo: true },
    ],
  });
  console.log('✅ Procesos y subprocesos creados');

  // Categorías
  await prisma.categoriaInsumo.createMany({
    data: [
      { nombre: 'Electrodos', descripcion: 'Electrodos revestidos para soldadura', colorClasificacion: '#EF4444', activo: true, creadoPor: 1 },
      { nombre: 'MIG/TIG', descripcion: 'Hilo y varilla para soldadura MIG/TIG', colorClasificacion: '#3B82F6', activo: true, creadoPor: 1 },
      { nombre: 'Discos', descripcion: 'Discos de corte y desbaste', colorClasificacion: '#F59E0B', activo: true, creadoPor: 1 },
      { nombre: 'Lijas', descripcion: 'Lijas de todos los granos', colorClasificacion: '#10B981', activo: true, creadoPor: 1 },
      { nombre: 'Piedras/Esmeriles', descripcion: 'Piedras para esmeril', colorClasificacion: '#8B5CF6', activo: true, creadoPor: 1 },
      { nombre: 'Componentes pistolas', descripcion: 'Piezas y accesorios para pistolas', colorClasificacion: '#EC4899', activo: true, creadoPor: 1 },
      { nombre: 'Accesorios', descripcion: 'Accesorios varios de taller', colorClasificacion: '#6B7280', activo: true, creadoPor: 1 },
      { nombre: 'Herramientas reutilizables', descripcion: 'Herramientas de uso repetido', colorClasificacion: '#14B8A6', activo: true, creadoPor: 1 },
    ],
  });
  console.log('✅ Categorías creadas');

  // Marcas
  await prisma.marca.createMany({
    data: [
      { nombre: '3M', activo: true },
      { nombre: 'Bosch', activo: true },
      { nombre: 'Makita', activo: true },
      { nombre: 'Esab', activo: true },
      { nombre: 'Lincoln Electric', activo: true },
      { nombre: 'Genérico', activo: true },
    ],
  });

  // Modelos
  const marcas = await prisma.marca.findMany();
  const marcaMap = new Map(marcas.map((m) => [m.nombre, m.id]));

  await prisma.modelo.createMany({
    data: [
      { marcaId: marcaMap.get('Esab')!, nombre: 'OK 48.00', tipo: 'Electrodo', activo: true },
      { marcaId: marcaMap.get('Esab')!, nombre: 'OK 61.30', tipo: 'Electrodo inox', activo: true },
      { marcaId: marcaMap.get('Lincoln Electric')!, nombre: 'UltraCore', tipo: 'Hilo MIG', activo: true },
      { marcaId: marcaMap.get('Lincoln Electric')!, nombre: 'BlueMax', tipo: 'Varilla TIG', activo: true },
      { marcaId: marcaMap.get('Bosch')!, nombre: 'Standard Metal', tipo: 'Disco corte', activo: true },
      { marcaId: marcaMap.get('Bosch')!, nombre: 'Standard Inox', tipo: 'Disco corte inox', activo: true },
      { marcaId: marcaMap.get('3M')!, nombre: 'Hookit', tipo: 'Lija orbital', activo: true },
      { marcaId: marcaMap.get('Makita')!, nombre: 'Piedra blanca', tipo: 'Esmeril', activo: true },
      { marcaId: marcaMap.get('Genérico')!, nombre: 'Boquilla MIG', tipo: 'Accesorio', activo: true },
    ],
  });
  console.log('✅ Marcas y modelos creados');

  // Insumos
  const categorias = await prisma.categoriaInsumo.findMany();
  const catMap = new Map(categorias.map((c) => [c.nombre, c.id]));
  const modelos = await prisma.modelo.findMany();
  const modMap = new Map(modelos.map((m) => [m.nombre, m.id]));

  await prisma.insumo.createMany({
    data: [
      { categoriaId: catMap.get('Electrodos')!, codigoInterno: 'ELEC-001', nombre: 'Electrodo OK 48.00 3.25mm', descripcion: 'Electrodo rutilo 3.25mm', unidadMedida: 'kg', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Esab')!, modeloId: modMap.get('OK 48.00')!, stockActual: 50, stockMinimo: 10, colorClasificacion: '#EF4444', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Electrodos')!, codigoInterno: 'ELEC-002', nombre: 'Electrodo OK 61.30 2.5mm', descripcion: 'Electrodo inox 2.5mm', unidadMedida: 'kg', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Esab')!, modeloId: modMap.get('OK 61.30')!, stockActual: 20, stockMinimo: 5, colorClasificacion: '#EF4444', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('MIG/TIG')!, codigoInterno: 'MIG-001', nombre: 'Hilo UltraCore 1.0mm', descripcion: 'Hilo MIG 1.0mm 15kg', unidadMedida: 'kg', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Lincoln Electric')!, modeloId: modMap.get('UltraCore')!, stockActual: 30, stockMinimo: 5, colorClasificacion: '#3B82F6', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('MIG/TIG')!, codigoInterno: 'TIG-001', nombre: 'Varilla BlueMax 2.4mm', descripcion: 'Varilla TIG 2.4mm 5kg', unidadMedida: 'kg', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Lincoln Electric')!, modeloId: modMap.get('BlueMax')!, stockActual: 15, stockMinimo: 3, colorClasificacion: '#3B82F6', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Discos')!, codigoInterno: 'DIS-001', nombre: 'Disco corte 115x1.0', descripcion: 'Disco corte metal 115mm', unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Bosch')!, modeloId: modMap.get('Standard Metal')!, stockActual: 100, stockMinimo: 20, colorClasificacion: '#F59E0B', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Discos')!, codigoInterno: 'DIS-002', nombre: 'Disco corte 115x1.0 Inox', descripcion: 'Disco corte inox 115mm', unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Bosch')!, modeloId: modMap.get('Standard Inox')!, stockActual: 80, stockMinimo: 15, colorClasificacion: '#F59E0B', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Lijas')!, codigoInterno: 'LIJ-001', nombre: 'Lija Hookit P80', descripcion: 'Lija orbital 150mm P80', unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('3M')!, modeloId: modMap.get('Hookit')!, stockActual: 200, stockMinimo: 50, colorClasificacion: '#10B981', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Piedras/Esmeriles')!, codigoInterno: 'ESM-001', nombre: 'Piedra esmeril 6"', descripcion: 'Piedra blanca 6x1"', unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Makita')!, modeloId: modMap.get('Piedra blanca')!, stockActual: 25, stockMinimo: 5, colorClasificacion: '#8B5CF6', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Componentes pistolas')!, codigoInterno: 'PIST-001', nombre: 'Boquilla MIG contacto', descripcion: 'Boquilla contacto M15', unidadMedida: 'unidad', tipoInsumo: 'CONSUMIBLE', marcaId: marcaMap.get('Genérico')!, modeloId: modMap.get('Boquilla MIG')!, stockActual: 40, stockMinimo: 10, colorClasificacion: '#EC4899', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Herramientas reutilizables')!, codigoInterno: 'PIN-001', nombre: 'Pinza amperimétrica digital', descripcion: 'Pinza multímetro reutilizable', unidadMedida: 'unidad', tipoInsumo: 'REUTILIZABLE', marcaId: marcaMap.get('Bosch')!, stockActual: 5, stockMinimo: 1, colorClasificacion: '#14B8A6', activo: true, creadoPor: 1 },
      { categoriaId: catMap.get('Herramientas reutilizables')!, codigoInterno: 'CAL-001', nombre: 'Calibrador digital 150mm', descripcion: 'Calibrador pie de rey digital', unidadMedida: 'unidad', tipoInsumo: 'REUTILIZABLE', marcaId: marcaMap.get('Bosch')!, stockActual: 3, stockMinimo: 1, colorClasificacion: '#14B8A6', activo: true, creadoPor: 1 },
    ],
  });
  console.log('✅ Insumos creados');

  // Costos
  const insumos = await prisma.insumo.findMany();
  const insMap = new Map(insumos.map((i) => [i.codigoInterno, i.id]));

  await prisma.costoInsumo.createMany({
    data: [
      { insumoId: insMap.get('ELEC-001')!, costoUnitario: 8500, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Proveedor Soldadura SA', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('ELEC-002')!, costoUnitario: 12000, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Proveedor Soldadura SA', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('MIG-001')!, costoUnitario: 15000, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Soldaduras del Sur', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('TIG-001')!, costoUnitario: 18000, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Soldaduras del Sur', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('DIS-001')!, costoUnitario: 350, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Ferretería Industrial', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('DIS-002')!, costoUnitario: 420, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Ferretería Industrial', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('LIJ-001')!, costoUnitario: 150, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: '3M Chile', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('ESM-001')!, costoUnitario: 4500, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Esmeriles Ltda', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('PIST-001')!, costoUnitario: 2800, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Accesorios Taller', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('PIN-001')!, costoUnitario: 45000, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Bosch Chile', activo: true, creadoPor: 1 },
      { insumoId: insMap.get('CAL-001')!, costoUnitario: 32000, moneda: 'CLP', fechaDesde: new Date('2026-01-01'), proveedor: 'Bosch Chile', activo: true, creadoPor: 1 },
    ],
  });
  console.log('✅ Costos creados');

  // Órdenes de trabajo
  await prisma.ordenTrabajo.createMany({
    data: [
      { codigo: 'OT-2026-001', descripcion: 'Reparación eje bomba centrífuga', estado: 'ACTIVA', estadoEquipo: 'En reparación', presupuestoEstimado: 2500000, fechaInicio: new Date('2026-05-01'), activo: true, creadoPor: 1 },
      { codigo: 'OT-2026-002', descripcion: 'Recuperación sellos mecánicos', estado: 'ACTIVA', estadoEquipo: 'Recepción', presupuestoEstimado: 1800000, fechaInicio: new Date('2026-05-05'), activo: true, creadoPor: 1 },
      { codigo: 'OT-2026-003', descripcion: 'Reconstrucción rodete turbina', estado: 'ACTIVA', estadoEquipo: 'Premecanizado', presupuestoEstimado: 3500000, fechaInicio: new Date('2026-05-08'), activo: true, creadoPor: 1 },
      { codigo: 'OT-2025-099', descripcion: 'Mantenimiento motor eléctrico 75HP', estado: 'CERRADA', estadoEquipo: 'Completado', presupuestoEstimado: 950000, fechaInicio: new Date('2025-11-10'), activo: true, creadoPor: 1 },
    ],
  });
  console.log('✅ Órdenes de trabajo creadas');

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
