import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function requireRole(...permisosRequeridos: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const tienePermiso = permisosRequeridos.some((p) => req.user!.permisos.includes(p));
    if (!tienePermiso) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
}

export function requireAnyRole(...rolIds: number[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolIds.includes(req.user.rolId)) {
      return res.status(403).json({ error: 'Rol no autorizado' });
    }
    next();
  };
}
