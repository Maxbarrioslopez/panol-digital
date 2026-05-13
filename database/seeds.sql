-- Seed inicial — Pañol Digital (corregido)
-- Truncar tablas y resetear secuencias
TRUNCATE TABLE auditoria, aprobaciones_solicitud, detalle_devolucion, devoluciones, movimientos_stock, detalle_solicitud, solicitudes, compras_autorizadas, costos_insumo, insumos, modelos, marcas, categorias_insumo, subprocesos, procesos, ordenes_trabajo, rol_permiso, permisos, usuarios, roles RESTART IDENTITY CASCADE;

-- Roles
INSERT INTO roles (nombre, nivel_permiso, descripcion, activo, fecha_creacion, fecha_actualizacion) VALUES
('Superusuario', 100, 'Acceso total al sistema', true, NOW(), NOW()),
('Supervisor', 80, 'Gestión operativa, compras y maestros', true, NOW(), NOW()),
('Pañolero', 60, 'Gestión de entregas, devoluciones y stock', true, NOW(), NOW()),
('Oficina Técnica', 40, 'Análisis de costos y reportes', true, NOW(), NOW()),
('Trabajador', 20, 'Solicitud de insumos por OT', true, NOW(), NOW());

-- Permisos base
INSERT INTO permisos (codigo, nombre, descripcion, modulo) VALUES
('AUTH_LOGIN', 'Iniciar sesión', 'Permite iniciar sesión', 'auth'),
('USUARIO_CREAR', 'Crear usuarios', 'Crear nuevos usuarios', 'usuarios'),
('USUARIO_EDITAR', 'Editar usuarios', 'Editar datos de usuarios', 'usuarios'),
('USUARIO_VER', 'Ver usuarios', 'Ver listado de usuarios', 'usuarios'),
('INSUMO_CREAR', 'Crear insumos', 'Crear nuevos insumos', 'insumos'),
('INSUMO_EDITAR', 'Editar insumos', 'Editar insumos existentes', 'insumos'),
('INSUMO_VER', 'Ver insumos', 'Ver catálogo de insumos', 'insumos'),
('CATEGORIA_CREAR', 'Crear categorías', 'Crear categorías de insumo', 'categorias'),
('CATEGORIA_EDITAR', 'Editar categorías', 'Editar categorías', 'categorias'),
('OT_CREAR', 'Crear OT', 'Crear órdenes de trabajo', 'ordenes_trabajo'),
('OT_EDITAR', 'Editar OT', 'Editar órdenes de trabajo', 'ordenes_trabajo'),
('OT_VER', 'Ver OT', 'Ver órdenes de trabajo', 'ordenes_trabajo'),
('SOLICITUD_CREAR', 'Crear solicitud', 'Solicitar insumos', 'solicitudes'),
('SOLICITUD_VER', 'Ver solicitudes', 'Ver solicitudes', 'solicitudes'),
('SOLICITUD_PROCESAR', 'Procesar solicitud', 'Preparar y entregar solicitudes', 'solicitudes'),
('SOLICITUD_ANULAR', 'Anular solicitud', 'Anular ítems o solicitudes completas', 'solicitudes'),
('DEVOLUCION_CREAR', 'Registrar devolución', 'Reingresar insumos', 'devoluciones'),
('COSTO_VER', 'Ver costos', 'Ver reportes de costos', 'costos'),
('COSTO_EXPORTAR', 'Exportar reportes', 'Exportar a Excel/PDF', 'reportes'),
('COMPRA_AUTORIZAR', 'Autorizar compra', 'Autorizar reposición de stock', 'compras'),
('AUDITORIA_VER', 'Ver auditoría', 'Ver logs de auditoría', 'auditoria'),
('CONFIG_VER', 'Ver configuración', 'Configurar parámetros', 'configuracion');

