import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './solicitudes.service';

export async function listar(req: AuthRequest, res: Response) {
  const esTrabajador = req.user!.rolId === 5;
  const data = await service.listar(esTrabajador ? req.user!.id : undefined);
  res.json({ success: true, data });
}

export async function listarPendientesRecepcion(req: AuthRequest, res: Response) {
  const data = await service.listarPendientesRecepcion(req.user!.id);
  res.json({ success: true, data });
}

export async function obtener(req: AuthRequest, res: Response) {
  const data = await service.obtener(Number(req.params.id));
  res.json({ success: true, data });
}

export async function crear(req: AuthRequest, res: Response) {
  const data = await service.crear(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
}

export async function procesar(req: AuthRequest, res: Response) {
  const data = await service.procesar(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}

export async function entregar(req: AuthRequest, res: Response) {
  const data = await service.entregar(Number(req.params.id), req.user!.id);
  res.json({ success: true, data });
}

export async function confirmarRecepcion(req: AuthRequest, res: Response) {
  const data = await service.confirmarRecepcion(Number(req.params.id), req.user!.id);
  res.json({ success: true, data });
}

export async function anular(req: AuthRequest, res: Response) {
  const data = await service.anular(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}

export async function disputar(req: AuthRequest, res: Response) {
  const data = await service.disputar(Number(req.params.id), req.body, req.user!.id);
  res.json({ success: true, data });
}
