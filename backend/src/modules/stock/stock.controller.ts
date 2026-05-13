import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './stock.service';

export async function listar(req: AuthRequest, res: Response) {
  const data = await service.listar(req.query);
  res.json({ success: true, data });
}

export async function ajustarManual(req: AuthRequest, res: Response) {
  const data = await service.ajustarManual(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
}
