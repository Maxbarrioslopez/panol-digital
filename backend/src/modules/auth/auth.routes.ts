import { Router } from 'express';
import { login, refreshToken, recuperarClave, cambiarClave, me, listarRoles } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/recuperar-clave', recuperarClave);
router.post('/cambiar-clave', authMiddleware, cambiarClave);
router.get('/me', authMiddleware, me);
router.get('/roles', authMiddleware, listarRoles);

export { router as authRouter };
