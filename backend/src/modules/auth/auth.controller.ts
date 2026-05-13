import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './auth.service';

export async function login(req: Request, res: Response) {
  try {
    const { rut, clave } = req.body;
    const result = await service.loginService(rut, clave);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    const result = await service.refreshTokenService(refreshToken);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function recuperarClave(req: Request, res: Response) {
  try {
    const { email } = req.body;
    await service.recuperarClaveService(email);
    res.json({ success: true, message: 'Si el email existe, se enviarán instrucciones' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function cambiarClave(req: AuthRequest, res: Response) {
  try {
    const { claveActual, claveNueva } = req.body;
    const userId = req.user!.id;
    await service.cambiarClaveService(userId, claveActual, claveNueva);
    res.json({ success: true, message: 'Clave actualizada' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const result = await service.getMeService(userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listarRoles(_req: Request, res: Response) {
  try {
    const result = await service.listarRoles();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
