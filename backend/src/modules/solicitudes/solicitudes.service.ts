import { prisma } from '../../config/database';
import { notificationBus } from '../../websocket/notification-bus';

export async function listar(trabajadorId?: number) {
  return prisma.solicitud.findMany({
    where: trabajadorId ? { trabajadorId } : {},
    include: {
      trabajador: { select: { id: true, nombre: true, rut: true } },
      ot: { select: { id: true, codigo: true, descripcion: true } },
      proceso: { select: { id: true, nombre: true } },
      subproceso: { select: { id: true, nombre: true } },
      detalles: {
        include: {
          insumo: { select: { id: true, nombre: true, codigoInterno: true, unidadMedida: true } },
        },
      },
    },
    orderBy: { fechaSolicitud: 'desc' },
  });
}

export async function listarPendientesRecepcion(trabajadorId: number) {
  return prisma.solicitud.findMany({
    where: { trabajadorId, estado: 'ENTREGADA' },
    include: {
      ot: { select: { codigo: true } },
      detalles: {
        include: {
          insumo: { select: { nombre: true } },
        },
      },
    },
  });
}

export async function obtener(id: number) {
  const sol = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      trabajador: { select: { id: true, nombre: true, rut: true } },
      ot: { select: { id: true, codigo: true, descripcion: true } },
      proceso: { select: { id: true, nombre: true } },
      subproceso: { select: { id: true, nombre: true } },
      panoleroPrepara: { select: { id: true, nombre: true } },
      panoleroEntrega: { select: { id: true, nombre: true } },
      detalles: {
        include: {
          insumo: {
            select: {
              id: true, nombre: true, codigoInterno: true,
              unidadMedida: true, stockActual: true, tipoInsumo: true,
            },
          },
          panoleroModifica: { select: { id: true, nombre: true } },
        },
      },
    },
  });
  if (!sol) throw new Error('Solicitud no encontrada');
  return sol;
}

export async function crear(data: any, trabajadorId: number) {
  // 1. Validar que no tenga recepción pendiente
  const recepcionPendiente = await prisma.solicitud.findFirst({
    where: { trabajadorId, estado: 'ENTREGADA' },
  });
  if (recepcionPendiente) {
    throw new Error('Tienes una recepción pendiente. Confirma antes de solicitar nuevos insumos.');
  }

  // 2. Validar OT
  const ot = await prisma.ordenTrabajo.findUnique({ where: { id: data.otId } });
  if (!ot || ot.estado !== 'ACTIVA') throw new Error('La orden de trabajo no existe o no está activa');

  // 3. Validar proceso/subproceso
  const proceso = await prisma.proceso.findUnique({ where: { id: data.procesoId } });
  if (!proceso || !proceso.activo) throw new Error('El proceso no existe o está inactivo');

  if (data.subprocesoId) {
    const sub = await prisma.subproceso.findUnique({ where: { id: data.subprocesoId } });
    if (!sub || sub.procesoId !== data.procesoId) throw new Error('El subproceso no corresponde al proceso seleccionado');
  }

  // 4. Validar insumos y stock
  if (!data.detalles || data.detalles.length === 0) {
    throw new Error('Debes solicitar al menos un insumo');
  }

  const insumoIds = data.detalles.map((d: any) => d.insumoId);
  const insumos = await prisma.insumo.findMany({
    where: { id: { in: insumoIds }, activo: true },
  });

  const insumosMap = new Map<number, any>(insumos.map((i: any) => [i.id, i]));

  for (const det of data.detalles) {
    const insumo = insumosMap.get(det.insumoId);
    if (!insumo) throw new Error(`Insumo ${det.insumoId} no encontrado`);
    if (det.cantidad <= 0) throw new Error(`La cantidad debe ser mayor a 0`);

    // Si no hay stock, requerir justificación
    if (insumo.stockActual < det.cantidad && !data.justificacionSinStock) {
      throw new Error(`Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stockActual}`);
    }
  }

  // 5. Crear solicitud
  const solicitud = await prisma.$transaction(async (tx) => {
    const s = await tx.solicitud.create({
      data: {
        trabajadorId,
        otId: data.otId,
        procesoId: data.procesoId,
        subprocesoId: data.subprocesoId,
        estado: 'PENDIENTE',
        justificacionSinStock: data.justificacionSinStock,
        esUrgente: data.esUrgente || false,
        observaciones: data.observaciones,
        detalles: {
          create: data.detalles.map((det: any) => ({
            insumoId: det.insumoId,
            cantidadSolicitada: det.cantidad,
            estadoLinea: 'SOLICITADO',
          })),
        },
      },
      include: {
        detalles: {
          include: {
            insumo: { select: { nombre: true, codigoInterno: true } },
          },
        },
      },
    });

    return s;
  });

  notificationBus.emitEvent({
    type: 'solicitud-creada',
    room: 'panolero',
    payload: { solicitudId: solicitud.id, trabajadorId: solicitud.trabajadorId, esUrgente: solicitud.esUrgente },
  });
  notificationBus.emitEvent({
    type: 'solicitud-creada',
    room: 'supervisor',
    payload: { solicitudId: solicitud.id, trabajadorId: solicitud.trabajadorId, esUrgente: solicitud.esUrgente },
  });

  return solicitud;
}

