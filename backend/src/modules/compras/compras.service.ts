import { prisma } from '../../config/database';

export async function listar() {
  return prisma.compraAutorizada.findMany({
    include: {
      supervisor: { select: { nombre: true } },
      insumo: { select: { nombre: true, codigoInterno: true } },
    },
    orderBy: { fechaAutorizacion: 'desc' },
  });
}

export async function crear(data: any, supervisorId: number) {
  return prisma.compraAutorizada.create({
    data: {
      supervisorId,
      insumoId: data.insumoId,
      cantidadSolicitada: data.cantidadSolicitada,
      proveedorSugerido: data.proveedorSugerido,
      observacion: data.observacion,
    },
  });
}

export async function autorizar(id: number, data: any, supervisorId: number) {
  return prisma.compraAutorizada.update({
    where: { id },
    data: {
      estado: data.estado || 'AUTORIZADA',
      observacion: data.observacion,
    },
  });
}

export async function recepcionar(id: number, data: any, usuarioId: number) {
  const compra = await prisma.compraAutorizada.findUnique({ where: { id } });
  if (!compra) throw new Error('Compra no encontrada');

  return prisma.$transaction(async (tx) => {
    await tx.compraAutorizada.update({
      where: { id },
      data: {
        cantidadRecibida: data.cantidadRecibida,
        estado: 'RECIBIDA',
        fechaRecepcion: new Date(),
      },
    });

    // Aumentar stock
    await tx.insumo.update({
      where: { id: compra.insumoId },
      data: { stockActual: { increment: data.cantidadRecibida } },
    });

    // Movimiento
    await tx.movimientoStock.create({
      data: {
        tipo: 'ENTRADA_COMPRA',
        insumoId: compra.insumoId,
        cantidad: data.cantidadRecibida,
        usuarioId,
        observacion: `Recepción compra #${id}`,
      },
    });

    // Actualizar costo si viene nuevo
    if (data.costoUnitario) {
      await tx.costoInsumo.create({
        data: {
          insumoId: compra.insumoId,
          costoUnitario: data.costoUnitario,
          moneda: data.moneda || 'CLP',
          fechaDesde: new Date(),
          proveedor: compra.proveedorSugerido,
          creadoPor: usuarioId,
        },
      });
    }

    return tx.compraAutorizada.findUnique({ where: { id } });
  });
}
