-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'LISTA_PARA_RETIRO', 'ENTREGADA', 'COMPLETADA', 'ANULADA', 'PARCIAL', 'EN_DISPUTA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA_COMPRA', 'SALIDA_ENTREGA', 'DEVOLUCION', 'AJUSTE_MANUAL', 'COMPRA_RECEPCION');

-- CreateEnum
CREATE TYPE "TipoInsumo" AS ENUM ('CONSUMIBLE', 'REUTILIZABLE', 'EQUIPO');

-- CreateEnum
CREATE TYPE "EstadoInsumoDevolucion" AS ENUM ('BUENO', 'DANADO', 'CUARENTENA');

-- CreateEnum
CREATE TYPE "EstadoOT" AS ENUM ('ACTIVA', 'CERRADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoLineaSolicitud" AS ENUM ('SOLICITADO', 'ENTREGADO', 'ANULADO', 'DEVUELTO_PARCIAL', 'DEVUELTO_TOTAL');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('PENDIENTE', 'AUTORIZADA', 'RECHAZADA', 'RECIBIDA');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "nivel_permiso" INTEGER NOT NULL DEFAULT 1,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "modulo" VARCHAR(50) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "rol_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "clave_hash" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "telefono" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "debe_cambiar_clave" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoOT" NOT NULL DEFAULT 'ACTIVA',
    "estado_equipo" VARCHAR(50),
    "presupuesto_estimado" DECIMAL(12,2),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_cierre" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procesos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subprocesos" (
    "id" SERIAL NOT NULL,
    "proceso_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subprocesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_insumo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "color_clasificacion" VARCHAR(7),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "categorias_insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" SERIAL NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "codigo_interno" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" VARCHAR(20) NOT NULL DEFAULT 'unidad',
    "tipo_insumo" "TipoInsumo" NOT NULL DEFAULT 'CONSUMIBLE',
    "marca_id" INTEGER,
    "modelo_id" INTEGER,
    "numero_serie" VARCHAR(100),
    "stock_actual" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado_equipo" VARCHAR(50),
    "color_clasificacion" VARCHAR(7),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "actualizado_por" INTEGER,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" SERIAL NOT NULL,
    "trabajador_id" INTEGER NOT NULL,
    "ot_id" INTEGER NOT NULL,
    "proceso_id" INTEGER NOT NULL,
    "subproceso_id" INTEGER,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_aprobacion" TIMESTAMP(3),
    "fecha_preparacion" TIMESTAMP(3),
    "fecha_entrega" TIMESTAMP(3),
    "fecha_anulacion" TIMESTAMP(3),
    "fecha_cierre" TIMESTAMP(3),
    "panolero_prepara_id" INTEGER,
    "panolero_entrega_id" INTEGER,
    "supervisor_aprueba_id" INTEGER,
    "motivo_rechazo" TEXT,
    "motivo_anulacion" TEXT,
    "justificacion_sin_stock" TEXT,
    "es_urgente" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_solicitud" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad_solicitada" DECIMAL(10,2) NOT NULL,
    "cantidad_entregada" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cantidad_devuelta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado_linea" "EstadoLineaSolicitud" NOT NULL DEFAULT 'SOLICITADO',
    "motivo_anulacion" TEXT,
    "justificacion_modificacion" TEXT,
    "panolero_modifica_id" INTEGER,
    "costo_unitario_historico" DECIMAL(12,2),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalle_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprobaciones_solicitud" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "motivo" TEXT,
    "fecha_aprobacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aprobaciones_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "costo_unitario_historico" DECIMAL(12,2),
    "solicitud_id" INTEGER,
    "devolucion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "observacion" TEXT,
    "fecha_movimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devoluciones" (
    "id" SERIAL NOT NULL,
    "solicitud_id" INTEGER NOT NULL,
    "trabajador_id" INTEGER NOT NULL,
    "panolero_id" INTEGER NOT NULL,
    "estado_general" VARCHAR(50),
    "observacion" TEXT,
    "fecha_devolucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" INTEGER,

    CONSTRAINT "devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_devolucion" (
    "id" SERIAL NOT NULL,
    "devolucion_id" INTEGER NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad_devuelta" DECIMAL(10,2) NOT NULL,
    "estado_insumo" "EstadoInsumoDevolucion" NOT NULL DEFAULT 'BUENO',
    "observacion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_devolucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_insumo" (
    "id" SERIAL NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(12,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'CLP',
    "fecha_desde" TIMESTAMP(3) NOT NULL,
    "fecha_hasta" TIMESTAMP(3),
    "proveedor" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" INTEGER,

    CONSTRAINT "costos_insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_autorizadas" (
    "id" SERIAL NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "insumo_id" INTEGER NOT NULL,
    "cantidad_solicitada" DECIMAL(10,2) NOT NULL,
    "cantidad_recibida" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCompra" NOT NULL DEFAULT 'PENDIENTE',
    "proveedor_sugerido" VARCHAR(100),
    "observacion" TEXT,
    "fecha_autorizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_recepcion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_autorizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "ip_origen" VARCHAR(45),
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "fecha_accion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_rut_key" ON "usuarios"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_codigo_key" ON "ordenes_trabajo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_nombre_key" ON "procesos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_insumo_nombre_key" ON "categorias_insumo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_codigo_interno_key" ON "insumos"("codigo_interno");

-- CreateIndex
CREATE INDEX "solicitudes_trabajador_id_estado_idx" ON "solicitudes"("trabajador_id", "estado");

-- CreateIndex
CREATE INDEX "solicitudes_estado_fecha_solicitud_idx" ON "solicitudes"("estado", "fecha_solicitud");

-- CreateIndex
CREATE INDEX "solicitudes_ot_id_idx" ON "solicitudes"("ot_id");

-- CreateIndex
CREATE INDEX "movimientos_stock_insumo_id_fecha_movimiento_idx" ON "movimientos_stock"("insumo_id", "fecha_movimiento");

-- CreateIndex
CREATE INDEX "movimientos_stock_tipo_idx" ON "movimientos_stock"("tipo");

-- CreateIndex
CREATE INDEX "costos_insumo_insumo_id_fecha_desde_idx" ON "costos_insumo"("insumo_id", "fecha_desde");

-- CreateIndex
CREATE INDEX "auditoria_tabla_afectada_registro_id_idx" ON "auditoria"("tabla_afectada", "registro_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_fecha_accion_idx" ON "auditoria"("usuario_id", "fecha_accion");

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subprocesos" ADD CONSTRAINT "subprocesos_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_ot_id_fkey" FOREIGN KEY ("ot_id") REFERENCES "ordenes_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "procesos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_subproceso_id_fkey" FOREIGN KEY ("subproceso_id") REFERENCES "subprocesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_panolero_prepara_id_fkey" FOREIGN KEY ("panolero_prepara_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_panolero_entrega_id_fkey" FOREIGN KEY ("panolero_entrega_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_supervisor_aprueba_id_fkey" FOREIGN KEY ("supervisor_aprueba_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_solicitud" ADD CONSTRAINT "detalle_solicitud_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_solicitud" ADD CONSTRAINT "detalle_solicitud_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_solicitud" ADD CONSTRAINT "detalle_solicitud_panolero_modifica_id_fkey" FOREIGN KEY ("panolero_modifica_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobaciones_solicitud" ADD CONSTRAINT "aprobaciones_solicitud_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprobaciones_solicitud" ADD CONSTRAINT "aprobaciones_solicitud_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devoluciones" ADD CONSTRAINT "devoluciones_panolero_id_fkey" FOREIGN KEY ("panolero_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_devolucion" ADD CONSTRAINT "detalle_devolucion_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devoluciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_devolucion" ADD CONSTRAINT "detalle_devolucion_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_insumo" ADD CONSTRAINT "costos_insumo_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_autorizadas" ADD CONSTRAINT "compras_autorizadas_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_autorizadas" ADD CONSTRAINT "compras_autorizadas_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
