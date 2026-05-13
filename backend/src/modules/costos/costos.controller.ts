import { Request, Response } from 'express';
import * as service from './costos.service';

export async function costoPorOT(req: Request, res: Response) {
  const data = await service.costoPorOT(Number(req.params.otId));
  res.json({ success: true, data });
}

export async function costoPorTrabajador(req: Request, res: Response) {
  const data = await service.costoPorTrabajador(Number(req.params.trabajadorId));
  res.json({ success: true, data });
}

export async function presupuestoVsReal(req: Request, res: Response) {
  const data = await service.presupuestoVsReal(req.query as any);
  res.json({ success: true, data });
}

export async function consumoNeto(req: Request, res: Response) {
  const data = await service.consumoNeto(req.query as any);
  res.json({ success: true, data });
}