-- Asignar permisos a roles
-- Superusuario: todos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Supervisor: gestión operativa
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
(2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
(2, 10), (2, 11), (2, 12), (2, 14), (2, 17), (2, 19), (2, 20), (2, 22);

-- Pañolero: operaciones de entrega y devolución
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
(3, 1), (3, 7), (3, 12), (3, 14), (3, 15), (3, 16), (3, 17);

-- Oficina Técnica: reportes
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
(4, 1), (4, 12), (4, 14), (4, 18), (4, 19);

-- Trabajador: solicitar
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
(5, 1), (5, 12), (5, 13);

-- Usuarios iniciales
INSERT INTO usuarios (rut, nombre, email, clave_hash, rol_id, telefono, activo, debe_cambiar_clave, fecha_creacion, fecha_actualizacion, creado_por) VALUES
('1-9', 'Admin Superusuario', 'admin@panoldigital.cl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6', 1, '+56900000001', true, false, NOW(), NOW(), 1),
('12345678-9', 'Juan Pérez', 'juan@panoldigital.cl', '$2b$12$6P6wM0eNwBxnJHhxwGcL9O6jNvR1QaBqZ4J5f8E2Xa9C3d7F1gH0', 2, '+56900000002', true, true, NOW(), NOW(), 1),
('11111111-1', 'Ana López', 'ana@panoldigital.cl', '$2b$12$8R8yN2gPxDzljlzwIeN1QS8lXtT3SCtV6H7j0G4Zb2E5f9H3iJ1', 3, '+56900000003', true, true, NOW(), NOW(), 1),
('22222222-2', 'Pedro Gómez', 'pedro@panoldigital.cl', '$2b$12$0T0aP4iRzFxlmnxyKgP3WU0nZvV5UEvX8J9k2H6Bd4G7i1K5mL3', 5, '+56900000004', true, true, NOW(), NOW(), 1),
('33333333-3', 'María Ruiz', 'maria@panoldigital.cl', '$2b$12$2V2cR6kTzHznopzaMiR5YW2pXxW7WGxZ0L4m8J8Df6I9k3M7oN5', 4, '+56900000005', true, true, NOW(), NOW(), 1);

-- Procesos de reparación
INSERT INTO procesos (nombre, orden, activo) VALUES
('Recepción de componente', 1, true),
('Premecanizado', 2, true),
('Saneado', 3, true),
('Reparación especial', 4, true),
('Soldadura', 5, true),
('Esmerilado', 6, true),
('Alivio de tensiones', 7, true),
('Pulido', 8, true),
('Metalizado', 9, true),
('Balanceo', 10, true);

-- Subprocesos
INSERT INTO subprocesos (proceso_id, nombre, orden, activo) VALUES
(1, 'Inspección inicial', 1, true),
(1, 'Registro fotográfico', 2, true),
(2, 'Torno', 1, true),
(2, 'Fresado', 2, true),
(3, 'Limpieza química', 1, true),
(3, 'Chorro de arena', 2, true),
(4, 'Reparación por soldadura', 1, true),
(4, 'Recubrimiento', 2, true),
(5, 'MIG', 1, true),
(5, 'TIG', 2, true),
(5, 'Electrodo revestido', 3, true),
(6, 'Desbaste', 1, true),
(6, 'Acabado', 2, true),
(7, 'Horno', 1, true),
(8, 'Pulido espejo', 1, true),
(8, 'Pulido mate', 2, true),
(9, 'Proyección térmica', 1, true),
(9, 'HVOF', 2, true),
(10, 'Balanceo dinámico', 1, true),
(10, 'Balanceo estático', 2, true);

-- Categorías de insumo
INSERT INTO categorias_insumo (nombre, descripcion, color_clasificacion, activo, fecha_creacion, fecha_actualizacion, creado_por) VALUES
('Electrodos', 'Electrodos revestidos para soldadura', '#EF4444', true, NOW(), NOW(), 1),
('MIG/TIG', 'Hilo y varilla para soldadura MIG/TIG', '#3B82F6', true, NOW(), NOW(), 1),
('Discos', 'Discos de corte y desbaste', '#F59E0B', true, NOW(), NOW(), 1),
('Lijas', 'Lijas de todos los granos', '#10B981', true, NOW(), NOW(), 1),
('Piedras/Esmeriles', 'Piedras para esmeril', '#8B5CF6', true, NOW(), NOW(), 1),
('Componentes pistolas', 'Piezas y accesorios para pistolas', '#EC4899', true, NOW(), NOW(), 1),
('Accesorios', 'Accesorios varios de taller', '#6B7280', true, NOW(), NOW(), 1),
('Herramientas reutilizables', 'Herramientas de uso repetido', '#14B8A6', true, NOW(), NOW(), 1);

-- Marcas
INSERT INTO marcas (nombre, activo) VALUES
('3M', true),
('Bosch', true),
('Makita', true),
('Esab', true),
('Lincoln Electric', true),
('Genérico', true);

-- Modelos
INSERT INTO modelos (marca_id, nombre, tipo, activo) VALUES
(4, 'OK 48.00', 'Electrodo', true),
(4, 'OK 61.30', 'Electrodo inox', true),
(5, 'UltraCore', 'Hilo MIG', true),
(5, 'BlueMax', 'Varilla TIG', true),
(2, 'Standard Metal', 'Disco corte', true),
(2, 'Standard Inox', 'Disco corte inox', true),
(1, 'Hookit', 'Lija orbital', true),
(3, 'Piedra blanca', 'Esmeril', true),
(6, 'Boquilla MIG', 'Accesorio', true);

-- Insumos
INSERT INTO insumos (categoria_id, codigo_interno, nombre, descripcion, unidad_medida, tipo_insumo, marca_id, modelo_id, stock_actual, stock_minimo, color_clasificacion, activo, fecha_creacion, fecha_actualizacion, creado_por) VALUES
(1, 'ELEC-001', 'Electrodo OK 48.00 3.25mm', 'Electrodo rutilo 3.25mm', 'kg', 'CONSUMIBLE', 4, 1, 50.00, 10.00, '#EF4444', true, NOW(), NOW(), 1),
(1, 'ELEC-002', 'Electrodo OK 61.30 2.5mm', 'Electrodo inox 2.5mm', 'kg', 'CONSUMIBLE', 4, 2, 20.00, 5.00, '#EF4444', true, NOW(), NOW(), 1),
(2, 'MIG-001', 'Hilo UltraCore 1.0mm', 'Hilo MIG 1.0mm 15kg', 'kg', 'CONSUMIBLE', 5, 3, 30.00, 5.00, '#3B82F6', true, NOW(), NOW(), 1),
(2, 'TIG-001', 'Varilla BlueMax 2.4mm', 'Varilla TIG 2.4mm 5kg', 'kg', 'CONSUMIBLE', 5, 4, 15.00, 3.00, '#3B82F6', true, NOW(), NOW(), 1),
(3, 'DIS-001', 'Disco corte 115x1.0', 'Disco corte metal 115mm', 'unidad', 'CONSUMIBLE', 2, 5, 100.00, 20.00, '#F59E0B', true, NOW(), NOW(), 1),
(3, 'DIS-002', 'Disco corte 115x1.0 Inox', 'Disco corte inox 115mm', 'unidad', 'CONSUMIBLE', 2, 6, 80.00, 15.00, '#F59E0B', true, NOW(), NOW(), 1),
(4, 'LIJ-001', 'Lija Hookit P80', 'Lija orbital 150mm P80', 'unidad', 'CONSUMIBLE', 1, 7, 200.00, 50.00, '#10B981', true, NOW(), NOW(), 1),
(5, 'ESM-001', 'Piedra esmeril 6"', 'Piedra blanca 6x1"', 'unidad', 'CONSUMIBLE', 3, 8, 25.00, 5.00, '#8B5CF6', true, NOW(), NOW(), 1),
(6, 'PIST-001', 'Boquilla MIG contacto', 'Boquilla contacto M15', 'unidad', 'CONSUMIBLE', 6, 9, 40.00, 10.00, '#EC4899', true, NOW(), NOW(), 1),
(8, 'PIN-001', 'Pinza amperimétrica digital', 'Pinza multímetro reutilizable', 'unidad', 'REUTILIZABLE', 2, NULL, 5.00, 1.00, '#14B8A6', true, NOW(), NOW(), 1),
(8, 'CAL-001', 'Calibrador digital 150mm', 'Calibrador pie de rey digital', 'unidad', 'REUTILIZABLE', 2, NULL, 3.00, 1.00, '#14B8A6', true, NOW(), NOW(), 1);

-- Costos iniciales
INSERT INTO costos_insumo (insumo_id, costo_unitario, moneda, fecha_desde, proveedor, activo, fecha_creacion, creado_por) VALUES
(1, 8500.00, 'CLP', '2026-01-01', 'Proveedor Soldadura SA', true, NOW(), 1),
(2, 12000.00, 'CLP', '2026-01-01', 'Proveedor Soldadura SA', true, NOW(), 1),
(3, 15000.00, 'CLP', '2026-01-01', 'Soldaduras del Sur', true, NOW(), 1),
(4, 18000.00, 'CLP', '2026-01-01', 'Soldaduras del Sur', true, NOW(), 1),
(5, 350.00, 'CLP', '2026-01-01', 'Ferretería Industrial', true, NOW(), 1),
(6, 420.00, 'CLP', '2026-01-01', 'Ferretería Industrial', true, NOW(), 1),
(7, 150.00, 'CLP', '2026-01-01', '3M Chile', true, NOW(), 1),
(8, 4500.00, 'CLP', '2026-01-01', 'Esmeriles Ltda', true, NOW(), 1),
(9, 2800.00, 'CLP', '2026-01-01', 'Accesorios Taller', true, NOW(), 1),
(10, 45000.00, 'CLP', '2026-01-01', 'Bosch Chile', true, NOW(), 1),
(11, 32000.00, 'CLP', '2026-01-01', 'Bosch Chile', true, NOW(), 1);

-- Órdenes de trabajo
INSERT INTO ordenes_trabajo (codigo, descripcion, estado, estado_equipo, presupuesto_estimado, fecha_inicio, activo, fecha_creacion, fecha_actualizacion, creado_por) VALUES
('OT-2026-001', 'Reparación eje bomba centrífuga', 'ACTIVA', 'En reparación', 2500000.00, '2026-05-01', true, NOW(), NOW(), 1),
('OT-2026-002', 'Recuperación sellos mecánicos', 'ACTIVA', 'Recepción', 1800000.00, '2026-05-05', true, NOW(), NOW(), 1),
('OT-2026-003', 'Reconstrucción rodete turbina', 'ACTIVA', 'Premecanizado', 3500000.00, '2026-05-08', true, NOW(), NOW(), 1),
('OT-2025-099', 'Mantenimiento motor eléctrico 75HP', 'CERRADA', 'Completado', 950000.00, '2025-11-10', true, NOW(), NOW(), 1);
