import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './ordenes-trabajo.service';

export async function listar(req: AuthRequest, res: Response) {
  const soloActivas = req.user!.rolId === 5; // Trabajador solo ve activas
  const data = await service.listar(soloActivas);
  res.json({ success: true, data });
}

export async function obtener(_req: AuthRequest, res: Response) {
  const data = await service.obtener(Number(_req.params.id));
  res.json({ success: true, data });
}

export async function crear(req: AuthRequest, res: Response) {
  const data = await service.crear(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
}

export async function actualizar(req: AuthRequest, res: Response) {
  const data = await service.actualizar(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}
