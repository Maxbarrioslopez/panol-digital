import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './devoluciones.service';

export async function listar(_req: AuthRequest, res: Response) {
  const data = await service.listar();
  res.json({ success: true, data });
}

export async function crear(req: AuthRequest, res: Response) {
  const data = await service.crear(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
}
