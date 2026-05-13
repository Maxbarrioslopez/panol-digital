import { Router } from 'express';
import { obtenerNoLeidas, marcarLeida } from './notificaciones.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/no-leidas', authMiddleware, obtenerNoLeidas);
router.put('/:id/leida', authMiddleware, marcarLeida);

export { router as notificacionesRouter };
