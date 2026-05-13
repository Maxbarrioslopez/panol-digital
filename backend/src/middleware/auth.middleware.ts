import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    rut: string;
    nombre: string;
    rolId: number;
    permisos: string[];
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, authConfig.jwtSecret) as any;

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      include: {
        rol: {
          include: {
            permisos: { include: { permiso: true } },
          },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }

    req.user = {
      id: usuario.id,
      rut: usuario.rut,
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      permisos: usuario.rol.permisos.map((rp: any) => rp.permiso.codigo),
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
