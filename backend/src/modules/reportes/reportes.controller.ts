import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './reportes.service';

export async function stockBajo(_req: AuthRequest, res: Response) {
  const data = await service.stockBajo();
  res.json({ success: true, data });
}

export async function consumoPorCategoria(_req: AuthRequest, res: Response) {
  const data = await service.consumoPorCategoria();
  res.json({ success: true, data });
}

export async function exportarExcel(req: AuthRequest, res: Response) {
  const buffer = await service.exportarExcel(req.body.tipo, req.body.filtros);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');
  res.send(buffer);
}

export async function exportarPDF(req: AuthRequest, res: Response) {
  const buffer = await service.exportarPDF(req.body.tipo, req.body.filtros);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
  res.send(buffer);
}
