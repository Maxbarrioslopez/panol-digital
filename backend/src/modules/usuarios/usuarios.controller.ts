import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './usuarios.service';

export async function listar(_req: AuthRequest, res: Response) {
  const data = await service.listar();
  res.json({ success: true, data });
}

export async function obtener(req: AuthRequest, res: Response) {
  const data = await service.obtener(Number(req.params.id));
  res.json({ success: true, data });
}

export async function crear(req: AuthRequest, res: Response) {
  const creadoPor = req.user!.id;
  const data = await service.crear(req.body, creadoPor);
  res.status(201).json({ success: true, data });
}

export async function actualizar(req: AuthRequest, res: Response) {
  const actualizadoPor = req.user!.id;
  const data = await service.actualizar(Number(req.params.id), req.body, actualizadoPor);
  res.json({ success: true, data });
}

export async function desactivar(req: AuthRequest, res: Response) {
  const actualizadoPor = req.user!.id;
  const data = await service.desactivar(Number(req.params.id), actualizadoPor);
  res.json({ success: true, data });
}
