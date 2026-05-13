import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';

// Por ahora las notificaciones son en tiempo real via Socket.io
// Estos endpoints son para historial futuro

export async function obtenerNoLeidas(_req: AuthRequest, res: Response) {
  res.json({ success: true, data: [] });
}

export async function marcarLeida(_req: AuthRequest, res: Response) {
  res.json({ success: true });
}
