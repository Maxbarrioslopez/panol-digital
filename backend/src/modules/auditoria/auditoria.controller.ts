import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export async function listar(req: Request, res: Response) {
  const { tabla, usuarioId, desde, hasta, page = '1', limit = '50' } = req.query;

  const where: any = {};
  if (tabla) where.tablaAfectada = tabla as string;
  if (usuarioId) where.usuarioId = Number(usuarioId);
  if (desde || hasta) {
    where.fechaAccion = {};
    if (desde) where.fechaAccion.gte = new Date(desde as string);
    if (hasta) where.fechaAccion.lte = new Date(hasta as string);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    prisma.auditoria.findMany({
      where,
      include: { usuario: { select: { nombre: true, rut: true } } },
      orderBy: { fechaAccion: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.auditoria.count({ where }),
  ]);

  res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total } });
}
