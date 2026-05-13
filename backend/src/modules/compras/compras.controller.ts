import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './compras.service';

export async function listar(_req: AuthRequest, res: Response) {
  const data = await service.listar();
  res.json({ success: true, data });
}

export async function crear(req: AuthRequest, res: Response) {
  const data = await service.crear(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
}

export async function autorizar(req: AuthRequest, res: Response) {
  const data = await service.autorizar(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}

export async function recepcionar(req: AuthRequest, res: Response) {
  const data = await service.recepcionar(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}