export async function procesar(id: number, data: any, panoleroId: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: { detalles: true },
  });
  if (!solicitud) throw new Error('Solicitud no encontrada');
  if (solicitud.estado !== 'PENDIENTE' && solicitud.estado !== 'PARCIAL') {
    throw new Error('La solicitud no puede ser procesada en su estado actual');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Procesar cada ítem
    for (const item of data.items || []) {
      const detalle = solicitud.detalles.find((d) => d.id === item.detalleId);
      if (!detalle) continue;

      if (item.accion === 'anular') {
        await tx.detalleSolicitud.update({
          where: { id: detalle.id },
          data: {
            estadoLinea: 'ANULADO',
            cantidadEntregada: 0,
            motivoAnulacion: item.motivo,
            panoleroModificaId: panoleroId,
          },
        });
      } else if (item.accion === 'modificar') {
        if (!item.justificacion) throw new Error('Se requiere justificación para modificar cantidad');
        await tx.detalleSolicitud.update({
          where: { id: detalle.id },
          data: {
            cantidadEntregada: item.cantidadEntregada,
            justificacionModificacion: item.justificacion,
            panoleroModificaId: panoleroId,
          },
        });
      } else {
        // Entregar completo
        const insumo = await tx.insumo.findUnique({ where: { id: detalle.insumoId } });
        if (!insumo) throw new Error('Insumo no encontrado');

        const cantidad = item.cantidadEntregada !== undefined ? item.cantidadEntregada : detalle.cantidadSolicitada;

        if (insumo.stockActual < cantidad) {
          throw new Error(`Stock insuficiente para ${insumo.nombre}. Disponible: ${insumo.stockActual}`);
        }

        // Descontar stock
        await tx.insumo.update({
          where: { id: insumo.id },
          data: { stockActual: { decrement: cantidad } },
        });

        // Obtener costo histórico
        const costo = await tx.costoInsumo.findFirst({
          where: { insumoId: insumo.id, activo: true },
          orderBy: { fechaDesde: 'desc' },
        });

        await tx.detalleSolicitud.update({
          where: { id: detalle.id },
          data: {
            cantidadEntregada: cantidad,
            estadoLinea: 'ENTREGADO',
            costoUnitarioHistorico: costo?.costoUnitario || 0,
          },
        });
      }
    }

    // Verificar estado final
    const detallesActualizados = await tx.detalleSolicitud.findMany({
      where: { solicitudId: id },
    });

    const todosAnulados = detallesActualizados.every((d) => d.estadoLinea === 'ANULADO');
    const algunosEntregados = detallesActualizados.some((d) => d.estadoLinea === 'ENTREGADO');
    const hayPendientes = detallesActualizados.some((d) => d.estadoLinea === 'SOLICITADO');

    let nuevoEstado = solicitud.estado;
    if (todosAnulados) {
      nuevoEstado = 'ANULADA';
    } else if (algunosEntregados && !hayPendientes) {
      nuevoEstado = 'LISTA_PARA_RETIRO';
    } else if (algunosEntregados && hayPendientes) {
      nuevoEstado = 'PARCIAL';
    }

    const updated = await tx.solicitud.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        panoleroPreparaId: panoleroId,
        fechaPreparacion: new Date(),
      },
      include: { detalles: { include: { insumo: true } } },
    });

    return updated;
  });

  const updated = result;

  if (updated.estado === 'LISTA_PARA_RETIRO' || updated.estado === 'PARCIAL') {
    notificationBus.emitEvent({
      type: 'solicitud-lista',
      room: `trabajador-${solicitud.trabajadorId}`,
      payload: { solicitudId: id, estado: updated.estado },
    });
  }
  if (updated.estado === 'ANULADA') {
    notificationBus.emitEvent({
      type: 'solicitud-anulada',
      room: `trabajador-${solicitud.trabajadorId}`,
      payload: { solicitudId: id, motivo: 'Todos los ítems fueron anulados' },
    });
  }

  return updated;
}

