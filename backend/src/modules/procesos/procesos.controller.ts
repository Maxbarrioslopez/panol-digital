import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

export async function listarProcesos(_req: AuthRequest, res: Response) {
  const data = await prisma.proceso.findMany({
    where: { activo: true },
    include: { subprocesos: { where: { activo: true }, orderBy: { orden: 'asc' } } },
    orderBy: { orden: 'asc' },
  });
  res.json({ success: true, data });
}

export async function listarSubprocesos(req: AuthRequest, res: Response) {
  const data = await prisma.subproceso.findMany({
    where: { procesoId: Number(req.params.procesoId), activo: true },
    orderBy: { orden: 'asc' },
  });
  res.json({ success: true, data });
}

export async function crearProceso(req: AuthRequest, res: Response) {
  const data = req.body;
  const proceso = await prisma.proceso.create({
    data: { nombre: data.nombre, orden: data.orden || 0, activo: true },
  });
  res.status(201).json({ success: true, data: proceso });
}

export async function actualizarProceso(req: AuthRequest, res: Response) {
  const data = req.body;
  const proceso = await prisma.proceso.update({
    where: { id: Number(req.params.id) },
    data: { nombre: data.nombre, orden: data.orden },
  });
  res.json({ success: true, data: proceso });
}

export async function crearSubproceso(req: AuthRequest, res: Response) {
  const data = req.body;
  const subproceso = await prisma.subproceso.create({
    data: {
      procesoId: Number(req.params.procesoId),
      nombre: data.nombre,
      orden: data.orden || 0,
      activo: true,
    },
  });
  res.status(201).json({ success: true, data: subproceso });
}

export async function actualizarSubproceso(req: AuthRequest, res: Response) {
  const data = req.body;
  const subproceso = await prisma.subproceso.update({
    where: { id: Number(req.params.id) },
    data: { nombre: data.nombre, orden: data.orden },
  });
  res.json({ success: true, data: subproceso });
}
