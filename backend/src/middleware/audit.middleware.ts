import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../config/database';

export function auditMiddleware(tablaAfectada: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Solo auditar operaciones exitosas de escritura
      if (req.method !== 'GET' && res.statusCode < 400 && req.user) {
        prisma.auditoria.create({
          data: {
            tablaAfectada,
            registroId: body?.data?.id || 0,
            accion: req.method,
            usuarioId: req.user.id,
            ipOrigen: req.ip || req.socket.remoteAddress || null,
            datosAnteriores: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
            datosNuevos: body?.data ? JSON.parse(JSON.stringify(body.data)) : null,
          },
        }).catch((e) => console.error('Audit error:', e));
      }

      return originalJson(body);
    };

    next();
  };
}
