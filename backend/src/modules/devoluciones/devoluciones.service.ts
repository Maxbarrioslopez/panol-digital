import { prisma } from '../../config/database';
import { notificationBus } from '../../websocket/notification-bus';

export async function listar() {
  return prisma.devolucion.findMany({
    include: {
      solicitud: { select: { id: true, ot: { select: { codigo: true } } } },
      trabajador: { select: { id: true, nombre: true } },
      panolero: { select: { id: true, nombre: true } },
      detalles: {
        include: {
          insumo: { select: { nombre: true, codigoInterno: true } },
        },
      },
    },
    orderBy: { fechaDevolucion: 'desc' },
  });
}

export async function crear(data: any, panoleroId: number) {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: data.solicitudId },
    include: { detalles: true },
  });
  if (!solicitud) throw new Error('Solicitud no encontrada');

  const devolucion = await prisma.$transaction(async (tx) => {
    const d = await tx.devolucion.create({
      data: {
        solicitudId: data.solicitudId,
        trabajadorId: data.trabajadorId,
        panoleroId,
        estadoGeneral: data.estadoGeneral,
        observacion: data.observacion,
        detalles: {
          create: data.detalles.map((det: any) => ({
            insumoId: det.insumoId,
            cantidadDevuelta: det.cantidadDevuelta,
            estadoInsumo: det.estadoInsumo || 'BUENO',
            observacion: det.observacion,
          })),
        },
      },
    });

    // Actualizar stock y movimientos
    for (const det of data.detalles) {
      const detalleSolicitud = solicitud.detalles.find((d) => d.insumoId === det.insumoId);
      if (!detalleSolicitud) throw new Error(`Insumo ${det.insumoId} no encontrado en la solicitud`);

        const yaDevuelto = Number(detalleSolicitud.cantidadDevuelta || 0);
        const maximo = Number(detalleSolicitud.cantidadEntregada || 0) - yaDevuelto;
      if (det.cantidadDevuelta > maximo) {
        throw new Error(`No puede devolver más de ${maximo} de ${detalleSolicitud.insumoId}`);
      }

      // Actualizar detalle solicitud
      await tx.detalleSolicitud.update({
        where: { id: detalleSolicitud.id },
        data: {
          cantidadDevuelta: { increment: det.cantidadDevuelta },
          estadoLinea: (yaDevuelto + det.cantidadDevuelta) >= (detalleSolicitud.cantidadEntregada || 0)
            ? 'DEVUELTO_TOTAL'
            : 'DEVUELTO_PARCIAL',
        },
      });

      // Reintegrar stock si está bueno
      if (!det.estadoInsumo || det.estadoInsumo === 'BUENO') {
        await tx.insumo.update({
          where: { id: det.insumoId },
          data: { stockActual: { increment: det.cantidadDevuelta } },
        });
      }

      // Movimiento stock
      await tx.movimientoStock.create({
        data: {
          tipo: 'DEVOLUCION',
          insumoId: det.insumoId,
          cantidad: det.cantidadDevuelta,
          devolucionId: d.id,
          usuarioId: panoleroId,
          observacion: `Devolución solicitud #${data.solicitudId}`,
        },
      });
    }

    return d;
  });

  notificationBus.emitEvent({
    type: 'devolucion-creada',
    room: 'supervisor',
    payload: { devolucionId: devolucion.id, solicitudId: data.solicitudId },
  });

  return devolucion;
}
