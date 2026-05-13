import { prisma } from '../../config/database';

export async function listar(query: any) {
  const where: any = {};
  if (query.insumoId) where.insumoId = Number(query.insumoId);
  if (query.tipo) where.tipo = query.tipo;

  return prisma.movimientoStock.findMany({
    where,
    include: {
      insumo: { select: { nombre: true, codigoInterno: true } },
      usuario: { select: { nombre: true } },
      solicitud: { select: { id: true } },
    },
    orderBy: { fechaMovimiento: 'desc' },
    take: 500,
  });
}

export async function ajustarManual(data: any, usuarioId: number) {
  if (!data.motivo) throw new Error('El motivo del ajuste es obligatorio');

  return prisma.$transaction(async (tx) => {
    const insumo = await tx.insumo.findUnique({ where: { id: data.insumoId } });
    if (!insumo) throw new Error('Insumo no encontrado');

    const nuevoStock = data.nuevoStock !== undefined
      ? data.nuevoStock
      : insumo.stockActual + data.cantidad;

    await tx.insumo.update({
      where: { id: data.insumoId },
      data: { stockActual: nuevoStock },
    });

    const movimiento = await tx.movimientoStock.create({
      data: {
        tipo: 'AJUSTE_MANUAL',
        insumoId: data.insumoId,
        cantidad: data.cantidad || nuevoStock - Number(insumo.stockActual),
        usuarioId,
        observacion: data.motivo,
      },
    });

    return movimiento;
  });
}