export async function entregar(id: number, panoleroId: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: { detalles: true },
  });
  if (!solicitud) throw new Error('Solicitud no encontrada');
  if (solicitud.estado !== 'LISTA_PARA_RETIRO' && solicitud.estado !== 'PARCIAL') {
    throw new Error('La solicitud no está lista para entregar');
  }

  // Registrar movimientos de stock
  await prisma.$transaction(async (tx) => {
    for (const det of solicitud.detalles) {
      if (det.estadoLinea === 'ENTREGADO' && Number(det.cantidadEntregada) > 0) {
        await tx.movimientoStock.create({
          data: {
            tipo: 'SALIDA_ENTREGA',
            insumoId: det.insumoId,
            cantidad: det.cantidadEntregada,
            costoUnitarioHistorico: det.costoUnitarioHistorico,
            solicitudId: id,
            usuarioId: panoleroId,
            observacion: `Entrega solicitud #${id}`,
          },
        });
      }
    }

    await tx.solicitud.update({
      where: { id },
      data: {
        estado: 'ENTREGADA',
        panoleroEntregaId: panoleroId,
        fechaEntrega: new Date(),
      },
    });
  });

  notificationBus.emitEvent({
    type: 'solicitud-entregada',
    room: `trabajador-${solicitud.trabajadorId}`,
    payload: { solicitudId: id },
  });

  return obtener(id);
}

export async function confirmarRecepcion(id: number, trabajadorId: number) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id } });
  if (!solicitud) throw new Error('Solicitud no encontrada');
  if (solicitud.trabajadorId !== trabajadorId) throw new Error('No autorizado');
  if (solicitud.estado !== 'ENTREGADA') throw new Error('La solicitud no está en estado entregada');

  const updated = await prisma.solicitud.update({
    where: { id },
    data: {
      estado: 'COMPLETADA',
      fechaCierre: new Date(),
    },
    include: {
      detalles: { include: { insumo: true } },
      ot: true,
    },
  });

  notificationBus.emitEvent({
    type: 'solicitud-completada',
    room: 'panolero',
    payload: { solicitudId: id, trabajadorId: updated.trabajadorId },
  });
  notificationBus.emitEvent({
    type: 'solicitud-completada',
    room: 'supervisor',
    payload: { solicitudId: id, trabajadorId: updated.trabajadorId },
  });

  return updated;
}

export async function anular(id: number, data: any, usuarioId: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: { detalles: true },
  });
  if (!solicitud) throw new Error('Solicitud no encontrada');
  if (!data.motivo) throw new Error('El motivo de anulación es obligatorio');

  await prisma.$transaction(async (tx) => {
    // Revertir stock si ya se descontó
    for (const det of solicitud.detalles) {
      if (det.estadoLinea === 'ENTREGADO' && Number(det.cantidadEntregada) > 0) {
        await tx.insumo.update({
          where: { id: det.insumoId },
          data: { stockActual: { increment: det.cantidadEntregada } },
        });

        await tx.movimientoStock.create({
          data: {
            tipo: 'AJUSTE_MANUAL',
            insumoId: det.insumoId,
            cantidad: det.cantidadEntregada,
            solicitudId: id,
            usuarioId,
            observacion: `Reversión por anulación solicitud #${id}: ${data.motivo}`,
          },
        });
      }
    }

    await tx.solicitud.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        motivoAnulacion: data.motivo,
        fechaAnulacion: new Date(),
      },
    });
  });

  notificationBus.emitEvent({
    type: 'solicitud-anulada',
    room: `trabajador-${solicitud.trabajadorId}`,
    payload: { solicitudId: id, motivo: data.motivo },
  });
  notificationBus.emitEvent({
    type: 'solicitud-anulada',
    room: 'supervisor',
    payload: { solicitudId: id, motivo: data.motivo },
  });

  return obtener(id);
}

export async function disputar(id: number, data: any, trabajadorId: number) {
  const solicitud = await prisma.solicitud.findUnique({ where: { id } });
  if (!solicitud) throw new Error('Solicitud no encontrada');
  if (solicitud.trabajadorId !== trabajadorId) throw new Error('No autorizado');
  if (solicitud.estado !== 'ENTREGADA') throw new Error('Solo se puede disputar una solicitud entregada');

  const updated = await prisma.solicitud.update({
    where: { id },
    data: {
      estado: 'EN_DISPUTA',
      observaciones: `${solicitud.observaciones || ''}\n[DISPUTA]: ${data.motivo}`,
    },
  });

  notificationBus.emitEvent({
    type: 'solicitud-disputada',
    room: 'panolero',
    payload: { solicitudId: id, motivo: data.motivo },
  });
  notificationBus.emitEvent({
    type: 'solicitud-disputada',
    room: 'supervisor',
    payload: { solicitudId: id, motivo: data.motivo },
  });

  return updated;
}
